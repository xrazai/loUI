/** Locales that ship with built-in message catalogs (ADR-0005). */
export const SUPPORTED_LOCALES = ['en-US', 'pt-BR'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Default locale. */
export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

/** Language subtag every catalog must define; the last fallback in resolution. */
export const FALLBACK_LANGUAGE = 'en';

/**
 * Canonicalizes a BCP 47 tag (`pt-br` becomes `pt-BR`).
 * Returns the default locale for malformed tags instead of throwing, so a bad
 * `locale` prop can never crash rendering.
 */
export function normalizeLocale(locale: string): string {
  try {
    return new Intl.Locale(locale).toString();
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** Returns the language subtag of a locale (`pt-BR` becomes `pt`). */
export function getLanguage(locale: string): string {
  try {
    return new Intl.Locale(locale).language;
  } catch {
    return FALLBACK_LANGUAGE;
  }
}
