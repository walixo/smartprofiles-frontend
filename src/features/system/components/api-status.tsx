import { Badge } from '@/components/ui/badge';
import { SpinnerIcon } from '@/components/ui/icons';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { isApiRequestError } from '@/lib/api-error';
import { useHealth } from '../hooks/use-health';

/**
 * Live API status.
 *
 * This is the working proof that the whole client data path is wired: Axios
 * client → envelope unwrapping → TanStack Query cache → typed error with a
 * stable code → translated message. It is deliberately the one place in the
 * foundation that talks to the server.
 */
export function ApiStatus() {
  const { t } = useI18n();
  const { data, isPending, error } = useHealth();

  if (isPending) {
    return (
      <Badge tone="neutral">
        <SpinnerIcon size={12} className="animate-spin" />
        {t('common.loading')}
      </Badge>
    );
  }

  if (error) {
    return <Badge tone="danger">{translateError(error, t)}</Badge>;
  }

  const isConnected = data.status === 'ok';

  return (
    <Badge tone={isConnected ? 'success' : 'warning'}>
      <span
        className={
          isConnected
            ? 'size-2 rounded-none bg-success-500 dark:bg-success-300'
            : 'size-2 rounded-none bg-warning-500'
        }
      />
      API · {data.environment} · {data.database}
    </Badge>
  );
}

/**
 * Prefers a translated message for the API's stable error code and falls back
 * to the server's own text — keeping the API authoritative for anything the
 * client does not yet have a translation for.
 */
function translateError(error: unknown, t: (key: TranslationKey) => string): string {
  if (!isApiRequestError(error)) return t('error.UNKNOWN_ERROR');

  const key = `error.${error.code}` as TranslationKey;
  const translated = t(key);

  return translated === key ? error.message : translated;
}
