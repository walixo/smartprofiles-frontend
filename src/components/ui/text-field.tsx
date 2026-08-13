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
      <label htmlFor={id} className="block text-xs font-black uppercase tracking-wider text-ink-950 dark:text-paper-100">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            // Square, thick-edged, and it gains a hard shadow on focus rather
            // than a glow — the only elevation move this system has.
            'h-12 w-full rounded-none border-2 edge bg-paper-50 px-4 text-[0.9375rem] font-medium text-ink-950',
            'transition-shadow duration-100 placeholder:text-ink-700 focus:shadow-hard focus:outline-none',
            'dark:bg-ink-950 dark:text-paper-100 dark:placeholder:text-ink-950',
            trailing ? 'pr-12' : null,
            error ? 'border-brick-500 shadow-hard' : null,
            className,
          )}
          {...props}
        />

        {trailing ? (
          <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="animate-fade-in text-sm font-bold text-brick-600 dark:text-brick-400">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-ink-900 dark:text-paper-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
