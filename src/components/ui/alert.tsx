import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AlertIcon, CheckIcon, InfoIcon } from './icons';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<AlertTone, string> = {
  info: 'border-info-200 bg-info-50 text-info-900 dark:border-info-800 dark:bg-info-950 dark:text-info-100',
  success:
    'border-success-200 bg-success-50 text-success-900 dark:border-success-800 dark:bg-success-950 dark:text-success-100',
  warning:
    'border-warning-100 bg-warning-50 text-warning-900 dark:border-accent-800 dark:bg-accent-950 dark:text-accent-100',
  danger:
    'border-danger-100 bg-danger-50 text-danger-900 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-100',
};

const ICONS: Record<AlertTone, typeof InfoIcon> = {
  info: InfoIcon,
  success: CheckIcon,
  warning: AlertIcon,
  danger: AlertIcon,
};

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const IconComponent = ICONS[tone];

  return (
    <div
      // Errors interrupt; everything else is announced politely.
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-3xl border p-4', TONES[tone], className)}
    >
      <IconComponent size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0 text-sm">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn(title && 'mt-0.5', 'leading-relaxed')}>{children}</div>
      </div>
    </div>
  );
}
