import { apiGet, apiPatch } from '@/lib/api-client';
import type { CountryCode, Role, UserStatus, Visibility } from '@/shared/vocabulary';

export interface AdminStats {
  users: { total: number; freelancers: number; clients: number; admins: number; suspended: number };
  profiles: { total: number; published: number; drafts: number; unlisted: number };
  content: { works: number; threads: number; messages: number };
}

export interface AdminUserRow {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  handle?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminProfileRow {
  id: string;
  handle: string;
  displayName: string;
  headline: string;
  country: CountryCode;
  visibility: Visibility;
  viewCount: number;
  workCount: number;
  avatarUrl?: string;
  updatedAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export function fetchStats(): Promise<AdminStats> {
  return apiGet<AdminStats>('/admin/stats');
}

export function fetchUsers(params: {
  page: number;
  role?: Role;
  status?: UserStatus;
  q?: string;
}): Promise<{ users: AdminUserRow[]; meta: PageMeta }> {
  return apiGet<{ users: AdminUserRow[]; meta: PageMeta }>('/admin/users', { limit: 20, ...params });
}

export function setUserStatus(userId: string, status: UserStatus): Promise<{ user: AdminUserRow }> {
  return apiPatch<{ user: AdminUserRow }>(`/admin/users/${userId}/status`, { status });
}

export function fetchProfiles(params: {
  page: number;
  visibility?: Visibility;
  country?: CountryCode;
  q?: string;
}): Promise<{ profiles: AdminProfileRow[]; meta: PageMeta }> {
  return apiGet<{ profiles: AdminProfileRow[]; meta: PageMeta }>('/admin/profiles', {
    limit: 20,
    ...params,
  });
}

export function setProfileVisibility(
  profileId: string,
  visibility: Visibility,
): Promise<{ profile: AdminProfileRow }> {
  return apiPatch<{ profile: AdminProfileRow }>(`/admin/profiles/${profileId}/visibility`, {
    visibility,
  });
}
