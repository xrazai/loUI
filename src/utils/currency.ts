import { reportInvalid } from './env';
import { createCache } from './formatCache';
import { getNumberFormat } from './number';

export interface FormatCurrencyOptions {
  /** How to show the currency. Default `'symbol'`. */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  /** When to show the sign. Default `'auto'` (only negatives). */
  signDisplay?: 'auto' | 'always' | 'exceptZero' | 'never';
  /** `'compact'` gives `$1.2K`. Default `'standard'`. */
  notation?: 'standard' | 'compact';
}

/**
 * Number of minor-unit digits of a currency (2 for USD/BRL, 0 for JPY, 3 for KWD),
 * read from `Intl` so we never keep our own table.
 */
export function getCurrencyDigits(currency: string, locale: string): number {
  return (
    getNumberFormat(locale, { style: 'currency', currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  );
}

/**
 * Formats money held as an integer in minor units (ADR-0006):
 * `formatCurrency(123456, 'USD', 'en-US')` is `$1,234.56`.
 *
 * The amount is passed to `Intl` as an exact decimal string, so there is no
 * floating-point drift. Non-integer or unsafe amounts throw in development
 * (a sign of a unit bug at the call site) and are rounded in production.
 */
export function formatCurrency(
  minorUnits: number,
  currency: string,
  locale: string,
  options: FormatCurrencyOptions = {},
): string {
  let amount = minorUnits;
  if (!Number.isSafeInteger(amount)) {
    reportInvalid(
      `formatCurrency expects an integer amount in minor units (e.g. cents), received ${String(minorUnits)}. ` +
        'Convert at the boundary: Math.round(price * 100) for 2-digit currencies.',
    );
    amount = Math.round(amount);
  }
  const digits = getCurrencyDigits(currency, locale);
  const format = getNumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: options.currencyDisplay ?? 'symbol',
    signDisplay: options.signDisplay ?? 'auto',
    notation: options.notation ?? 'standard',
  });
  return format.format(toDecimalString(amount, digits));
}

/** Builds an exact decimal string (`-1234`, 2 digits -> `-12.34`). */
function toDecimalString(minorUnits: number, digits: number): `${number}` {
  if (!Number.isFinite(minorUnits)) return String(minorUnits) as `${number}`;
  const negative = minorUnits < 0;
  const padded = String(Math.abs(minorUnits)).padStart(digits + 1, '0');
  const integer = digits === 0 ? padded : padded.slice(0, -digits);
  const fraction = digits === 0 ? '' : `.${padded.slice(-digits)}`;
  return `${negative ? '-' : ''}${integer}${fraction}` as `${number}`;
}

/** Longest digit run kept; keeps the result a safe integer (2^53 has 16 digits). */
const MAX_DIGITS = 15;

const digitMaps = createCache<Map<string, string>>(50);

/** Maps the digits of the locale's numbering system (and ASCII) to `0`-`9`. */
function getDigitMap(locale: string): Map<string, string> {
  return digitMaps.get(locale, () => {
    const map = new Map<string, string>();
    const format = new Intl.NumberFormat(locale, { useGrouping: false });
    for (let digit = 0; digit <= 9; digit += 1) {
      map.set(String(digit), String(digit));
      map.set(format.format(digit), String(digit));
    }
    return map;
  });
}

/** Full-width digits (U+FF10-U+FF19) come from CJK input methods. */
function fullWidthDigit(char: string): string | undefined {
  const code = char.codePointAt(0) ?? 0;
  return code >= 0xff10 && code <= 0xff19 ? String(code - 0xff10) : undefined;
}

/**
 * Parses what the user typed in a currency field into integer minor units, using
 * the digits-only typing model: every digit shifts in from the right, and any
 * other character (separators, symbols, spaces, a sign) is ignored. Typing
 * `1`, `2`, `3` into a USD field yields `1`, `12`, `123`, shown as `$0.01`,
 * `$0.12`, `$1.23`. Digits of the locale's numbering system (e.g. Arabic-Indic)
 * and full-width digits count as digits. Empty input is `0`. Input longer than
 * 15 digits is cut, so the result is always a safe integer.
 *
 * `currency` is validated through `Intl` (throws `RangeError` for an invalid code).
 * Pasting `12` into a USD field means `$0.12` by this model; callers that want
 * to accept pasted decimals must handle paste before calling this function.
 */
export function parseCurrencyInput(text: string, currency: string, locale: string): number {
  getCurrencyDigits(currency, locale);
  const map = getDigitMap(locale);
  let digits = '';
  for (const char of text) {
    const digit = map.get(char) ?? fullWidthDigit(char);
    if (digit !== undefined) digits += digit;
  }
  if (digits === '') return 0;
  return Number(digits.slice(0, MAX_DIGITS));
}
