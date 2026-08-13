import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { ChevronDownIcon, ShieldIcon, SignOutIcon, UserIcon } from '@/components/ui/icons';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { cn } from '@/lib/cn';
import { useAuth } from '../auth-provider';

/** Signed-in identity plus sign-out. Escape closes and returns focus to the trigger. */
export function AccountMenu({ className }: { className?: string }) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const menuId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isOpen) firstItemRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, close]);

  if (!user) return null;

  const roleKey = `role.${user.role}` as TranslationKey;

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={`${t('auth.menu.open')} — ${user.displayName}`}
        className="inline-flex h-10 items-center gap-2 rounded-none border-2 edge pl-1.5 pr-3 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-none bg-brand-500 text-xs font-bold text-white">
          {initialsOf(user.displayName)}
        </span>
        <span className="hidden max-w-28 truncate text-sm font-semibold text-ink-950 sm:block dark:text-paper-100">
          {user.displayName}
        </span>
        <ChevronDownIcon size={15} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t('auth.menu.open')}
          className="animate-pop absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-3xl border-2 edge bg-white p-1.5 shadow-lifted dark:bg-ink-900"
        >
          <div className="px-3.5 py-3">
            <p className="text-xs font-medium text-ink-950 dark:text-paper-300">
              {t('auth.menu.signedInAs')}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink-900 dark:text-paper-50">
              {user.email}
            </p>
            <Badge tone="brand" className="mt-2">
              <UserIcon size={13} />
              {t(roleKey)}
            </Badge>
          </div>

          <div className="my-1 h-px bg-paper-200 dark:bg-ink-800" />

          {user.role === 'admin' ? (
            <Link
              to="/admin"
              role="menuitem"
              onClick={() => close(false)}
              className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-ink-700 outline-none hover:bg-ink-100 focus-visible:bg-ink-100 dark:text-paper-100 dark:hover:bg-ink-800"
            >
              <ShieldIcon size={17} />
              {t('admin.nav')}
            </Link>
          ) : null}

          <Link
            to="/me"
            role="menuitem"
            onClick={() => close(false)}
            className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-ink-700 outline-none hover:bg-ink-100 focus-visible:bg-ink-100 dark:text-paper-100 dark:hover:bg-ink-800"
          >
            <UserIcon size={17} />
            {t('editor.title')}
          </Link>

          <button
            ref={firstItemRef}
            type="button"
            role="menuitem"
            onClick={() => {
              close(false);
              signOut();
            }}
            className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium text-ink-700 outline-none hover:bg-ink-100 focus-visible:bg-ink-100 dark:text-paper-100 dark:hover:bg-ink-800 dark:focus-visible:bg-ink-800"
          >
            <SignOutIcon size={17} />
            {t('common.signOut')}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}
