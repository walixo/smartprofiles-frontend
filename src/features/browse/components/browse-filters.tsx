import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/form-fields';
import { SearchIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import {
  AVAILABILITY_STATES,
  COUNTRIES,
  DISCIPLINES,
  type AvailabilityState,
  type CountryCode,
  type DisciplineSlug,
} from '@/shared/vocabulary';

export interface FilterState {
  q: string;
  country: CountryCode | '';
  discipline: DisciplineSlug | '';
  availability: AvailabilityState | '';
}

export interface BrowseFiltersProps {
  value: FilterState;
  onChange: (next: Partial<FilterState>) => void;
  onClear: () => void;
  hasFilters: boolean;
}

export function BrowseFilters({ value, onChange, onClear, hasFilters }: BrowseFiltersProps) {
  const { t } = useI18n();

  // The search box is local and debounced: pushing a URL update per keystroke
  // would fire a request per character and bury the back button in history.
  const [draft, setDraft] = useState(value.q);

  useEffect(() => {
    setDraft(value.q);
  }, [value.q]);

  useEffect(() => {
    if (draft === value.q) return undefined;
    const timer = window.setTimeout(() => onChange({ q: draft }), 350);
    return () => window.clearTimeout(timer);
  }, [draft, value.q, onChange]);

  return (
    <section
      aria-label={t('browse.filter.legend')}
      className="rounded-4xl border-2 edge bg-white p-5 shadow-soft dark:bg-ink-900"
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <TextField
            id="browse-search"
            type="search"
            label={t('browse.searchLabel')}
            placeholder={t('browse.searchPlaceholder')}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            trailing={<SearchIcon size={18} className="mr-2 text-ink-700" />}
          />
        </div>

        <SelectField
          id="browse-country"
          label={t('browse.filter.country')}
          value={value.country}
          onChange={(event) => onChange({ country: event.target.value as CountryCode | '' })}
          options={[
            { value: '', label: t('browse.filter.any') },
            ...COUNTRIES.map((code) => ({ value: code, label: t(`country.${code}` as TranslationKey) })),
          ]}
        />

        <SelectField
          id="browse-discipline"
          label={t('browse.filter.discipline')}
          value={value.discipline}
          onChange={(event) => onChange({ discipline: event.target.value as DisciplineSlug | '' })}
          options={[
            { value: '', label: t('browse.filter.any') },
            ...DISCIPLINES.map((slug) => ({
              value: slug,
              label: t(`discipline.${slug}` as TranslationKey),
            })),
          ]}
        />

        <SelectField
          id="browse-availability"
          label={t('browse.filter.availability')}
          value={value.availability}
          onChange={(event) => onChange({ availability: event.target.value as AvailabilityState | '' })}
          options={[
            { value: '', label: t('browse.filter.any') },
            ...AVAILABILITY_STATES.map((state) => ({
              value: state,
              label: t(`availability.${state}` as TranslationKey),
            })),
          ]}
        />

        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onClear}
            disabled={!hasFilters}
          >
            {t('browse.filter.clear')}
          </Button>
        </div>
      </div>
    </section>
  );
}
