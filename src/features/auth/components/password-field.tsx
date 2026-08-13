import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';
import { TextField, type TextFieldProps } from '@/components/ui/text-field';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { cn } from '@/lib/cn';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'trailing' | 'type' | 'value'> {
  /**
   * Current value, used ONLY to score the meter. It is deliberately not passed
   * to the input: react-hook-form registers it uncontrolled, and handing it a
   * `value` as well would make it a controlled input fighting its own ref.
   */
  strengthValue?: string;
  showStrength?: boolean;
}

const STRENGTH_LABELS: Record<number, TranslationKey> = {
  1: 'auth.password.weak',
  2: 'auth.password.fair',
  3: 'auth.password.good',
  4: 'auth.password.strong',
};

const STRENGTH_BAR: Record<number, string> = {
  1: 'w-1/4 bg-danger-500',
  2: 'w-2/4 bg-warning-500',
  3: 'w-3/4 bg-highlight-500',
  4: 'w-full bg-success-500',
};

const STRENGTH_TEXT: Record<number, string> = {
  1: 'text-danger-600 dark:text-danger-400',
  2: 'text-warning-600 dark:text-warning-400',
  3: 'text-highlight-700 dark:text-highlight-400',
  4: 'text-success-600 dark:text-success-400',
};

export function PasswordField({
  id,
  strengthValue = '',
  showStrength = false,
  ...props
}: PasswordFieldProps) {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  const score = scorePassword(strengthValue);
  const meterId = `${id}-strength`;

  return (
    <div className="space-y-2">
      <TextField
        id={id}
        type={isVisible ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={isVisible ? t('auth.password.hide') : t('auth.password.show')}
            aria-pressed={isVisible}
            className="inline-flex size-9 items-center justify-center rounded-xl text-ink-950 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:text-paper-300 dark:hover:bg-ink-800 dark:hover:text-sand-100"
          >
            {isVisible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        }
        {...props}
      />

      {showStrength && strengthValue.length > 0 ? (
        <div className="animate-fade-in space-y-1.5">
          <div
            className="h-1.5 overflow-hidden rounded-none bg-paper-200 dark:bg-ink-800"
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-labelledby={meterId}
          >
            <div
              className={cn(
                'h-full rounded-none transition-[width,background-color] duration-500 ease-out',
                STRENGTH_BAR[score] ?? 'w-0',
              )}
            />
          </div>
          <p id={meterId} className="text-xs font-semibold">
            <span className="text-ink-950 dark:text-paper-300">{t('auth.password.strength')}: </span>
            <span className={STRENGTH_TEXT[score] ?? 'text-ink-950'}>
              {t(STRENGTH_LABELS[score] ?? 'auth.password.weak')}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Coarse 1–4 signal for feedback only — the real policy is enforced by zod on
 * both sides. Length is weighted most heavily because it is what actually
 * resists brute force.
 */
function scorePassword(value: string): number {
  if (value.length === 0) return 0;

  let score = 0;
  if (value.length >= 10) score += 1;
  if (value.length >= 14) score += 1;
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  return Math.min(Math.max(score, 1), 4);
}
