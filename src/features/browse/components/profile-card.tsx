import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import type { AvailabilityState } from '@/shared/vocabulary';
import type { ProfileSummary } from '../api/browse.api';

const AVAILABILITY_TONE: Record<AvailabilityState, 'success' | 'accent' | 'neutral'> = {
  available: 'success',
  'open-to-offers': 'accent',
  unavailable: 'neutral',
};

export function ProfileCard({ profile, index }: { profile: ProfileSummary; index: number }) {
  const { t, plural } = useI18n();

  return (
    <Link
      to={`/@${profile.handle}`}
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className="animate-fade-up group flex h-full flex-col rounded-4xl border border-sand-200 bg-white p-5 shadow-soft transition-shadow duration-200 hover:shadow-lifted dark:border-ink-800 dark:bg-ink-900"
    >
      <div className="flex items-start gap-3.5">
        <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent-400 text-lg font-bold text-white">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            initialsOf(profile.displayName)
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink-900 group-hover:text-brand-600 dark:text-sand-50 dark:group-hover:text-brand-400">
            {profile.displayName}
          </p>
          <p className="mt-0.5 truncate text-xs text-ink-500 dark:text-ink-400">
            {profile.city
              ? `${profile.city} · ${t(`country.${profile.country}` as TranslationKey)}`
              : t(`country.${profile.country}` as TranslationKey)}
          </p>
        </div>
      </div>

      <p className="mt-3.5 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
        {profile.headline}
      </p>

      <ul className="mt-3.5 flex flex-wrap gap-1.5">
        {profile.disciplines.slice(0, 2).map((slug) => (
          <li key={slug}>
            <Badge tone="brand">{t(`discipline.${slug}` as TranslationKey)}</Badge>
          </li>
        ))}
        {profile.disciplines.length > 2 ? (
          <li>
            <Badge tone="neutral">+{profile.disciplines.length - 2}</Badge>
          </li>
        ) : null}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-3.5 dark:border-ink-800">
        <Badge tone={AVAILABILITY_TONE[profile.availability]}>
          {t(`availability.${profile.availability}` as TranslationKey)}
        </Badge>
        <span className="text-xs font-medium text-ink-500 dark:text-ink-400">
          {profile.workCount === 0 ? t('browse.noWorks') : plural('browse.works', profile.workCount)}
        </span>
      </div>
    </Link>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase();
}
