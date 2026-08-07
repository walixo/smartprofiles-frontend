import { apiGet, apiPost } from '@/lib/api-client';
import type { LocaleCode, Role, SelfServeRole, UserStatus } from '@/shared/vocabulary';

/** Mirrors the backend's `PublicUser` DTO. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  displayName: string;
  status: UserStatus;
  locale: LocaleCode;
  createdAt: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  role: SelfServeRole;
  locale?: LocaleCode;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function register(payload: RegisterPayload): Promise<AuthResult> {
  return apiPost<AuthResult>('/auth/register', payload);
}

export function login(payload: LoginPayload): Promise<AuthResult> {
  return apiPost<AuthResult>('/auth/login', payload);
}

export function fetchCurrentUser(): Promise<{ user: AuthUser }> {
  return apiGet<{ user: AuthUser }>('/auth/me');
}
