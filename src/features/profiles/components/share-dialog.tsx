import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { CheckIcon, LinkIcon } from '@/components/ui/icons';
import { QrCode, qrSvgDocument } from '@/components/ui/qr-code';
import { useI18n } from '@/i18n/i18n-provider';
import { QR_SOURCE_PARAM, QR_SOURCE_VALUE } from '@/features/analytics/lib/view-source';

export interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  handle: string;
  displayName: string;
}

/**
 * The event-floor share sheet: a scannable code plus the raw link.
 *
 * The URL is built from the live origin so a code scanned during local
 * development points at the dev server rather than a hard-coded domain.
 */
export function ShareDialog({ isOpen, onClose, handle, displayName }: ShareDialogProps) {
  const { t } = useI18n();
  const [hasCopied, setHasCopied] = useState(false);

  const url = `${window.location.origin}/@${handle}`;
  // Only the QR carries the marker — a copied link should stay clean, and a
  // link pasted into an email is not a scan.
  const qrUrl = `${url}?${QR_SOURCE_PARAM}=${QR_SOURCE_VALUE}`;

  useEffect(() => {
    if (!hasCopied) return undefined;
    const timer = window.setTimeout(() => setHasCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [hasCopied]);

  // Reset between openings so a stale "Copied" never greets the next open.
  useEffect(() => {
    if (!isOpen) setHasCopied(false);
  }, [isOpen]);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
    } catch {
      // Clipboard permission denied — the link stays visible and selectable.
    }
  };

  const download = (): void => {
    const blob = new Blob([qrSvgDocument(qrUrl)], { type: 'image/svg+xml' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `smart-profile-${handle}.svg`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('profile.share.title')} description={t('profile.share.body')}>
      <div className="rounded-3xl border-2 edge bg-paper-50 p-5 dark:bg-ink-950">
        <QrCode value={qrUrl} title={`${t('profile.share.title')} — ${displayName}`} className="mx-auto max-w-56" />
      </div>

      <p className="mt-4 truncate rounded-2xl bg-paper-100 px-4 py-3 text-center text-sm font-medium text-ink-700 dark:bg-ink-800 dark:text-paper-100">
        {url.replace(/^https?:\/\//, '')}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => void copy()}
          className="flex-1"
          leadingIcon={hasCopied ? <CheckIcon size={16} /> : <LinkIcon size={16} />}
        >
          {hasCopied ? t('profile.share.copied') : t('profile.share.copy')}
        </Button>
        <Button variant="outline" onClick={download} className="flex-1">
          {t('profile.share.download')}
        </Button>
      </div>
    </Dialog>
  );
}
