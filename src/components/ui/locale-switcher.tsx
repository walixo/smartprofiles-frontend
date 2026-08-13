import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { cn } from '@/lib/cn';
import { LOCALES, type LocaleCode } from '@/shared/vocabulary';
import { CheckIcon, ChevronDownIcon, GlobeIcon } from './icons';

/**
 * Keyboard-navigable language menu built on the listbox pattern: arrow keys
 * move the active option, Home/End jump to the ends, Enter/Space commits,
 * Escape closes and returns focus to the trigger.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const listboxId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => indexOfLocale(locale));

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  const close = useCallback((returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const open = useCallback(() => {
    setActiveIndex(indexOfLocale(locale));
    setIsOpen(true);
  }, [locale]);

  // Move DOM focus with the active option so screen readers track the selection.
  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  const commit = useCallback(
    (index: number) => {
      const next = LOCALES[index];
      if (next) setLocale(next);
      close(true);
    },
    [setLocale, close],
  );

  const onListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % LOCALES.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + LOCALES.length) % LOCALES.length);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(LOCALES.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
      default:
        break;
    }
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close(false) : open())}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={`${t('locale.change')} — ${t(languageKey(locale))}`}
        className="inline-flex h-10 items-center gap-1.5 rounded-none px-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-paper-200 dark:hover:bg-ink-800 dark:hover:text-sand-50"
      >
        <GlobeIcon size={18} />
        <span className="uppercase">{locale}</span>
        <ChevronDownIcon size={15} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t('locale.label')}
          onKeyDown={onListKeyDown}
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-3xl border-2 edge bg-white p-1.5 shadow-lifted dark:bg-ink-900"
        >
          {LOCALES.map((code, index) => {
            const isSelected = code === locale;
            return (
              <li
                key={code}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onClick={() => commit(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm outline-none',
                  index === activeIndex
                    ? 'bg-brand-50 text-brand-900 dark:bg-ink-800 dark:text-paper-50'
                    : 'text-ink-700 dark:text-paper-100',
                )}
              >
                <span className={cn(isSelected && 'font-semibold')}>{t(languageKey(code))}</span>
                {isSelected ? <CheckIcon size={16} className="text-brand-500" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function indexOfLocale(locale: LocaleCode): number {
  const index = LOCALES.indexOf(locale);
  return index === -1 ? 0 : index;
}

function languageKey(code: LocaleCode): TranslationKey {
  return `lang.${code}`;
}
