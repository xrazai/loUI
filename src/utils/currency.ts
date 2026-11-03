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

/** The decimal and grouping characters of a currency format in a locale. */
export function getCurrencySeparators(
  currency: string,
  locale: string,
): { decimal: string; group: string } {
  const parts = getNumberFormat(locale, { style: 'currency', currency }).formatToParts(-12345.6);
  return {
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
  };
}

export interface CurrencyAmountParts {
  /** Whole-unit digits as ASCII, without leading zeros (empty when none). */
  integer: string;
  /** Fraction digits as ASCII, cut to the currency's minor digits. */
  fraction: string;
  /** True when a decimal mark was found (even with no digits after it, as in `200,`). */
  hasDecimalMark: boolean;
  /** True when the text had more fraction digits than the currency allows (they were cut). */
  excessFraction: boolean;
}

/**
 * Splits text typed in whole units into integer and fraction digits. See
 * {@link parseCurrencyAmount} for the rules.
 */
export function splitCurrencyAmount(
  text: string,
  currency: string,
  locale: string,
): CurrencyAmountParts {
  const minorDigits = getCurrencyDigits(currency, locale);
  const map = getDigitMap(locale);
  const { decimal, group } = getCurrencySeparators(currency, locale);
  // A digit is a single ASCII character in `sequence`; anything longer-lived is a mark.
  const sequence: string[] = [];
  for (const char of text) {
    const digit = map.get(char) ?? fullWidthDigit(char);
    if (digit !== undefined) sequence.push(digit);
    else if (minorDigits > 0 && (char === '.' || char === ',' || char === decimal))
      sequence.push(char);
  }
  const isDigit = (entry: string | undefined) => entry !== undefined && /^\d$/u.test(entry);

  let markAt = -1;
  const last = sequence.findLastIndex((entry) => !isDigit(entry));
  if (last !== -1) {
    const mark = sequence[last] ?? '';
    const occurrences = sequence.filter((entry) => entry === mark).length;
    const after = sequence.length - last - 1;
    if (occurrences === 1) {
      if (mark === decimal) markAt = last;
      else if (after <= minorDigits && !(mark === group && after === 3)) markAt = last;
    }
  }

  const digitsOf = (entries: string[]) => entries.filter(isDigit).join('');
  const integer = digitsOf(markAt === -1 ? sequence : sequence.slice(0, markAt)).replace(
    /^0+/u,
    '',
  );
  const fractionAll = markAt === -1 ? '' : digitsOf(sequence.slice(markAt + 1));
  return {
    integer,
    fraction: fractionAll.slice(0, minorDigits),
    hasDecimalMark: markAt !== -1,
    excessFraction: fractionAll.length > minorDigits,
  };
}

/**
 * Parses what the user typed in **whole units** into integer minor units (the `amount` typing
 * mode of `CurrencyInput`): `200` is 200.00, so `20000` in BRL; `12,5` is `1250`.
 *
 * Rules, applied with string manipulation only (no floats):
 * - Digits are whole units until a decimal mark; the locale's own digits and full-width digits
 *   count. Other characters (symbols, spaces, signs, letters) are ignored.
 * - The **last** `.` or `,` (or the locale's decimal mark) starts the fraction when it is the
 *   only one of its kind and either it is the locale's decimal mark, or it is followed by at
 *   most as many digits as the currency has minor digits (and is not the locale's grouping
 *   mark followed by exactly three digits, as in `1.234` for KWD in pt-BR). Otherwise it is
 *   grouping and ignored: `1.234,56` and `1,234.56` are both 1234.56; `1,234` is 1234 in USD.
 * - Fraction digits beyond the currency's minor digits are cut (not rounded). Currencies with
 *   0 minor digits (JPY) have no fraction: every mark is ignored.
 * - A missing fraction is padded with zeros. Text without digits is `0`. The result is cut to
 *   15 digits so it is always a safe integer. The sign is not handled here.
 */
export function parseCurrencyAmount(text: string, currency: string, locale: string): number {
  const minorDigits = getCurrencyDigits(currency, locale);
  const { integer, fraction } = splitCurrencyAmount(text, currency, locale);
  const digits = `${integer}${fraction.padEnd(minorDigits, '0')}`.replace(/^0+/u, '');
  return digits === '' ? 0 : Number(digits.slice(0, MAX_DIGITS));
}
