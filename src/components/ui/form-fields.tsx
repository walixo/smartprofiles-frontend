import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { CloseIcon } from './icons';

const CONTROL =
  'w-full rounded-2xl border bg-white px-4 text-[0.9375rem] text-ink-900 transition-colors duration-150 placeholder:text-ink-400 dark:bg-ink-900 dark:text-sand-50 dark:placeholder:text-ink-500';
const CONTROL_IDLE =
  'border-sand-300 hover:border-sand-400 focus:border-brand-500 dark:border-ink-700 dark:hover:border-ink-600 dark:focus:border-brand-500';
const CONTROL_ERROR = 'border-danger-500 focus:border-danger-500';

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink-800 dark:text-sand-200">
      {children}
    </label>
  );
}

function Feedback({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} role="alert" className="animate-fade-in text-sm font-medium text-danger-600 dark:text-danger-400">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="text-sm text-ink-500 dark:text-ink-400">
        {hint}
      </p>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */

export interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

export function TextAreaField({ id, label, hint, error, className, ...props }: TextAreaFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        rows={6}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL, 'py-3 leading-relaxed', error ? CONTROL_ERROR : CONTROL_IDLE, className)}
        {...props}
      />
      <Feedback id={id} hint={hint} error={error} />
    </div>
  );
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

export function SelectField({ id, label, hint, error, options, className, ...props }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL, 'h-12 appearance-none', error ? CONTROL_ERROR : CONTROL_IDLE, className)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Feedback id={id} hint={hint} error={error} />
    </div>
  );
}

/** Checkbox styled as a switch. Stays a real checkbox for keyboard and AT. */
export function SwitchField({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          'mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500',
          checked ? 'bg-brand-500' : 'bg-sand-300 dark:bg-ink-700',
        )}
      >
        <span
          className={cn(
            'size-5 rounded-full bg-white shadow-soft transition-transform duration-200',
            checked && 'translate-x-5',
          )}
        />
      </label>
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-semibold text-ink-800 dark:text-sand-200">
          {label}
        </label>
        {hint ? (
          <p id={`${id}-hint`} className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Multi-select rendered as toggleable chips, backed by real checkboxes. */
export function ChipToggleGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  error,
  max,
}: {
  legend: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T[];
  onChange: (next: T[]) => void;
  error?: string;
  max?: number;
}) {
  const name = useId();
  const atLimit = max !== undefined && value.length >= max;

  return (
    <fieldset>
      <legend className="mb-2.5 block text-sm font-semibold text-ink-800 dark:text-sand-200">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          // Blocking selection at the cap is friendlier than a post-hoc error.
          const isDisabled = !isSelected && atLimit;

          return (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                isSelected
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-sand-300 text-ink-700 hover:border-sand-400 dark:border-ink-700 dark:text-sand-200',
                isDisabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <input
                type="checkbox"
                name={name}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() =>
                  onChange(isSelected ? value.filter((v) => v !== option.value) : [...value, option.value])
                }
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="animate-fade-in mt-2 text-sm font-medium text-danger-600 dark:text-danger-400">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Free-tag input: Enter or comma commits, Backspace on an empty field removes the last. */
export function TagInputField({
  id,
  label,
  hint,
  value,
  onChange,
  max = 20,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const [draft, setDraft] = useState('');

  const commit = (): void => {
    const tag = draft.trim().toLowerCase();
    if (tag.length === 0 || value.includes(tag) || value.length >= max) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2 pb-1">
          {value.map((tag) => (
            <li key={tag}>
              <span className="inline-flex items-center gap-1 rounded-full bg-sand-200 py-1 pl-3 pr-1 text-sm text-ink-800 dark:bg-ink-800 dark:text-sand-200">
                {tag}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((t) => t !== tag))}
                  aria-label={`Remove ${tag}`}
                  className="inline-flex size-5 items-center justify-center rounded-full text-ink-500 hover:bg-ink-300/40 hover:text-ink-900 dark:hover:bg-ink-700 dark:hover:text-sand-50"
                >
                  <CloseIcon size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            commit();
          } else if (event.key === 'Backspace' && draft.length === 0 && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
        disabled={value.length >= max}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(CONTROL, CONTROL_IDLE, 'h-12 disabled:opacity-50')}
      />
      <Feedback id={id} hint={hint} />
    </div>
  );
}

/** Shared shell for the editor's collapsible-free sections. */
export function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-7 dark:border-ink-800 dark:bg-ink-900">
      <h2 className="text-sm font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
