import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { isApiRequestError } from '@/lib/api-error';
import type { Visibility } from '@/shared/vocabulary';
import {
  checkHandle,
  createProfile,
  createWork,
  deleteWork,
  fetchOwnProfile,
  fetchOwnWorks,
  reorderWorks,
  setVisibility,
  updateProfile,
  updateWork,
  type OwnerProfile,
  type OwnerWork,
  type UpdateProfilePayload,
  type WorkPayload,
} from '../api/owner.api';

const profileKey = ['profiles', 'me'] as const;
const worksKey = ['profiles', 'me', 'works'] as const;

/**
 * `undefined` profile means "no profile yet" rather than an error — a freelancer
 * who has not claimed a handle gets a 404 from the API, which is the normal
 * first-run state, not a failure.
 */
export function useOwnProfile() {
  const query = useQuery<{ profile: OwnerProfile }>({
    queryKey: profileKey,
    queryFn: fetchOwnProfile,
    retry: false,
  });

  const isMissing = isApiRequestError(query.error) && query.error.isNotFound;

  return {
    profile: query.data?.profile,
    isPending: query.isPending,
    isMissing,
    error: isMissing ? null : query.error,
  };
}

export function useOwnWorks(enabled: boolean) {
  return useQuery<{ works: OwnerWork[] }>({
    queryKey: worksKey,
    queryFn: fetchOwnWorks,
    enabled,
    retry: false,
  });
}

function useProfileWriter() {
  const queryClient = useQueryClient();
  return useCallback(
    (data: { profile: OwnerProfile }) => {
      queryClient.setQueryData(profileKey, data);
      // The public page is a different cache entry keyed by handle; drop it so
      // "View public page" never shows the pre-save version.
      void queryClient.invalidateQueries({ queryKey: ['profiles', data.profile.handle] });
    },
    [queryClient],
  );
}

export function useCreateProfile() {
  const write = useProfileWriter();
  return useMutation({ mutationFn: createProfile, onSuccess: write });
}

export function useUpdateProfile() {
  const write = useProfileWriter();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: write,
  });
}

export function useSetVisibility() {
  const write = useProfileWriter();
  return useMutation({ mutationFn: (visibility: Visibility) => setVisibility(visibility), onSuccess: write });
}

export function useWorkMutations() {
  const queryClient = useQueryClient();
  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: worksKey });
    void queryClient.invalidateQueries({ queryKey: ['profiles'] });
  }, [queryClient]);

  return {
    create: useMutation({ mutationFn: (payload: WorkPayload) => createWork(payload), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: WorkPayload }) => updateWork(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: string) => deleteWork(id), onSuccess: invalidate }),
    reorder: useMutation({ mutationFn: (order: string[]) => reorderWorks(order), onSuccess: invalidate }),
  };
}

export type HandleStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

/**
 * Debounced availability lookup.
 *
 * Every request carries a sequence number and stale replies are discarded, so
 * a slow early response cannot overwrite the verdict for what is now typed.
 */
export function useHandleAvailability(handle: string, currentHandle?: string): HandleStatus {
  const [status, setStatus] = useState<HandleStatus>('idle');

  useEffect(() => {
    const value = handle.trim().toLowerCase();

    if (value.length === 0 || value === currentHandle) {
      setStatus('idle');
      return undefined;
    }

    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(value)) {
      setStatus('invalid');
      return undefined;
    }

    setStatus('checking');
    let cancelled = false;

    const timer = window.setTimeout(() => {
      checkHandle(value)
        .then((result) => {
          if (!cancelled) setStatus(result.available ? 'available' : 'taken');
        })
        .catch(() => {
          // A rejected lookup (reserved word, rate limit) is not a green light.
          if (!cancelled) setStatus('taken');
        });
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [handle, currentHandle]);

  return status;
}
