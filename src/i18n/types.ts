import type { LocaleCode } from '@/shared/vocabulary';
import type { en } from './locales/en';

/** Every valid translation key, derived from the English source of truth. */
export type TranslationKey = keyof typeof en;

/**
 * The contract every non-English locale must satisfy. Because it is an exact
 * `Record` over `TranslationKey`, omitting a key or inventing one fails the build.
 */
export type Translations = Record<TranslationKey, string>;

/** Values interpolated into `{placeholder}` slots. */
export type TranslationParams = Record<string, string | number>;

/**
 * Base names of pluralised keys — every key defined with an `_other` variant.
 *
 * Derived from the English table, so `plural('browse.results')` only compiles
 * when `browse.results_other` actually exists.
 */
export type PluralBaseKey = {
  [K in TranslationKey]: K extends `${infer Base}_other` ? Base : never;
}[TranslationKey];

export interface I18nContextValue {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  /**
   * Selects the right plural form for `count` using `Intl.PluralRules`, and
   * interpolates it as `{count}`. Falls back to the `_other` form for any
   * category a locale defines but the table does not.
   */
  plural: (key: PluralBaseKey, count: number, params?: TranslationParams) => string;
  /** Locale-aware `Intl` formatters, memoised per locale. */
  formatDate: (value: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency: string) => string;
}
