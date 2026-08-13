import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/container';
import { buttonClasses } from '@/components/ui/button';
import { CloseIcon, MenuIcon } from '@/components/ui/icons';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AccountMenu } from '@/features/auth/components/account-menu';
import { useAuth } from '@/features/auth/auth-provider';
import { MessagesNavLink } from '@/features/chat/components/messages-nav-link';

const NAV_ITEMS: Array<{ to: string; key: TranslationKey }> = [
  { to: '/browse', key: 'nav.browse' },
  { to: '/how-it-works', key: 'nav.howItWorks' },
  { to: '/for-freelancers', key: 'nav.forFreelancers' },
];

export function SiteHeader() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // A route change with the mobile sheet open would otherwise leave it covering
  // the new page.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b-4 edge bg-paper-100 dark:bg-ink-950">
      <Container>
        <div className="flex h-18 items-center justify-between gap-4">
          <Link to="/" className="rounded-2xl" aria-label="Smart Profiles — home">
            <Logo />
          </Link>

          <nav aria-label={t('nav.primaryLabel')} className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-none border-2 border-transparent px-3 py-1.5 text-xs font-black uppercase tracking-wide text-ink-950 hover:edge hover:bg-brick-500 hover:text-white dark:text-paper-100 dark:hover:bg-brick-500 dark:hover:text-white"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LocaleSwitcher />
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <MessagesNavLink />
                <AccountMenu className="ml-1" />
              </>
            ) : (
              <>
                <Link to="/signin" className={buttonClasses('ghost', 'sm')}>
                  {t('common.signIn')}
                </Link>
                <Link to="/signup" className={buttonClasses('primary', 'sm')}>
                  {t('common.signUp')}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? t('common.close') : t('common.menu')}
              className="inline-flex size-10 items-center justify-center rounded-none text-ink-700 transition-colors hover:bg-ink-100 dark:text-paper-100 dark:hover:bg-ink-800"
            >
              {isMenuOpen ? <CloseIcon size={21} /> : <MenuIcon size={21} />}
            </button>
          </div>
        </div>
      </Container>

      <div
        id="mobile-navigation"
        hidden={!isMenuOpen}
        className={cn('border-t-2 edge bg-paper-50 md:hidden dark:bg-ink-950')}
      >
        <Container className="flex flex-col gap-1 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-none border-2 border-transparent px-4 py-3 text-xs font-black uppercase tracking-wide text-ink-950 hover:edge hover:bg-brick-500 hover:text-white dark:text-paper-100"
            >
              {t(item.key)}
            </Link>
          ))}

          <div className="mt-2 flex items-center justify-between border-t-2 edge pt-4">
            <LocaleSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <MessagesNavLink />
                <AccountMenu />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/signin" className={buttonClasses('outline', 'sm')}>
                  {t('common.signIn')}
                </Link>
                <Link to="/signup" className={buttonClasses('primary', 'sm')}>
                  {t('common.signUp')}
                </Link>
              </div>
            )}
          </div>
        </Container>
      </div>
    </header>
  );
}
