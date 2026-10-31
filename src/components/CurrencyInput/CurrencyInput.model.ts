import { getCurrencyDigits, parseCurrencyInput } from '../../utils/currency';
import { getNumberFormat } from '../../utils/number';

/**
 * Pure helpers behind `CurrencyInput`. All money is an integer in minor units (ADR-0006); no
 * function here multiplies or divides by a power of ten as a float, so the cents never drift.
 */

/** Longest digit run `parseCurrencyInput` keeps; also the upper bound of `maxDigits`. */
export const MAX_SAFE_DIGITS = 15;

const ANY_DIGIT = /\p{Nd}/u;
const MINUS = /[-−]/gu;

/** Builds an exact decimal string: `(-1234, 2)` gives `-12.34`, `(5, 2)` gives `0.05`. */
export function toDecimalString(minorUnits: number, digits: number, negativeZero = false): string {
  const negative = minorUnits < 0 || (minorUnits === 0 && negativeZero);
  const padded = String(Math.abs(minorUnits)).padStart(digits + 1, '0');
  const integer = digits === 0 ? padded : padded.slice(0, -digits);
  const fraction = digits === 0 ? '' : `.${padded.slice(-digits)}`;
  return `${negative ? '-' : ''}${integer}${fraction}`;
}

/**
 * The amount as the field shows it: the currency's own format, symbol included
 * (`123456` in USD is `$1,234.56`, in BRL `R$ 1.234,56`). The symbol is part of the text, so
 * screen readers announce it with the amount; the typing model ignores it. `negativeZero` keeps
 * the minus sign while the user has typed `-` but no digit yet.
 */
export function formatMinorCurrency(
  minorUnits: number,
  currency: string,
  locale: string,
  negativeZero = false,
): string {
  const digits = getCurrencyDigits(currency, locale);
  const format = getNumberFormat(locale, { style: 'currency', currency });
  return format.format(toDecimalString(minorUnits, digits, negativeZero) as `${number}`);
}

export interface TypedAmount {
  /** Signed minor units; `null` when the field was emptied. */
  minorUnits: number | null;
  /** True for `-0`: the user typed a minus sign and no digit yet. */
  negativeZero: boolean;
}

export interface TypingOptions {
  currency: string;
  locale: string;
  allowNegative: boolean;
  maxDigits: number;
}

function hasDigit(text: string): boolean {
  return ANY_DIGIT.test(text);
}

function countMinus(text: string): number {
  return text.match(MINUS)?.length ?? 0;
}

function clampDigits(maxDigits: number): number {
  return Math.min(MAX_SAFE_DIGITS, Math.max(1, Math.trunc(maxDigits)));
}

/**
 * Interprets the text of the box after an edit with the digits-only typing model
 * (`parseCurrencyInput`): digits shift in from the right, separators and symbols are ignored.
 * An odd number of minus signs means negative (typing `-` again flips it back) when
 * `allowNegative`; otherwise minus signs are ignored. Returns `undefined` when the edit would
 * exceed `maxDigits`: the caller keeps the previous value.
 */
export function interpretTyping(text: string, options: TypingOptions): TypedAmount | undefined {
  const negative = options.allowNegative && countMinus(text) % 2 === 1;
  if (!hasDigit(text)) {
    return negative
      ? { minorUnits: 0, negativeZero: true }
      : { minorUnits: null, negativeZero: false };
  }
  const magnitude = parseCurrencyInput(text, options.currency, options.locale);
  if (String(magnitude).length > clampDigits(options.maxDigits) && magnitude !== 0)
    return undefined;
  return {
    minorUnits: negative && magnitude !== 0 ? -magnitude : magnitude,
    negativeZero: negative && magnitude === 0,
  };
}

interface Separators {
  decimal: string;
  group: string;
}

function getSeparators(currency: string, locale: string): Separators {
  const parts = getNumberFormat(locale, { style: 'currency', currency }).formatToParts(-12345.6);
  return {
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
  };
}

function isSeparator(char: string, separators: Separators): boolean {
  return char === '.' || char === ',' || char === separators.decimal || char === separators.group;
}

/** Splits `integer` + `fraction` digit strings into minor units, rounding half up. */
function toMinorUnits(integer: string, fraction: string, digits: number): number {
  const kept = fraction.slice(0, digits).padEnd(digits, '0');
  let minor = Number(`${integer || '0'}${kept}`);
  if (fraction.length > digits && Number(fraction[digits]) >= 5) minor += 1;
  return minor;
}

/**
 * Interprets pasted text, which (unlike typing) usually carries a decimal separator:
 * `12.50` and `12,50` both paste as 1250 in USD. The locale decides what its own `.` and `,`
 * mean (`1.234` is 1234 in pt-BR and 1.23 in en-US); a lone separator followed by 1 to
 * `digits` digits that cannot be a thousands group is read as the decimal mark; anything else
 * is grouping. Fractions longer than the currency allows are rounded half up. Returns
 * `undefined` when the text has no digits or is longer than `maxDigits`.
 */
export function interpretPaste(text: string, options: TypingOptions): TypedAmount | undefined {
  if (!hasDigit(text)) return undefined;
  const digits = getCurrencyDigits(options.currency, options.locale);
  const separators = getSeparators(options.currency, options.locale);

  // Normalize locale and full-width digits to ASCII; keep separators in place.
  const sequence: string[] = [];
  for (const char of text) {
    if (hasDigit(char))
      sequence.push(String(parseCurrencyInput(char, options.currency, options.locale)));
    else if (isSeparator(char, separators)) sequence.push(char);
  }

  // The last separator is the decimal mark when the locale says so, or when it appears once and
  // is followed by 1 to `digits` digits but not exactly 3 (which reads as a thousands group).
  let decimalAt = -1;
  const lastSeparator = sequence.findLastIndex((char) => !/^\d$/u.test(char));
  if (lastSeparator !== -1) {
    const char = sequence[lastSeparator] ?? '';
    const occurrences = sequence.filter((entry) => entry === char).length;
    const after = sequence.slice(lastSeparator + 1).filter((entry) => /^\d$/u.test(entry)).length;
    if (occurrences === 1 && after > 0) {
      if (char === separators.decimal) decimalAt = lastSeparator;
      else if (after <= digits && after !== 3) decimalAt = lastSeparator;
    }
  }

  const digitsOnly = (entries: string[]) => entries.filter((entry) => /^\d$/u.test(entry)).join('');
  const integer = digitsOnly(decimalAt === -1 ? sequence : sequence.slice(0, decimalAt));
  const fraction = decimalAt === -1 ? '' : digitsOnly(sequence.slice(decimalAt + 1));
  const magnitude = toMinorUnits(integer.replace(/^0+(?=\d)/u, ''), fraction, digits);
  if (String(magnitude).length > clampDigits(options.maxDigits) && magnitude !== 0)
    return undefined;
  const negative = options.allowNegative && countMinus(text) % 2 === 1;
  return {
    minorUnits: negative && magnitude !== 0 ? -magnitude : magnitude,
    negativeZero: negative && magnitude === 0,
  };
}
