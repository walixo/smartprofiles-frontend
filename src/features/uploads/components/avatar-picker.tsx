import { useEffect, useRef, useState } from 'react';
import { CloseIcon, SpinnerIcon, UserIcon } from '@/components/ui/icons';
import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/cn';
import { useUploadConfig } from '../hooks/use-upload-config';

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export interface AvatarPickerProps {
  /** The chosen file, held by the parent until there is an account to attach it to. */
  file: File | null;
  onSelect: (file: File | null) => void;
  /** Shown while the parent uploads after registration succeeds. */
  isUploading?: boolean;
  label: string;
  hint?: string;
}

/**
 * Avatar chooser that does not upload.
 *
 * Signup has a genuine ordering constraint: minting an upload signature needs a
 * token, and the token does not exist until the account is created. So the file
 * is held here with a local object-URL preview, and the parent uploads it once
 * registration returns a token.
 */
export function AvatarPicker({ file, onSelect, isUploading = false, label, hint }: AvatarPickerProps) {
  const { t } = useI18n();
  const { data: config } = useUploadConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Object URLs leak until revoked, so tie the lifetime to the selection.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Nothing to offer if the server cannot sign uploads.
  if (config?.enabled !== true) return null;

  const maxBytes = config.maxBytes;

  const choose = (candidate: File): void => {
    setError(null);
    if (!ACCEPTED_MIME.includes(candidate.type)) {
      setError(t('upload.wrongType'));
      return;
    }
    if (candidate.size > maxBytes) {
      setError(t('upload.tooLarge', { limit: `${Math.round(maxBytes / 1024 / 1024)} MB` }));
      return;
    }
    onSelect(candidate);
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-semibold text-ink-800 dark:text-sand-200">{label}</span>

      <div className="flex items-center gap-4">
        <span
          className={cn(
            'relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl',
            preview ? 'bg-sand-200 dark:bg-ink-800' : 'bg-sand-200 text-ink-400 dark:bg-ink-800 dark:text-ink-500',
          )}
        >
          {preview ? (
            <img src={preview} alt={t('upload.preview')} className="size-full object-cover" />
          ) : (
            <UserIcon size={28} />
          )}

          {isUploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-ink-950/60">
              <SpinnerIcon size={20} className="animate-spin text-white" />
            </span>
          ) : null}
        </span>

        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="rounded-full border border-sand-300 px-3.5 py-1.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-100 disabled:opacity-50 dark:border-ink-700 dark:text-sand-200 dark:hover:bg-ink-800"
            >
              {file ? t('upload.replace') : t('upload.choose')}
            </button>

            {file ? (
              <button
                type="button"
                onClick={() => onSelect(null)}
                disabled={isUploading}
                aria-label={t('upload.remove')}
                className="inline-flex size-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 disabled:opacity-50 dark:hover:bg-ink-800"
              >
                <CloseIcon size={15} />
              </button>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="text-sm font-medium text-danger-600 dark:text-danger-400">
              {error}
            </p>
          ) : hint ? (
            <p className="text-sm text-ink-500 dark:text-ink-400">{hint}</p>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        className="sr-only"
        onChange={(event) => {
          const candidate = event.target.files?.[0];
          if (candidate) choose(candidate);
          event.target.value = '';
        }}
      />
    </div>
  );
}
