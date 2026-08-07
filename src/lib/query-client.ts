import { QueryClient } from '@tanstack/react-query';
import { isApiRequestError } from './api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      // Retrying a 4xx just delays the error the user needs to see; only
      // transient transport and server failures are worth a second attempt.
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        if (!isApiRequestError(error)) return false;
        return error.status === 0 || error.status >= 500;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
