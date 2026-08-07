import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a hover lift. Only use on cards that are actually clickable. */
  interactive?: boolean;
}

export function Card({ interactive = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-4xl border border-sand-200/80 bg-white p-6 shadow-soft dark:border-ink-800 dark:bg-ink-900',
        interactive && 'transition-shadow duration-200 hover:shadow-lifted',
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
    <h3 className={cn('text-lg font-semibold text-ink-900 dark:text-sand-50', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-[0.9375rem] leading-relaxed text-ink-600 dark:text-ink-300', className)} {...props}>
      {children}
    </p>
  );
}
