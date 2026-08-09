import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Role, UserStatus, Visibility } from '@/shared/vocabulary';
import {
  fetchProfiles,
  fetchStats,
  fetchUsers,
  setProfileVisibility,
  setUserStatus,
  type AdminStats,
} from '../api/admin.api';

export function useAdminStats() {
  return useQuery<AdminStats>({ queryKey: ['admin', 'stats'], queryFn: fetchStats, staleTime: 30_000 });
}

export function useAdminUsers(params: { page: number; role?: Role; status?: UserStatus; q?: string }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminProfiles(params: { page: number; visibility?: Visibility; q?: string }) {
  return useQuery({
    queryKey: ['admin', 'profiles', params],
    queryFn: () => fetchProfiles(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Moderation actions invalidate the whole admin namespace rather than patching
 * a row: suspending a user also changes the counts on the overview, and a stale
 * dashboard is exactly what a moderator must not be looking at.
 */
export function useModeration() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
  }, [queryClient]);

  return {
    setStatus: useMutation({
      mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
        setUserStatus(userId, status),
      onSuccess: invalidate,
    }),
    setVisibility: useMutation({
      mutationFn: ({ profileId, visibility }: { profileId: string; visibility: Visibility }) =>
        setProfileVisibility(profileId, visibility),
      onSuccess: invalidate,
    }),
  };
}
