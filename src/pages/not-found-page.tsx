import { Link } from 'react-router';
import { buttonClasses } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { BrokenLinkIllustration } from '@/components/ui/illustrations';
import { useI18n } from '@/i18n/i18n-provider';

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <Container width="narrow" className="flex flex-col items-center py-24 text-center">
      <BrokenLinkIllustration className="w-56" />

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-sand-50">
        {t('notFound.title')}
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-600 dark:text-ink-300">
        {t('notFound.body')}
      </p>

      <Link to="/" className={buttonClasses('primary', 'lg', 'mt-9')}>
        {t('notFound.action')}
      </Link>
    </Container>
  );
}
