import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ChipToggleGroup, SelectField } from '@/components/ui/form-fields';
import { AuthAssembleIllustration } from '@/components/ui/illustrations';
import { TextField } from '@/components/ui/text-field';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { isApiRequestError } from '@/lib/api-error';
import { COUNTRIES, DISCIPLINES, type CountryCode, type DisciplineSlug } from '@/shared/vocabulary';
import { useCreateProfile } from '../hooks/use-own-profile';
import { HandleField } from './handle-field';

/** First-run form: claim the handle and the three fields publishing requires. */
export function ClaimProfileForm() {
  const { t } = useI18n();
  const create = useCreateProfile();

  const [handle, setHandle] = useState('');
  const [headline, setHeadline] = useState('');
  const [country, setCountry] = useState<CountryCode>('BE');
  const [disciplines, setDisciplines] = useState<DisciplineSlug[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    try {
      await create.mutateAsync({ handle, headline, country, disciplines });
    } catch (error) {
      if (!isApiRequestError(error)) {
        setFormError(t('error.UNKNOWN_ERROR'));
        return;
      }
      const resolved = Object.fromEntries(
        Object.entries(error.fieldErrors).map(([field, message]) => [field, t(message as TranslationKey)]),
      );
      setFieldErrors(resolved);
      if (Object.keys(resolved).length === 0) setFormError(t(`error.${error.code}` as TranslationKey));
    }
  };

  return (
    <Container className="py-12 sm:py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="animate-fade-in order-last hidden lg:block">
          <div className="rounded-5xl bg-sand-100 p-10 dark:bg-ink-900/50">
            <AuthAssembleIllustration className="w-full" />
          </div>
        </div>

        <form onSubmit={submit} noValidate className="animate-fade-up mx-auto w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-sand-50">
              {t('editor.claim.title')}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-600 dark:text-ink-300">
              {t('editor.claim.subtitle')}
            </p>
          </div>

          {formError ? <Alert tone="danger">{formError}</Alert> : null}

          <HandleField id="claim-handle" value={handle} onChange={setHandle} error={fieldErrors.handle} />

          <TextField
            id="claim-headline"
            label={t('editor.field.headline')}
            placeholder={t('editor.field.headlinePlaceholder')}
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            error={fieldErrors.headline}
          />

          <SelectField
            id="claim-country"
            label={t('editor.field.country')}
            value={country}
            onChange={(event) => setCountry(event.target.value as CountryCode)}
            error={fieldErrors.country}
            options={COUNTRIES.map((code) => ({ value: code, label: t(`country.${code}` as TranslationKey) }))}
          />

          <ChipToggleGroup
            legend={t('editor.field.disciplines')}
            options={DISCIPLINES.map((slug) => ({
              value: slug,
              label: t(`discipline.${slug}` as TranslationKey),
            }))}
            value={disciplines}
            onChange={setDisciplines}
            error={fieldErrors.disciplines}
            max={5}
          />

          <Button type="submit" size="lg" className="w-full" isLoading={create.isPending}>
            {t('editor.claim.submit')}
          </Button>
        </form>
      </div>
    </Container>
  );
}
