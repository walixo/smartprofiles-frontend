import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Deepens the shadow and lifts on hover. Only for cards that are clickable. */
  interactive?: boolean;
}

export function Card({ interactive = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-none border-2 edge bg-paper-50 p-6 slab dark:bg-ink-900',
        // A hard shadow cannot blur on hover, so the card physically rises out
        // of it instead — the brutalist equivalent of an elevation change.
        interactive &&
          'transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lifted',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-black uppercase tracking-tight text-ink-950 dark:text-paper-100', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-[0.9375rem] leading-relaxed text-ink-700 dark:text-paper-300', className)} {...props}>
      {children}
    </p>
  );
}
