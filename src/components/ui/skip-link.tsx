import { useI18n } from '@/i18n/i18n-provider';

/**
 * Visible only on keyboard focus. Lets keyboard and screen-reader users jump
 * past the header without tabbing through every navigation link.
 */
export function SkipLink({ targetId }: { targetId: string }) {
  const { t } = useI18n();

  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lifted focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]"
    >
      {t('common.skipToContent')}
    </a>
  );
}
