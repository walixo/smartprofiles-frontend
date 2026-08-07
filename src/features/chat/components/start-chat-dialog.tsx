import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { TextAreaField } from '@/components/ui/form-fields';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { isApiRequestError } from '@/lib/api-error';
import { useStartThread } from '../hooks/use-chat';

export interface StartChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  handle: string;
  displayName: string;
}

/**
 * Opens a conversation from a public profile.
 *
 * The first message is required rather than optional — an empty thread gives
 * the recipient nothing to respond to and reads as a misfire in their inbox.
 */
export function StartChatDialog({ isOpen, onClose, handle, displayName }: StartChatDialogProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const start = useStartThread();

  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setBody('');
      setError(null);
    }
  }, [isOpen]);

  const submit = async (): Promise<void> => {
    setError(null);
    try {
      const { threadId } = await start.mutateAsync({ handle, body });
      onClose();
      void navigate(`/messages/${threadId}`);
    } catch (caught) {
      setError(
        isApiRequestError(caught)
          ? t(`error.${caught.code}` as TranslationKey)
          : t('error.UNKNOWN_ERROR'),
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('chat.start.title', { name: displayName })}
      description={t('chat.start.body')}
    >
      <div className="space-y-4">
        {error ? <Alert tone="danger">{error}</Alert> : null}

        <TextAreaField
          id="start-chat-body"
          label={t('chat.start.title', { name: displayName })}
          placeholder={t('chat.start.placeholder')}
          rows={5}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />

        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={body.trim().length === 0}
            isLoading={start.isPending}
            onClick={() => void submit()}
          >
            {t('chat.start.send')}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
