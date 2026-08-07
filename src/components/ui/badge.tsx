import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'brand' | 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<BadgeTone, string> = {
  brand: 'bg-brand-100 text-brand-900 dark:bg-brand-900/50 dark:text-brand-100',
  accent: 'bg-accent-100 text-accent-900 dark:bg-accent-900/50 dark:text-accent-100',
  neutral: 'bg-sand-200 text-ink-800 dark:bg-ink-800 dark:text-sand-200',
  success: 'bg-success-100 text-success-900 dark:bg-success-900/50 dark:text-success-100',
  warning: 'bg-warning-100 text-warning-900 dark:bg-warning-900/50 dark:text-warning-100',
  danger: 'bg-danger-100 text-danger-900 dark:bg-danger-900/50 dark:text-danger-100',
  info: 'bg-info-100 text-info-900 dark:bg-info-900/50 dark:text-info-100',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
