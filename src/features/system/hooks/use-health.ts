import { useQuery } from '@tanstack/react-query';
import { fetchHealth, type HealthPayload } from '../api/health.api';

export const healthQueryKey = ['system', 'health'] as const;

export function useHealth() {
  return useQuery<HealthPayload>({
    queryKey: healthQueryKey,
    queryFn: fetchHealth,
    staleTime: 15_000,
  });
}
