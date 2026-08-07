import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isApiRequestError } from '@/lib/api-error';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/lib/auth-storage';
import {
  fetchCurrentUser,
  login as loginRequest,
  register as registerRequest,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from './api/auth.api';

export const currentUserQueryKey = ['auth', 'me'] as const;

interface AuthContextValue {
  user: AuthUser | null;
  /** True only while an existing token is being exchanged for a session. */
  isResolving: boolean;
  isAuthenticated: boolean;
  signIn: (payload: LoginPayload) => Promise<AuthUser>;
  signUp: (payload: RegisterPayload) => Promise<AuthUser>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Held in state, not read from storage on every render, so a sign-in or
  // sign-out re-renders consumers rather than relying on an unrelated update.
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const { data, isPending, error } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    // No token means no session to resolve — do not fire a request that will 401.
    enabled: token !== null,
    staleTime: 5 * 60_000,
    retry: false,
  });

  // A stored token can outlive its session: expired, revoked, or signed with a
  // different secret. Once the server refuses it, stop sending it.
  useEffect(() => {
    if (!error || !isApiRequestError(error)) return;
    if (error.isUnauthorized || error.isForbidden) {
      clearStoredToken();
      setToken(null);
      queryClient.removeQueries({ queryKey: currentUserQueryKey });
    }
  }, [error, queryClient]);

  const applySession = useCallback(
    (result: { user: AuthUser; token: string }) => {
      setStoredToken(result.token);
      setToken(result.token);
      queryClient.setQueryData(currentUserQueryKey, { user: result.user });
    },
    [queryClient],
  );

  const signInMutation = useMutation({ mutationFn: loginRequest, onSuccess: applySession });
  const signUpMutation = useMutation({ mutationFn: registerRequest, onSuccess: applySession });

  const signIn = useCallback(
    async (payload: LoginPayload) => (await signInMutation.mutateAsync(payload)).user,
    [signInMutation],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) => (await signUpMutation.mutateAsync(payload)).user,
    [signUpMutation],
  );

  const signOut = useCallback(() => {
    clearStoredToken();
    setToken(null);
    // Everything cached was fetched as the signed-out user; none of it should
    // survive into the next session.
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const user = token === null ? null : (data?.user ?? null);
    return {
      user,
      isResolving: token !== null && isPending,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signOut,
    };
  }, [token, data, isPending, signIn, signUp, signOut]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>.');
  }
  return context;
}
