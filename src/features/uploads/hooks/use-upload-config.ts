import { useQuery } from '@tanstack/react-query';
import { fetchUploadConfig, type UploadConfig } from '../api/upload.api';

/**
 * Whether the server can sign uploads.
 *
 * Fetched once and cached for the session — it is deployment configuration,
 * not data, and cannot change while the app is open.
 */
export function useUploadConfig() {
  return useQuery<UploadConfig>({
    queryKey: ['uploads', 'config'],
    queryFn: fetchUploadConfig,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}
