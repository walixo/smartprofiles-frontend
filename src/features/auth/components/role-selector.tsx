import { GalleryIcon, UserIcon } from '@/components/ui/icons';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { cn } from '@/lib/cn';
import { SELF_SERVE_ROLES, type SelfServeRole } from '@/shared/vocabulary';

const ROLE_COPY: Record<SelfServeRole, { title: TranslationKey; body: TranslationKey; Icon: typeof UserIcon }> = {
  freelancer: {
    title: 'auth.role.freelancer.title',
    body: 'auth.role.freelancer.body',
    Icon: GalleryIcon,
  },
  client: {
    title: 'auth.role.client.title',
    body: 'auth.role.client.body',
    Icon: UserIcon,
  },
};

export interface RoleSelectorProps {
  value: SelfServeRole | undefined;
  onChange: (role: SelfServeRole) => void;
  error?: string;
  name: string;
}

/**
 * Native radios inside a fieldset, visually replaced by cards.
 *
 * The inputs stay in the DOM (screen-reader- and keyboard-navigable, arrow keys
 * work for free) rather than being rebuilt from divs with ARIA.
 */
export function RoleSelector({ value, onChange, error, name }: RoleSelectorProps) {
  const { t } = useI18n();
  const errorId = `${name}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined} aria-invalid={error ? true : undefined}>
      <legend className="mb-2.5 block text-sm font-semibold text-ink-950 dark:text-paper-100">
        {t('auth.role.legend')}
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        {SELF_SERVE_ROLES.map((role, index) => {
          const { title, body, Icon } = ROLE_COPY[role];
          const isSelected = value === role;

          return (
            <label
              key={role}
              style={{ animationDelay: `${index * 70}ms` }}
              className={cn(
                'group animate-fade-up relative flex cursor-pointer gap-3 rounded-3xl border-2 p-4 transition-colors duration-200',
                isSelected
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50'
                  : 'edge bg-white hover:border-sand-400 dark:bg-ink-900 dark:hover:border-ink-600',
                // The ring follows the input's focus, since the input itself is visually hidden.
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
              )}
            >
              <input
                type="radio"
                name={name}
                value={role}
                checked={isSelected}
                onChange={() => onChange(role)}
                className="sr-only"
              />

              <span
                className={cn(
                  'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200',
                  isSelected
                    ? 'bg-brand-500 text-white'
                    : 'bg-paper-200 text-ink-900 dark:bg-ink-800 dark:text-paper-200',
                )}
              >
                <Icon size={20} />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink-900 dark:text-paper-50">
                  {t(title)}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-ink-900 dark:text-paper-200">
                  {t(body)}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="animate-fade-in mt-2 text-sm font-medium text-danger-600 dark:text-danger-400">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
