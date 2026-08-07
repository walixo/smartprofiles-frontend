import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SpinnerIcon } from '@/components/ui/icons';
import { EmptySearchIllustration } from '@/components/ui/illustrations';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { isApiRequestError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import { AVAILABILITY_STATES, COUNTRIES, DISCIPLINES } from '@/shared/vocabulary';
import { BrowseFilters, type FilterState } from '../components/browse-filters';
import { ProfileCard } from '../components/profile-card';
import { useBrowse } from '../hooks/use-browse';

/**
 * Filters live in the URL, not component state.
 *
 * That makes a search shareable, bookmarkable and survivable across a reload,
 * and it makes the browser's back button step through searches the way a user
 * expects rather than leaving the page entirely.
 */
export function BrowsePage() {
  const { t, plural } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<FilterState>(
    () => ({
      q: searchParams.get('q') ?? '',
      country: readEnum(searchParams.get('country'), COUNTRIES),
      discipline: readEnum(searchParams.get('discipline'), DISCIPLINES),
      availability: readEnum(searchParams.get('availability'), AVAILABILITY_STATES),
    }),
    [searchParams],
  );

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const hasFilters = Boolean(filters.q || filters.country || filters.discipline || filters.availability);

  const query = useBrowse({
    page,
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.country ? { country: filters.country } : {}),
    ...(filters.discipline ? { discipline: filters.discipline } : {}),
    ...(filters.availability ? { availability: filters.availability } : {}),
  });

  /**
   * Mirrors the live params so two updates in the same tick compose.
   *
   * `setSearchParams`'s functional form reads the current *location*, which has
   * not changed yet mid-batch — so a debounced search landing in the same tick
   * as a select change would silently drop one of them. Advancing this ref
   * synchronously makes the second call build on the first.
   */
  const paramsRef = useRef(searchParams);
  useEffect(() => {
    paramsRef.current = searchParams;
  }, [searchParams]);

  const applyFilters = useCallback(
    (next: Partial<FilterState>) => {
      const params = new URLSearchParams(paramsRef.current);
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      // Any filter change invalidates the current page number.
      params.delete('page');

      paramsRef.current = params;
      // Replace, so typing a query does not stack a history entry per change.
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const goToPage = useCallback(
    (next: number) => {
      setSearchParams((current) => {
        const params = new URLSearchParams(current);
        if (next <= 1) params.delete('page');
        else params.set('page', String(next));
        return params;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams],
  );

  const clear = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  return (
    <Container className="py-10 sm:py-14">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-sand-50">
          {t('browse.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-ink-600 dark:text-ink-300">{t('browse.subtitle')}</p>
      </header>

      <div className="mt-7">
        <BrowseFilters value={filters} onChange={applyFilters} onClear={clear} hasFilters={hasFilters} />
      </div>

      {query.error ? (
        <Alert tone="danger" className="mt-6">
          {isApiRequestError(query.error)
            ? t(`error.${query.error.code}` as TranslationKey)
            : t('error.UNKNOWN_ERROR')}
        </Alert>
      ) : null}

      {query.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <SpinnerIcon size={20} className="animate-spin text-ink-400" />
        </div>
      ) : query.data && query.data.meta.total === 0 ? (
        <EmptyState />
      ) : query.data ? (
        <>
          {/* Announced politely so a screen reader hears the new count without
              losing the caret position in the search field. */}
          <p
            aria-live="polite"
            className="mt-6 text-sm font-medium text-ink-500 dark:text-ink-400"
          >
            {plural('browse.results', query.data.meta.total)}
          </p>

          <div
            className={cn(
              'mt-4 grid gap-5 @container sm:grid-cols-2 lg:grid-cols-3',
              // Dim while the next page is in flight, without unmounting the grid.
              query.isFetching && 'opacity-60 transition-opacity',
            )}
          >
            {query.data.profiles.map((profile, index) => (
              <ProfileCard key={profile.id} profile={profile} index={index} />
            ))}
          </div>

          {query.data.meta.totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-center gap-4" aria-label={t('browse.title')}>
              <Button variant="outline" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                {t('browse.page.previous')}
              </Button>
              <span className="text-sm font-medium text-ink-600 dark:text-ink-300">
                {t('browse.page.indicator', { page, total: query.data.meta.totalPages })}
              </span>
              <Button
                variant="outline"
                onClick={() => goToPage(page + 1)}
                disabled={!query.data.meta.hasMore}
              >
                {t('browse.page.next')}
              </Button>
            </nav>
          ) : null}
        </>
      ) : null}
    </Container>
  );
}

function EmptyState() {
  const { t } = useI18n();

  return (
    <div className="animate-fade-up flex flex-col items-center py-16 text-center">
      <EmptySearchIllustration label={t('browse.empty.illustrationAlt')} className="w-56" />
      <h2 className="mt-6 text-xl font-bold text-ink-900 dark:text-sand-50">{t('browse.empty.title')}</h2>
      <p className="mt-2 max-w-md text-ink-600 dark:text-ink-300">{t('browse.empty.body')}</p>
    </div>
  );
}

/** Accepts a query-string value only when it is a member of the vocabulary. */
function readEnum<T extends string>(value: string | null, allowed: readonly T[]): T | '' {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : '';
}
