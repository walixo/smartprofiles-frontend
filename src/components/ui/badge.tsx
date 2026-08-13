import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'brand' | 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Every badge is a hard-edged rectangle. Because the palette holds two colours,
 * the tones collapse to three treatments — solid brick, solid black, and
 * outlined — and callers keep their existing semantic names.
 *
 * `success` is deliberately solid black rather than green: with no third hue,
 * "confirmed" is expressed as the heaviest possible fill. Every place a tone
 * carries meaning also renders a text label, so nothing rests on colour alone.
 */
const TONES: Record<BadgeTone, string> = {
  brand: 'border-ink-950 bg-brick-500 text-white',
  accent: 'border-ink-950 bg-brick-500 text-white',
  danger: 'border-ink-950 bg-brick-500 text-white',
  warning: 'border-ink-950 bg-brick-100 text-brick-900',
  success: 'border-ink-950 bg-ink-950 text-white dark:border-paper-100',
  neutral: 'border-ink-950 bg-paper-100 text-ink-950 dark:border-paper-100 dark:bg-ink-900 dark:text-paper-100',
  info: 'border-ink-950 bg-paper-50 text-ink-950 dark:border-paper-100 dark:bg-ink-950 dark:text-paper-100',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-none border-2 px-2.5 py-0.5 text-xs font-black uppercase tracking-wide',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
