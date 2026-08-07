import { apiGet } from '@/lib/api-client';
import type { AvailabilityState, CountryCode, DisciplineSlug } from '@/shared/vocabulary';

export interface ProfileSummary {
  id: string;
  handle: string;
  displayName: string;
  headline: string;
  disciplines: DisciplineSlug[];
  country: CountryCode;
  city?: string;
  avatarUrl?: string;
  availability: AvailabilityState;
  workCount: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface BrowseFilters {
  q?: string;
  country?: CountryCode;
  discipline?: DisciplineSlug;
  availability?: AvailabilityState;
  page: number;
}

export function fetchProfiles(filters: BrowseFilters): Promise<{ profiles: ProfileSummary[]; meta: PageMeta }> {
  // Empty values are omitted so the query string stays clean and two equivalent
  // searches share one cache entry.
  const params: Record<string, string | number> = { page: filters.page, limit: 12 };
  if (filters.q) params.q = filters.q;
  if (filters.country) params.country = filters.country;
  if (filters.discipline) params.discipline = filters.discipline;
  if (filters.availability) params.availability = filters.availability;

  return apiGet<{ profiles: ProfileSummary[]; meta: PageMeta }>('/profiles', params);
}
