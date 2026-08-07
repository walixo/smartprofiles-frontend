import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/cn';

export interface MessageComposerProps {
  onSend: (body: string) => Promise<void>;
  isSending: boolean;
  autoFocus?: boolean;
}

/** Textarea composer. Enter sends, Shift+Enter inserts a newline. */
export function MessageComposer({ onSend, isSending, autoFocus }: MessageComposerProps) {
  const { t } = useI18n();
  const [body, setBody] = useState('');

  const canSend = body.trim().length > 0 && !isSending;

  const submit = async (): Promise<void> => {
    if (!canSend) return;
    const value = body.trim();
    // Clear optimistically so typing can continue while the request is in
    // flight; a failure surfaces on the thread rather than losing the draft.
    setBody('');
    try {
      await onSend(value);
    } catch {
      setBody(value);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex items-end gap-3 border-t border-sand-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900"
    >
      <div className="min-w-0 flex-1">
        <label htmlFor="chat-composer" className="sr-only">
          {t('chat.compose.placeholder')}
        </label>
        <textarea
          id="chat-composer"
          rows={2}
          autoFocus={autoFocus}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder={t('chat.compose.placeholder')}
          aria-describedby="chat-composer-hint"
          className={cn(
            'w-full resize-none rounded-2xl border border-sand-300 bg-white px-4 py-2.5 text-[0.9375rem] text-ink-900',
            'placeholder:text-ink-400 focus:border-brand-500 dark:border-ink-700 dark:bg-ink-950 dark:text-sand-50',
          )}
        />
        <p id="chat-composer-hint" className="mt-1 text-xs text-ink-400 dark:text-ink-500">
          {t('chat.compose.hint')}
        </p>
      </div>

      <Button type="submit" disabled={!canSend} isLoading={isSending} className="mb-6">
        {t('chat.compose.send')}
      </Button>
    </form>
  );
}
