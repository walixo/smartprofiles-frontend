import { GalleryIcon } from '@/components/ui/icons';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import type { PublicWork } from '../api/profile.api';

export function WorkCard({ work, index }: { work: PublicWork; index: number }) {
  const { t } = useI18n();
  const cover = work.coverImage ?? work.media.find((item) => item.kind === 'image')?.url;

  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand-200 dark:bg-ink-800">
        {cover ? (
          <img
            src={cover}
            alt={work.media[0]?.alt ?? work.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-ink-400 dark:text-ink-600">
            <GalleryIcon size={34} />
          </span>
        )}

        {work.year ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-ink-800 backdrop-blur dark:bg-ink-950/85 dark:text-sand-100">
            {work.year}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-base font-semibold text-ink-900 dark:text-sand-50">{work.title}</h3>

      {work.role || work.clientName ? (
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          {[work.role, work.clientName].filter(Boolean).join(' · ')}
        </p>
      ) : null}

      {work.disciplines.length > 0 ? (
        <p className="mt-2 text-xs font-medium text-brand-700 dark:text-brand-400">
          {work.disciplines.map((slug) => t(`discipline.${slug}` as TranslationKey)).join(' · ')}
        </p>
      ) : null}
    </>
  );

  const className = 'group animate-fade-up block text-left';
  const style = { animationDelay: `${Math.min(index, 6) * 70}ms` };

  // Only a work with somewhere to go becomes a link; the rest stay inert
  // rather than presenting a clickable affordance that does nothing.
  return work.externalUrl ? (
    <a
      href={work.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} rounded-3xl`}
      style={style}
      aria-label={`${work.title} — ${t('profile.work.view')}`}
    >
      {body}
    </a>
  ) : (
    <article className={className} style={style}>
      {body}
    </article>
  );
}
