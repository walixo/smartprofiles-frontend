import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { detectViewSource } from '@/features/analytics/lib/view-source';
import { fetchProfileByHandle, type PublicProfile } from '../api/profile.api';

/**
 * The response varies by viewer — a signed-in visitor may receive the phone
 * number — so the session is part of the cache key. Without it, signing in
 * would keep serving the anonymous copy from cache.
 */
export function useProfile(handle: string) {
  const { user } = useAuth();
  const viewerKey = user?.id ?? 'anonymous';

  // Resolved once per mount, before any client-side navigation can overwrite
  // `document.referrer` — otherwise a QR arrival would be misattributed.
  const [source] = useState(() =>
    detectViewSource(window.location.search, document.referrer, window.location.origin),
  );

  return useQuery<{ profile: PublicProfile }>({
    // `source` is intentionally NOT in the key: it is an attribution detail,
    // not a different resource, and including it would split the cache.
    queryKey: ['profiles', handle, viewerKey],
    queryFn: () => fetchProfileByHandle(handle, source),
    retry: false,
  });
}
