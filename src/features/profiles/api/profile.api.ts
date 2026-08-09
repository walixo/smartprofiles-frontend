import { apiGet } from '@/lib/api-client';
import type {
  AvailabilityState,
  CountryCode,
  Currency,
  DisciplineSlug,
  LanguageLevel,
  LinkKind,
  LocaleCode,
  ViewSource,
} from '@/shared/vocabulary';

export interface PublicWork {
  id: string;
  title: string;
  description?: string;
  year?: number;
  role?: string;
  clientName?: string;
  disciplines: DisciplineSlug[];
  coverImage?: string;
  media: Array<{ url: string; kind: 'image' | 'embed'; alt?: string; width?: number; height?: number }>;
  externalUrl?: string;
  order: number;
}

export interface PublicProfile {
  id: string;
  handle: string;
  displayName: string;
  headline: string;
  bio?: string;
  disciplines: DisciplineSlug[];
  skills: string[];
  country: CountryCode;
  city?: string;
  languages: Array<{ code: LocaleCode; level: LanguageLevel }>;
  avatarUrl?: string;
  coverUrl?: string;
  links: Array<{ label: string; url: string; kind: LinkKind }>;
  rate?: { currency: Currency; dayRateMin?: number; dayRateMax?: number; hourly?: number };
  availability: AvailabilityState;
  contact: {
    /** Only ever present for authenticated viewers when the owner allows it. */
    phone?: string;
    phoneAvailable: boolean;
    allowChat: boolean;
  };
  publishedAt?: string;
  works: PublicWork[];
}

export function fetchProfileByHandle(
  handle: string,
  source: ViewSource,
): Promise<{ profile: PublicProfile }> {
  return apiGet<{ profile: PublicProfile }>(`/profiles/${encodeURIComponent(handle)}`, { source });
}
