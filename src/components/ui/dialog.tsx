import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/i18n-provider';
import { CloseIcon } from './icons';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Modal dialog with a contained focus loop.
 *
 * Focus moves in on open, cycles inside while open, and returns to whatever was
 * focused before on close — otherwise a keyboard user tabs straight out of the
 * dialog into the page behind it.
 */
export function Dialog({ isOpen, onClose, title, description, children, className }: DialogProps) {
  const { t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const focusFirst = useCallback(() => {
    const targets = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (targets?.[0] ?? panelRef.current)?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    restoreTo.current = document.activeElement as HTMLElement | null;
    focusFirst();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const targets = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (targets.length === 0) return;

      const first = targets[0] as HTMLElement;
      const last = targets[targets.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTo.current?.focus();
    };
  }, [isOpen, onClose, focusFirst]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'animate-pop relative w-full max-w-sm rounded-4xl border border-sand-200 bg-white p-6 shadow-lifted outline-none dark:border-ink-800 dark:bg-ink-900',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-ink-900 dark:text-sand-50">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="-mr-1 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-sand-50"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
