import { CheckIcon, CloseIcon, SpinnerIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/cn';
import { useHandleAvailability, type HandleStatus } from '../hooks/use-own-profile';

export interface HandleFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** The handle already owned, so re-typing it does not report "taken". */
  currentHandle?: string;
}

/**
 * Handle input with live availability.
 *
 * The verdict is advisory — the server re-checks on submit and is the only
 * authority. This just avoids letting someone fill in a whole profile before
 * discovering the name is gone.
 */
export function HandleField({ id, value, onChange, error, currentHandle }: HandleFieldProps) {
  const { t } = useI18n();
  const status = useHandleAvailability(value, currentHandle);

  return (
    <div className="space-y-1.5">
      <TextField
        id={id}
        label={t('editor.handle.label')}
        hint={t('editor.handle.hint')}
        error={error}
        value={value}
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
        onChange={(event) => onChange(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
        trailing={<StatusIcon status={status} />}
      />

      <p className="pl-1 text-sm text-ink-950 dark:text-paper-300">
        smartprofiles.eu/<span className="font-semibold text-ink-950 dark:text-paper-100">@{value || '…'}</span>
      </p>

      {status === 'available' || status === 'taken' ? (
        <p
          className={cn(
            'animate-fade-in pl-1 text-sm font-medium',
            status === 'available'
              ? 'text-success-600 dark:text-success-400'
              : 'text-danger-600 dark:text-danger-400',
          )}
        >
          {t(status === 'available' ? 'editor.handle.available' : 'editor.handle.taken', { handle: `@${value}` })}
        </p>
      ) : null}
    </div>
  );
}

function StatusIcon({ status }: { status: HandleStatus }) {
  if (status === 'checking') {
    return <SpinnerIcon size={17} className="mr-2 animate-spin text-ink-700" />;
  }
  if (status === 'available') {
    return <CheckIcon size={18} className="mr-2 text-success-500" />;
  }
  if (status === 'taken' || status === 'invalid') {
    return <CloseIcon size={17} className="mr-2 text-danger-500" />;
  }
  return null;
}
