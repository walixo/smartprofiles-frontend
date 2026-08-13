import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AlertIcon, CheckIcon, InfoIcon } from './icons';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

/**
 * Hard-edged notice bar.
 *
 * With no third hue, tone is signalled by fill weight: danger is solid brick,
 * success solid black, warning a brick tint, info plain paper. The icon and the
 * message carry the meaning, so a reader who cannot distinguish the fills still
 * gets the same information.
 */
const TONES: Record<AlertTone, string> = {
  danger: 'bg-brick-500 text-white',
  success: 'bg-ink-950 text-white dark:bg-paper-100 dark:text-ink-950',
  warning: 'bg-brick-100 text-brick-900',
  info: 'bg-paper-50 text-ink-950 dark:bg-ink-900 dark:text-paper-100',
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
      className={cn('flex gap-3 rounded-none border-2 edge p-4 slab', TONES[tone], className)}
    >
      <IconComponent size={20} className="mt-0.5 shrink-0" strokeWidth={2.5} />
      <div className="min-w-0 text-sm font-medium">
        {title ? <p className="font-black uppercase tracking-wide">{title}</p> : null}
        <div className={cn(title && 'mt-0.5', 'leading-relaxed')}>{children}</div>
      </div>
    </div>
  );
}
