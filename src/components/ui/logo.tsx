import { cn } from '@/lib/cn';

/**
 * Placeholder wordmark.
 *
 * The real Smart logo is a hand-lettered script that cannot be reproduced
 * faithfully as hand-coded paths — drop the official SVG in here when it is
 * available. Until then this renders a clean coral mark that carries the brand
 * colour and works on both themes.
 */
export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        <rect width="34" height="34" rx="11" className="fill-brand-500" />
        <path
          d="M22.4 11.6c-1.5-1.2-3.4-1.8-5.3-1.7-2.6.1-4.4 1.4-4.4 3.3 0 1.7 1.4 2.6 4.3 3.3 3.4.8 5.3 2.1 5.3 4.7 0 2.9-2.7 4.8-6.4 4.8-2.3 0-4.4-.7-5.9-2"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark ? (
        <span className="text-xl font-bold tracking-tight text-ink-900 italic dark:text-sand-50">
          Smart
        </span>
      ) : null}
    </span>
  );
}
