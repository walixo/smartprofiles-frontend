import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchProfiles, type BrowseFilters, type PageMeta, type ProfileSummary } from '../api/browse.api';

export function useBrowse(filters: BrowseFilters) {
  return useQuery<{ profiles: ProfileSummary[]; meta: PageMeta }>({
    queryKey: ['browse', filters],
    queryFn: () => fetchProfiles(filters),
    // Keeps the current results on screen while the next page loads, so paging
    // does not blank the grid and collapse the page height under the scroll.
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
