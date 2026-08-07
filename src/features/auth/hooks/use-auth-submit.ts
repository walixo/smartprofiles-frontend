import { useCallback, useState } from 'react';
import type { FieldValues, Path, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { isApiRequestError } from '@/lib/api-error';

/**
 * Wraps a form submit so API failures land where the user is looking.
 *
 * Field-scoped errors from the server are attached to the matching inputs via
 * `setError`; anything else becomes a single form-level message, translated by
 * error code when the client knows it and left as the server's own sentence
 * when it does not.
 */
export function useAuthSubmit<TValues extends FieldValues>(form: UseFormReturn<TValues>) {
  const { t } = useI18n();
  const [formError, setFormError] = useState<string | null>(null);

  const handleFailure = useCallback(
    (error: unknown) => {
      if (!isApiRequestError(error)) {
        setFormError(t('error.UNKNOWN_ERROR'));
        return;
      }

      let attachedAny = false;

      for (const [field, message] of Object.entries(error.fieldErrors)) {
        // Only attach to fields this form actually renders — an unknown field
        // name would otherwise create an error nothing ever displays.
        if (field in form.getValues()) {
          form.setError(field as Path<TValues>, { type: 'server', message });
          attachedAny = true;
        }
      }

      if (!attachedAny) {
        setFormError(t(`error.${error.code}` as TranslationKey));
      }
    },
    [form, t],
  );

  const submit = useCallback(
    (handler: (values: TValues) => Promise<void>) => {
      const wrapped: SubmitHandler<TValues> = async (values) => {
        setFormError(null);
        try {
          await handler(values);
        } catch (error) {
          handleFailure(error);
        }
      };

      return form.handleSubmit(wrapped);
    },
    [form, handleFailure],
  );

  return {
    formError,
    submit,
    isSubmitting: form.formState.isSubmitting,
  };
}
