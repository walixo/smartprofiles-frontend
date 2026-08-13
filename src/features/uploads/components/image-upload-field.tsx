import { useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CloseIcon, GalleryIcon, SpinnerIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/cn';
import { uploadImage, type UploadKind } from '../api/upload.api';
import { useUploadConfig } from '../hooks/use-upload-config';

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export interface ImageUploadFieldProps {
  id: string;
  label: string;
  kind: UploadKind;
  /** Current image URL, or '' for none. */
  value: string;
  onChange: (url: string) => void;
  /** Aspect ratio of the preview box, e.g. 'aspect-square' or 'aspect-[3/1]'. */
  previewClassName?: string;
  error?: string;
}

/**
 * Image field with upload, drag-and-drop, and a URL fallback.
 *
 * The URL input is kept even when uploads work: existing profiles already hold
 * external URLs, and losing the ability to point at an image hosted elsewhere
 * would be a regression. When the server has no Cloudinary credentials the
 * control degrades to URL-only rather than offering a button that cannot work.
 */
export function ImageUploadField({
  id,
  label,
  kind,
  value,
  onChange,
  previewClassName = 'aspect-[3/1]',
  error,
}: ImageUploadFieldProps) {
  const { t } = useI18n();
  const { data: config } = useUploadConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const urlFieldId = useId();

  const [progress, setProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const uploadsEnabled = config?.enabled === true;
  const maxBytes = config?.maxBytes ?? 5 * 1024 * 1024;
  const isUploading = progress !== null;

  const handleFile = async (file: File): Promise<void> => {
    setLocalError(null);

    // Checked here as well as at Cloudinary so an oversized file fails
    // instantly instead of after a slow upload that will be rejected anyway.
    if (!ACCEPTED_MIME.includes(file.type)) {
      setLocalError(t('upload.wrongType'));
      return;
    }
    if (file.size > maxBytes) {
      setLocalError(t('upload.tooLarge', { limit: `${Math.round(maxBytes / 1024 / 1024)} MB` }));
      return;
    }

    setProgress(0);
    try {
      const result = await uploadImage(kind, file, setProgress);
      onChange(result.url);
    } catch {
      setLocalError(t('upload.failed'));
    } finally {
      setProgress(null);
    }
  };

  const shownError = error ?? localError ?? undefined;

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-ink-950 dark:text-paper-100">{label}</span>

      {value ? (
        <div className="relative overflow-hidden rounded-3xl border-2 edge">
          <img
            src={value}
            alt={t('upload.preview')}
            className={cn('w-full bg-paper-100 object-cover dark:bg-ink-800', previewClassName)}
          />
          <div className="absolute right-2 top-2 flex gap-2">
            {uploadsEnabled ? (
              <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} disabled={isUploading}>
                {t('upload.replace')}
              </Button>
            ) : null}
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label={t('upload.remove')}
              className="inline-flex size-9 items-center justify-center rounded-none bg-ink-950/70 text-white  transition-colors hover:bg-ink-950"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>
      ) : uploadsEnabled ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files[0];
            if (file) void handleFile(file);
          }}
          className={cn(
            'rounded-3xl border-2 border-dashed transition-colors',
            isDragging
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
              : 'edge',
          )}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-3xl px-4 py-8 text-center',
              previewClassName,
            )}
          >
            {isUploading ? (
              <>
                <SpinnerIcon size={22} className="animate-spin text-brand-500" />
                <span className="text-sm font-medium text-ink-900 dark:text-paper-200">
                  {t('upload.uploading', { percent: progress })}
                </span>
                <span
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-1 h-1.5 w-40 overflow-hidden rounded-none bg-paper-200 dark:bg-ink-800"
                >
                  <span
                    className="block h-full rounded-none bg-brand-500 transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </span>
              </>
            ) : (
              <>
                <GalleryIcon size={26} className="text-ink-700 dark:text-ink-950" />
                <span className="text-sm font-semibold text-ink-950 dark:text-paper-100">
                  {t('upload.choose')}
                </span>
                <span className="text-xs text-ink-950 dark:text-paper-300">{t('upload.dropHint')}</span>
              </>
            )}
          </button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          // Reset so choosing the same file twice still fires a change.
          event.target.value = '';
        }}
      />

      <TextField
        id={`${id}-${urlFieldId}`}
        label={uploadsEnabled ? t('upload.orPasteUrl') : t('upload.disabledHint')}
        placeholder="https://…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={shownError}
      />
    </div>
  );
}
