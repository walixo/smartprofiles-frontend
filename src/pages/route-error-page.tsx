import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { buttonClasses } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { BrokenLinkIllustration } from '@/components/ui/illustrations';
import { useI18n } from '@/i18n/i18n-provider';
import { isApiRequestError } from '@/lib/api-error';
import type { TranslationKey } from '@/i18n/types';

/**
 * Last line of defence for an uncaught render or loader failure. Shows a
 * translated message where the error carries a known code, and never renders
 * a raw stack to the user.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  const { t } = useI18n();

  return (
    <Container width="narrow" className="flex flex-col items-center py-24 text-center">
      <BrokenLinkIllustration className="w-48" />

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink-900 dark:text-paper-50">
        {t('error.title')}
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-900 dark:text-paper-200">
        {describe(error, t)}
      </p>

      <Link to="/" className={buttonClasses('primary', 'lg', 'mt-9')}>
        {t('notFound.action')}
      </Link>
    </Container>
  );
}

function describe(error: unknown, t: (key: TranslationKey) => string): string {
  if (isApiRequestError(error)) {
    const key = `error.${error.code}` as TranslationKey;
    const translated = t(key);
    return translated === key ? error.message : translated;
  }

  if (isRouteErrorResponse(error) && error.status === 404) {
    return t('error.NOT_FOUND');
  }

  return t('error.UNKNOWN_ERROR');
}
