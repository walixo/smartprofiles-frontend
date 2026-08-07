import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_LOCALE, isLocaleCode, type LocaleCode } from '@/shared/vocabulary';
import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { nl } from './locales/nl';
import { sv } from './locales/sv';
import type {
  I18nContextValue,
  PluralBaseKey,
  TranslationKey,
  TranslationParams,
  Translations,
} from './types';

const LOCALE_STORAGE_KEY = 'smart-locale';

const TRANSLATIONS: Record<LocaleCode, Translations> = { en, fr, nl, de, sv, it, es };

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(resolveInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* Preference is not persisted, but the session still switches. */
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => {
      // Falls back to English, then to the key itself. The key fallback matters
      // at runtime: callers translate server-supplied strings that are not keys
      // at all, and must get the original text back rather than `undefined`.
      const template = TRANSLATIONS[locale][key] ?? en[key] ?? String(key);
      return params ? interpolate(template, params) : template;
    },
    [locale],
  );

  // Intl instances are expensive to construct; build one set per locale.
  const formatters = useMemo(
    () => ({
      date: new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
      number: new Intl.NumberFormat(locale),
      plural: new Intl.PluralRules(locale),
    }),
    [locale],
  );

  const plural = useCallback(
    (key: PluralBaseKey, count: number, params?: TranslationParams) => {
      const category = formatters.plural.select(count);
      const table = TRANSLATIONS[locale];
      // A locale may report a category (`few`, `many`) the table does not
      // define; `_other` is the guaranteed fallback.
      const chosen =
        table[`${key}_${category}` as TranslationKey] ?? table[`${key}_other` as TranslationKey];

      return interpolate(chosen ?? String(key), { count: formatters.number.format(count), ...params });
    },
    [locale, formatters],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      plural,
      formatDate: (input, options) => {
        const date = typeof input === 'string' ? new Date(input) : input;
        if (Number.isNaN(date.getTime())) return '';
        return options ? new Intl.DateTimeFormat(locale, options).format(date) : formatters.date.format(date);
      },
      formatNumber: (input, options) =>
        options ? new Intl.NumberFormat(locale, options).format(input) : formatters.number.format(input),
      formatCurrency: (input, currency) =>
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(input),
    }),
    [locale, setLocale, t, plural, formatters],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nContextValue {
  const context = use(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside an <I18nProvider>.');
  }
  return context;
}

/** localStorage → browser languages → English. */
function resolveInitialLocale(): LocaleCode {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocaleCode(stored)) return stored;
  } catch {
    /* Fall through to browser detection. */
  }

  for (const candidate of navigator.languages ?? [navigator.language]) {
    const base = candidate.split('-')[0]?.toLowerCase();
    if (isLocaleCode(base)) return base;
  }

  return DEFAULT_LOCALE;
}

/** Replaces `{name}` placeholders. Unknown placeholders are left intact so the gap is visible. */
function interpolate(template: string, params: TranslationParams): string {
  return template.replace(/\{(\w+)\}/g, (match, token: string) => {
    const value = params[token];
    return value === undefined ? match : String(value);
  });
}
