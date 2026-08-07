import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { fetchProfileByHandle, type PublicProfile } from '../api/profile.api';

/**
 * The response varies by viewer — a signed-in visitor may receive the phone
 * number — so the session is part of the cache key. Without it, signing in
 * would keep serving the anonymous copy from cache.
 */
export function useProfile(handle: string) {
  const { user } = useAuth();
  const viewerKey = user?.id ?? 'anonymous';

  return useQuery<{ profile: PublicProfile }>({
    queryKey: ['profiles', handle, viewerKey],
    queryFn: () => fetchProfileByHandle(handle),
    retry: false,
  });
}
