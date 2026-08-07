import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  /** Persistent helper text. Hidden from assistive tech once an error replaces it. */
  hint?: string;
  error?: string;
  /** Rendered inside the input on the trailing edge — e.g. a show/hide toggle. */
  trailing?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Label, control, hint and error in one component.
 *
 * Bundled deliberately: `aria-invalid` and `aria-describedby` have to agree
 * with what is actually rendered, and splitting them across call sites is how
 * that wiring silently rots.
 */
export function TextField({
  id,
  label,
  hint,
  error,
  trailing,
  className,
  ref,
  ...props
}: TextFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink-800 dark:text-sand-200">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'h-12 w-full rounded-2xl border bg-white px-4 text-[0.9375rem] text-ink-900 transition-colors duration-150 placeholder:text-ink-400 dark:bg-ink-900 dark:text-sand-50 dark:placeholder:text-ink-500',
            trailing ? 'pr-12' : null,
            error
              ? 'border-danger-500 focus:border-danger-500'
              : 'border-sand-300 hover:border-sand-400 focus:border-brand-500 dark:border-ink-700 dark:hover:border-ink-600 dark:focus:border-brand-500',
            className,
          )}
          {...props}
        />

        {trailing ? (
          <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="animate-fade-in text-sm font-medium text-danger-600 dark:text-danger-400">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-ink-500 dark:text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
