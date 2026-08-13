import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonClasses } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import {
  ChipToggleGroup,
  EditorSection,
  SelectField,
  SwitchField,
  TagInputField,
  TextAreaField,
} from '@/components/ui/form-fields';
import { CheckIcon, CloseIcon, SpinnerIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { isApiRequestError } from '@/lib/api-error';
import {
  AVAILABILITY_STATES,
  COUNTRIES,
  CURRENCIES,
  DISCIPLINES,
  LANGUAGE_LEVELS,
  LINK_KINDS,
  LOCALES,
  type AvailabilityState,
  type CountryCode,
  type Currency,
  type DisciplineSlug,
  type LanguageLevel,
  type LinkKind,
  type LocaleCode,
} from '@/shared/vocabulary';
import type { OwnerProfile, UpdateProfilePayload } from '../api/owner.api';
import { ClaimProfileForm } from '../components/claim-profile-form';
import { HandleField } from '../components/handle-field';
import { WorksManager } from '../components/works-manager';
import { AnalyticsPanel } from '@/features/analytics/components/analytics-panel';
import { ImageUploadField } from '@/features/uploads/components/image-upload-field';
import { useOwnProfile, useOwnWorks, useSetVisibility, useUpdateProfile } from '../hooks/use-own-profile';

export function ProfileEditorPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { profile, isPending, isMissing, error } = useOwnProfile();

  if (user && user.role !== 'freelancer') {
    return (
      <Container width="narrow" className="py-24">
        <Alert tone="info">{t('editor.onlyFreelancers')}</Alert>
      </Container>
    );
  }

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <SpinnerIcon size={20} className="animate-spin text-ink-700" />
      </div>
    );
  }

  if (isMissing) return <ClaimProfileForm />;

  if (error || !profile) {
    return (
      <Container width="narrow" className="py-24">
        <Alert tone="danger">{t('error.UNKNOWN_ERROR')}</Alert>
      </Container>
    );
  }

  return <EditorForm profile={profile} />;
}

