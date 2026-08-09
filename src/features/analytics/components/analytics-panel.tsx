import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EditorSection } from '@/components/ui/form-fields';
import { SpinnerIcon } from '@/components/ui/icons';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { cn } from '@/lib/cn';
import { VIEW_SOURCES } from '@/shared/vocabulary';
import { fetchAnalytics, type AnalyticsSummary } from '../api/analytics.api';
import { ViewsChart } from './views-chart';

const RANGES = [7, 30, 90] as const;

/** Bar colour per source. QR is the brand colour — it is the headline number. */
const SOURCE_TONE: Record<string, string> = {
  qr: 'bg-brand-500',
  browse: 'bg-accent-500',
  internal: 'bg-highlight-500',
  external: 'bg-info-500',
  direct: 'bg-ink-400 dark:bg-ink-500',
};

export function AnalyticsPanel() {
  const { t, formatNumber } = useI18n();
  const [days, setDays] = useState<number>(30);

  const { data, isPending } = useQuery<AnalyticsSummary>({
    queryKey: ['profiles', 'me', 'analytics', days],
    queryFn: () => fetchAnalytics(days),
    staleTime: 60_000,
  });

  return (
    <EditorSection title={t('analytics.title')}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-6">
          <Figure label={t('analytics.total')} value={formatNumber(data?.totalViews ?? 0)} />
          <Figure
            label={t('analytics.window', { days })}
            value={formatNumber(data?.windowViews ?? 0)}
          />
        </div>

        <div role="group" aria-label={t('analytics.range')} className="flex gap-1">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              aria-pressed={days === range}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                days === range
                  ? 'bg-brand-500 text-white'
                  : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
              )}
            >
              {t(`analytics.range.${range}` as TranslationKey)}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <div className="flex h-32 items-center justify-center">
          <SpinnerIcon size={18} className="animate-spin text-ink-400" />
        </div>
      ) : !data || data.totalViews === 0 ? (
        <p className="py-8 text-center text-sm text-ink-500 dark:text-ink-400">{t('analytics.none')}</p>
      ) : (
        <>
          <ViewsChart daily={data.daily} label={t('analytics.chartLabel')} />

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              {t('analytics.sources')}
            </h3>
            <ul className="mt-3 space-y-2">
              {VIEW_SOURCES.map((source) => {
                const count = data.bySource.find((entry) => entry.source === source)?.count ?? 0;
                const share = data.windowViews === 0 ? 0 : (count / data.windowViews) * 100;

                return (
                  <li key={source} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-sm text-ink-700 dark:text-sand-200">
                      {t(`viewSource.${source}` as TranslationKey)}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand-200 dark:bg-ink-800">
                      <span
                        className={cn('block h-full rounded-full transition-[width] duration-500', SOURCE_TONE[source])}
                        style={{ width: `${share}%` }}
                      />
                    </span>
                    <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-ink-900 dark:text-sand-50">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-ink-500 dark:text-ink-400">{t('viewSource.qrHint')}</p>
          </div>
        </>
      )}
    </EditorSection>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-ink-900 tabular-nums dark:text-sand-50">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-500 dark:text-ink-400">{label}</p>
    </div>
  );
}
