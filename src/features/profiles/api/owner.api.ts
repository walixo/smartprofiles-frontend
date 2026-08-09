import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type {
  AvailabilityState,
  CountryCode,
  Currency,
  DisciplineSlug,
  LanguageLevel,
  LinkKind,
  LocaleCode,
  Visibility,
  WorkVisibility,
} from '@/shared/vocabulary';

/** Everything the owner sees, including what the public read strips out. */
export interface OwnerProfile {
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
  rate?: { currency: Currency; dayRateMin?: number; dayRateMax?: number; hourly?: number; visible: boolean };
  availability: AvailabilityState;
  contact: { phone?: string; showPhone: boolean; allowChat: boolean };
  visibility: Visibility;
  viewCount: number;
  publishedAt?: string;
  updatedAt: string;
}

export interface OwnerWork {
  id: string;
  title: string;
  description?: string;
  year?: number;
  role?: string;
  clientName?: string;
  disciplines: DisciplineSlug[];
  coverImage?: string;
  media: Array<{ url: string; kind: 'image' | 'embed'; alt?: string }>;
  externalUrl?: string;
  order: number;
  visibility: WorkVisibility;
  updatedAt: string;
}

export type CreateProfilePayload = {
  handle: string;
  headline: string;
  disciplines: DisciplineSlug[];
  country: CountryCode;
  /** Optional at claim time; the server falls back to the account avatar. */
  avatarUrl?: string;
};

export type UpdateProfilePayload = Partial<
  Omit<OwnerProfile, 'id' | 'displayName' | 'visibility' | 'viewCount' | 'publishedAt' | 'updatedAt'>
>;

export type WorkPayload = Partial<Omit<OwnerWork, 'id' | 'order' | 'updatedAt'>>;

export function fetchOwnProfile(): Promise<{ profile: OwnerProfile }> {
  return apiGet<{ profile: OwnerProfile }>('/profiles/me');
}

export function checkHandle(handle: string): Promise<{ handle: string; available: boolean }> {
  return apiGet<{ handle: string; available: boolean }>('/profiles/handle-available', { handle });
}

export function createProfile(payload: CreateProfilePayload): Promise<{ profile: OwnerProfile }> {
  return apiPost<{ profile: OwnerProfile }>('/profiles', payload);
}

export function updateProfile(payload: UpdateProfilePayload): Promise<{ profile: OwnerProfile }> {
  return apiPatch<{ profile: OwnerProfile }>('/profiles/me', payload);
}

export function setVisibility(visibility: Visibility): Promise<{ profile: OwnerProfile }> {
  return apiPatch<{ profile: OwnerProfile }>('/profiles/me/visibility', { visibility });
}

export function fetchOwnWorks(): Promise<{ works: OwnerWork[] }> {
  return apiGet<{ works: OwnerWork[] }>('/profiles/me/works');
}

export function createWork(payload: WorkPayload): Promise<{ work: OwnerWork }> {
  return apiPost<{ work: OwnerWork }>('/profiles/me/works', payload);
}

export function updateWork(id: string, payload: WorkPayload): Promise<{ work: OwnerWork }> {
  return apiPatch<{ work: OwnerWork }>(`/profiles/me/works/${id}`, payload);
}

export function deleteWork(id: string): Promise<unknown> {
  return apiDelete<unknown>(`/profiles/me/works/${id}`);
}

export function reorderWorks(order: string[]): Promise<{ works: OwnerWork[] }> {
  return apiPatch<{ works: OwnerWork[] }>('/profiles/me/works/reorder', { order });
}
