import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/theme-provider';
import { MoonIcon, SunIcon } from './icons';

/**
 * Single-button theme switch. The icon shows the theme you will get, and the
 * accessible name says so explicitly — an unlabelled sun/moon is ambiguous to
 * a screen reader user who cannot see the current background.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const goingDark = theme === 'light';
  const label = goingDark ? t('theme.switchToDark') : t('theme.switchToLight');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-sand-300 dark:hover:bg-ink-800 dark:hover:text-sand-50',
        className,
      )}
    >
      {goingDark ? <MoonIcon size={19} /> : <SunIcon size={19} />}
    </button>
  );
}
