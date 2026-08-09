import { apiGet } from '@/lib/api-client';
import type { ViewSource } from '@/shared/vocabulary';

export interface AnalyticsSummary {
  totalViews: number;
  windowViews: number;
  days: number;
  bySource: Array<{ source: ViewSource; count: number }>;
  daily: Array<{ day: string; count: number }>;
}

export function fetchAnalytics(days: number): Promise<AnalyticsSummary> {
  return apiGet<AnalyticsSummary>('/profiles/me/analytics', { days });
}
