import { Link } from 'react-router';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';
import { useI18n } from '@/i18n/i18n-provider';

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sand-200 bg-sand-100 dark:border-ink-800 dark:bg-ink-950">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              {t('footer.tagline')}
            </p>
          </div>

          <FooterColumn
            title={t('footer.product')}
            links={[
              { to: '/browse', label: t('nav.browse') },
              { to: '/how-it-works', label: t('nav.howItWorks') },
            ]}
          />

          <FooterColumn
            title={t('footer.legal')}
            links={[
              { to: '/privacy', label: t('footer.privacy') },
              { to: '/terms', label: t('footer.terms') },
            ]}
          />
        </div>

        <p className="mt-12 border-t border-sand-200 pt-6 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400">
          © {year} Smart Profiles. {t('footer.rights')}
        </p>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ to: string; label: string }> }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="rounded text-sm text-ink-600 transition-colors hover:text-brand-600 dark:text-sand-300 dark:hover:text-brand-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
