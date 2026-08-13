import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SpinnerIcon } from './icons';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Square, thick-edged, sitting on a hard offset shadow that it drops into when
 * pressed. `slab-press` does the physical move; nothing here fades or tints.
 */
const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-2 edge font-black uppercase tracking-wide ' +
  'disabled:pointer-events-none disabled:opacity-40';

/**
 * Variant sets stay mutually exclusive — `cn` joins classes but does not
 * resolve Tailwind conflicts.
 *
 * With two colours available, severity is carried by fill rather than hue:
 * brick is the brand action, solid black is neutral-strong, and destructive is
 * black with brick lettering so it reads as severe without inventing a colour.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'slab slab-press bg-brick-500 text-white hover:bg-brick-600',
  secondary: 'slab slab-press bg-ink-950 text-white hover:bg-ink-800 dark:bg-paper-100 dark:text-ink-950 dark:hover:bg-white',
  outline: 'slab slab-press bg-paper-50 text-ink-950 hover:bg-paper-200 dark:bg-ink-950 dark:text-paper-100 dark:hover:bg-ink-800',
  // No slab: a ghost button is flat by definition.
  ghost: 'border-transparent bg-transparent text-ink-950 hover:bg-paper-200 dark:text-paper-100 dark:hover:bg-ink-800',
  danger: 'slab slab-press bg-ink-950 text-brick-400 hover:bg-brick-950 dark:bg-brick-500 dark:text-white',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction without changing the button's width. */
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading || undefined}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {isLoading ? <SpinnerIcon size={16} className="animate-spin" /> : leadingIcon}
      {children}
      {!isLoading && trailingIcon}
    </button>
  );
}

/** Same treatment for elements that must render as an anchor or router `<Link>`. */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}
