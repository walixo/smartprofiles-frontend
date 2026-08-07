import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SpinnerIcon } from './icons';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-55';

/**
 * Variant class sets are kept mutually exclusive on purpose — `cn` joins
 * classes but does not resolve Tailwind conflicts the way `tailwind-merge` would.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 text-white shadow-soft hover:bg-brand-600 dark:hover:bg-brand-400',
  secondary:
    'bg-ink-900 text-sand-50 shadow-soft hover:bg-ink-800 dark:bg-sand-100 dark:text-ink-900 dark:hover:bg-white',
  outline:
    'border border-ink-200 text-ink-900 hover:bg-ink-100 dark:border-ink-700 dark:text-sand-100 dark:hover:bg-ink-900',
  ghost: 'text-ink-700 hover:bg-ink-100 dark:text-sand-200 dark:hover:bg-ink-900',
  danger: 'bg-danger-500 text-white shadow-soft hover:bg-danger-600',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
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

/**
 * Same visual treatment for elements that must render as an anchor or router
 * `<Link>` for correct semantics.
 */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}
