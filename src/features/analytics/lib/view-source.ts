import type { ViewSource } from '@/shared/vocabulary';

/** Query parameter the QR code carries so a scan is distinguishable. */
export const QR_SOURCE_PARAM = 's';
export const QR_SOURCE_VALUE = 'qr';

/**
 * Works out how the visitor reached this profile.
 *
 * Deliberately coarse and privacy-cheap: it reads only the URL and
 * `document.referrer`, stores nothing, and never identifies anyone. The value
 * is self-reported to the API and therefore spoofable — fine, because these are
 * vanity counters for the freelancer, not analytics anyone bills against.
 */
export function detectViewSource(search: string, referrer: string, origin: string): ViewSource {
  if (new URLSearchParams(search).get(QR_SOURCE_PARAM) === QR_SOURCE_VALUE) return 'qr';

  if (!referrer) return 'direct';

  let referrerUrl: URL;
  try {
    referrerUrl = new URL(referrer);
  } catch {
    return 'direct';
  }

  if (referrerUrl.origin !== origin) return 'external';
  // Arrived from the browse page — the strongest signal that search worked.
  if (referrerUrl.pathname.startsWith('/browse')) return 'browse';
  return 'internal';
}