function EditorForm({ profile }: { profile: OwnerProfile }) {
  const { t } = useI18n();
  const update = useUpdateProfile();
  const visibility = useSetVisibility();
  const works = useOwnWorks(true);

  const [form, setForm] = useState(() => toFormState(profile));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Re-seed when the server returns a newer record (publish, or another tab).
  useEffect(() => {
    setForm(toFormState(profile));
  }, [profile]);

  useEffect(() => {
    if (!justSaved) return undefined;
    const timer = window.setTimeout(() => setJustSaved(false), 2400);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    try {
      await update.mutateAsync(toPayload(form));
      setJustSaved(true);
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
    <Container className="py-10 sm:py-14">
      <header className="animate-fade-up flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-paper-50">
            {t('editor.title')}
          </h1>
          <p className="mt-2 text-ink-900 dark:text-paper-200">{t('editor.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={profile.visibility === 'public' ? 'success' : 'neutral'}>
            {t(`visibility.${profile.visibility}` as TranslationKey)}
          </Badge>
          <Link to={`/@${profile.handle}`} className={buttonClasses('outline', 'sm')}>
            {t('editor.visibility.view')}
          </Link>
        </div>
      </header>

      <form onSubmit={save} noValidate className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="space-y-5">
          {formError ? <Alert tone="danger">{formError}</Alert> : null}

          <EditorSection title={t('editor.section.identity')}>
            <HandleField
              id="edit-handle"
              value={form.handle}
              onChange={(value) => patch('handle', value)}
              error={fieldErrors.handle}
              currentHandle={profile.handle}
            />
            {form.handle !== profile.handle ? (
              <Alert tone="warning">{t('editor.handle.warning')}</Alert>
            ) : null}

            <TextField
              id="edit-headline"
              label={t('editor.field.headline')}
              placeholder={t('editor.field.headlinePlaceholder')}
              value={form.headline}
              onChange={(e) => patch('headline', e.target.value)}
              error={fieldErrors.headline}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageUploadField
                id="edit-avatar"
                kind="avatar"
                label={t('editor.field.avatarUrl')}
                previewClassName="aspect-square"
                value={form.avatarUrl}
                onChange={(url) => patch('avatarUrl', url)}
                error={fieldErrors.avatarUrl}
              />
              <ImageUploadField
                id="edit-cover"
                kind="cover"
                label={t('editor.field.coverUrl')}
                previewClassName="aspect-[3/1]"
                value={form.coverUrl}
                onChange={(url) => patch('coverUrl', url)}
                error={fieldErrors.coverUrl}
              />
            </div>
          </EditorSection>

          <EditorSection title={t('editor.section.about')}>
            <TextAreaField
              id="edit-bio"
              label={t('editor.field.bio')}
              hint={t('editor.field.bioHint')}
              value={form.bio}
              onChange={(e) => patch('bio', e.target.value)}
              error={fieldErrors.bio}
            />
          </EditorSection>

          <EditorSection title={t('editor.section.expertise')}>
            <ChipToggleGroup
              legend={t('editor.field.disciplines')}
              options={DISCIPLINES.map((slug) => ({
                value: slug,
                label: t(`discipline.${slug}` as TranslationKey),
              }))}
              value={form.disciplines}
              onChange={(next) => patch('disciplines', next)}
              error={fieldErrors.disciplines}
              max={5}
            />
            <TagInputField
              id="edit-skills"
              label={t('editor.field.skills')}
              hint={t('editor.field.skillsHint')}
              value={form.skills}
              onChange={(next) => patch('skills', next)}
            />
          </EditorSection>

          <EditorSection title={t('editor.section.location')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="edit-country"
                label={t('editor.field.country')}
                value={form.country}
                onChange={(e) => patch('country', e.target.value as CountryCode)}
                options={COUNTRIES.map((code) => ({
                  value: code,
                  label: t(`country.${code}` as TranslationKey),
                }))}
              />
              <TextField
                id="edit-city"
                label={t('editor.field.city')}
                value={form.city}
                onChange={(e) => patch('city', e.target.value)}
                error={fieldErrors.city}
              />
            </div>

            <SelectField
              id="edit-availability"
              label={t('editor.field.availability')}
              value={form.availability}
              onChange={(e) => patch('availability', e.target.value as AvailabilityState)}
              options={AVAILABILITY_STATES.map((state) => ({
                value: state,
                label: t(`availability.${state}` as TranslationKey),
              }))}
            />

            <RepeatableRows
              legend={t('editor.field.languages')}
              addLabel={t('editor.field.addLanguage')}
              rows={form.languages}
              onAdd={() => patch('languages', [...form.languages, { code: 'en', level: 'fluent' }])}
              onRemove={(index) => patch('languages', form.languages.filter((_, i) => i !== index))}
              render={(row, index) => (
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <SelectField
                    id={`lang-code-${index}`}
                    label={t('locale.label')}
                    value={row.code}
                    onChange={(e) =>
                      patch(
                        'languages',
                        form.languages.map((l, i) =>
                          i === index ? { ...l, code: e.target.value as LocaleCode } : l,
                        ),
                      )
                    }
                    options={LOCALES.map((code) => ({ value: code, label: t(`lang.${code}` as TranslationKey) }))}
                  />
                  <SelectField
                    id={`lang-level-${index}`}
                    label={t('languageLevel.fluent')}
                    value={row.level}
                    onChange={(e) =>
                      patch(
                        'languages',
                        form.languages.map((l, i) =>
                          i === index ? { ...l, level: e.target.value as LanguageLevel } : l,
                        ),
                      )
                    }
                    options={LANGUAGE_LEVELS.map((level) => ({
                      value: level,
                      label: t(`languageLevel.${level}` as TranslationKey),
                    }))}
                  />
                </div>
              )}
            />
          </EditorSection>

          <EditorSection title={t('editor.section.links')}>
            <RepeatableRows
              legend={t('editor.field.links')}
              addLabel={t('editor.field.addLink')}
              rows={form.links}
              onAdd={() => patch('links', [...form.links, { label: '', url: '', kind: 'website' }])}
              onRemove={(index) => patch('links', form.links.filter((_, i) => i !== index))}
              render={(row, index) => (
                <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_1.6fr_auto]">
                  <TextField
                    id={`link-label-${index}`}
                    label={t('editor.field.linkLabel')}
                    value={row.label}
                    onChange={(e) =>
                      patch('links', form.links.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)))
                    }
                  />
                  <TextField
                    id={`link-url-${index}`}
                    label={t('editor.field.linkUrl')}
                    placeholder="https://…"
                    value={row.url}
                    onChange={(e) =>
                      patch('links', form.links.map((l, i) => (i === index ? { ...l, url: e.target.value } : l)))
                    }
                  />
                  <SelectField
                    id={`link-kind-${index}`}
                    label={t('editor.field.linkKind')}
                    value={row.kind}
                    onChange={(e) =>
                      patch(
                        'links',
                        form.links.map((l, i) =>
                          i === index ? { ...l, kind: e.target.value as LinkKind } : l,
                        ),
                      )
                    }
                    options={LINK_KINDS.map((kind) => ({
                      value: kind,
                      label: t(`linkKind.${kind}` as TranslationKey),
                    }))}
                  />
                </div>
              )}
            />
          </EditorSection>

          <EditorSection title={t('editor.section.rate')}>
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField
                id="edit-currency"
                label={t('editor.field.currency')}
                value={form.currency}
                onChange={(e) => patch('currency', e.target.value as Currency)}
                options={CURRENCIES.map((c) => ({ value: c, label: t(`currency.${c}` as TranslationKey) }))}
              />
              <TextField
                id="edit-rate-min"
                label={t('editor.field.dayRateMin')}
                inputMode="numeric"
                value={form.dayRateMin}
                onChange={(e) => patch('dayRateMin', e.target.value.replace(/\D/g, ''))}
                error={fieldErrors['rate.dayRateMin']}
              />
              <TextField
                id="edit-rate-max"
                label={t('editor.field.dayRateMax')}
                inputMode="numeric"
                value={form.dayRateMax}
                onChange={(e) => patch('dayRateMax', e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <SwitchField
              id="edit-rate-visible"
              label={t('editor.field.rateVisible')}
              checked={form.rateVisible}
              onChange={(next) => patch('rateVisible', next)}
            />
          </EditorSection>

          <EditorSection title={t('editor.section.contact')}>
            <TextField
              id="edit-phone"
              label={t('editor.field.phone')}
              type="tel"
              value={form.phone}
              onChange={(e) => patch('phone', e.target.value)}
              error={fieldErrors['contact.phone']}
            />
            <SwitchField
              id="edit-show-phone"
              label={t('editor.field.showPhone')}
              hint={t('editor.field.showPhoneHint')}
              checked={form.showPhone}
              onChange={(next) => patch('showPhone', next)}
            />
            <SwitchField
              id="edit-allow-chat"
              label={t('editor.field.allowChat')}
              checked={form.allowChat}
              onChange={(next) => patch('allowChat', next)}
            />
          </EditorSection>

          <AnalyticsPanel />

          {works.data ? <WorksManager works={works.data.works} /> : null}
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-4xl border-2 edge bg-white p-5 shadow-soft dark:bg-ink-900">
            <Button type="submit" className="w-full" isLoading={update.isPending}>
              {justSaved ? (
                <>
                  <CheckIcon size={16} />
                  {t('editor.saved')}
                </>
              ) : (
                t('editor.save')
              )}
            </Button>

            <div className="mt-4 space-y-2 border-t-2 edge pt-4">
              {profile.visibility === 'public' ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  isLoading={visibility.isPending}
                  onClick={() => void visibility.mutateAsync('draft')}
                >
                  {t('editor.visibility.unpublish')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  isLoading={visibility.isPending}
                  onClick={() => void visibility.mutateAsync('public')}
                >
                  {t('editor.visibility.publish')}
                </Button>
              )}

              {profile.visibility !== 'unlisted' ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => void visibility.mutateAsync('unlisted')}
                >
                  {t('editor.visibility.unlisted')}
                </Button>
              ) : null}
            </div>
          </div>
        </aside>
      </form>
    </Container>
  );
}

/* ------------------------------------------------------------------ */

function RepeatableRows<T>({
  legend,
  addLabel,
  rows,
  onAdd,
  onRemove,
  render,
}: {
  legend: string;
  addLabel: string;
  rows: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (row: T, index: number) => React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <fieldset>
      <legend className="mb-2.5 block text-sm font-semibold text-ink-950 dark:text-paper-100">{legend}</legend>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="flex items-end gap-2">
            {render(row, index)}
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={t('editor.remove')}
              title={t('editor.remove')}
              className="mb-1 inline-flex size-9 shrink-0 items-center justify-center rounded-none text-ink-950 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-ink-800"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={onAdd}>
        {addLabel}
      </Button>
    </fieldset>
  );
}

interface FormState {
  handle: string;
  headline: string;
  bio: string;
  disciplines: DisciplineSlug[];
  skills: string[];
  country: CountryCode;
  city: string;
  availability: AvailabilityState;
  languages: Array<{ code: LocaleCode; level: LanguageLevel }>;
  avatarUrl: string;
  coverUrl: string;
  links: Array<{ label: string; url: string; kind: LinkKind }>;
  currency: Currency;
  dayRateMin: string;
  dayRateMax: string;
  rateVisible: boolean;
  phone: string;
  showPhone: boolean;
  allowChat: boolean;
}

function toFormState(profile: OwnerProfile): FormState {
  return {
    handle: profile.handle,
    headline: profile.headline,
    bio: profile.bio ?? '',
    disciplines: profile.disciplines,
    skills: profile.skills,
    country: profile.country,
    city: profile.city ?? '',
    availability: profile.availability,
    languages: profile.languages,
    avatarUrl: profile.avatarUrl ?? '',
    coverUrl: profile.coverUrl ?? '',
    links: profile.links,
    currency: profile.rate?.currency ?? 'EUR',
    dayRateMin: profile.rate?.dayRateMin ? String(profile.rate.dayRateMin) : '',
    dayRateMax: profile.rate?.dayRateMax ? String(profile.rate.dayRateMax) : '',
    rateVisible: profile.rate?.visible ?? false,
    phone: profile.contact.phone ?? '',
    showPhone: profile.contact.showPhone,
    allowChat: profile.contact.allowChat,
  };
}

/**
 * Empty strings are sent as-is: the API reads `''` as "clear this field", which
 * is the only way an HTML input can express deletion.
 */
function toPayload(form: FormState): UpdateProfilePayload {
  const hasRate = form.dayRateMin !== '' || form.dayRateMax !== '';

  return {
    handle: form.handle,
    headline: form.headline,
    bio: form.bio,
    disciplines: form.disciplines,
    skills: form.skills,
    country: form.country,
    city: form.city,
    availability: form.availability,
    languages: form.languages,
    avatarUrl: form.avatarUrl,
    coverUrl: form.coverUrl,
    links: form.links.filter((link) => link.label.trim() !== '' && link.url.trim() !== ''),
    contact: { phone: form.phone, showPhone: form.showPhone, allowChat: form.allowChat },
    ...(hasRate
      ? {
          rate: {
            currency: form.currency,
            visible: form.rateVisible,
            ...(form.dayRateMin ? { dayRateMin: Number(form.dayRateMin) } : {}),
            ...(form.dayRateMax ? { dayRateMax: Number(form.dayRateMax) } : {}),
          },
        }
      : {}),
  };
}
