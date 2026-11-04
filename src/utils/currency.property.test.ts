import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  getCurrencyDigits,
  parseCurrencyAmount,
  parseCurrencyInput,
} from './currency';

const CASES = [
  { currency: 'USD', locale: 'en-US' },
  { currency: 'BRL', locale: 'pt-BR' },
  { currency: 'EUR', locale: 'pt-BR' },
  { currency: 'JPY', locale: 'en-US' },
  { currency: 'KWD', locale: 'en-US' },
] as const;
const caseArb = fc.constantFrom(...CASES);
/** Largest amount parseCurrencyInput keeps (15 digits). */
const MAX_PARSEABLE = 10 ** 15 - 1;

describe('formatCurrency (properties)', () => {
  it('never throws for safe integers and always returns a non-empty string', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }),
        caseArb,
        (amount, { currency, locale }) => {
          expect(formatCurrency(amount, currency, locale).length).toBeGreaterThan(0);
        },
      ),
    );
  });

  it('is exact: the digits shown are the minor units, with no floating-point drift', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
        caseArb,
        (amount, { currency, locale }) => {
          const digits = getCurrencyDigits(currency, locale);
          const shown = formatCurrency(amount, currency, locale, { currencyDisplay: 'name' });
          // The name display adds words but no digits, so the digit run is the padded amount.
          expect(shown.replace(/\D/g, '')).toBe(String(amount).padStart(digits + 1, '0'));
        },
      ),
    );
  });

  it('parses back to the same minor units (en-US and pt-BR round trip)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_PARSEABLE }),
        caseArb,
        (amount, { currency, locale }) => {
          const text = formatCurrency(amount, currency, locale);
          expect(parseCurrencyInput(text, currency, locale)).toBe(amount);
        },
      ),
    );
  });

  it('negates cleanly: the negative amount shows a sign and the same digits', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: MAX_PARSEABLE }),
        caseArb,
        (amount, { currency, locale }) => {
          const positive = formatCurrency(amount, currency, locale);
          const negative = formatCurrency(-amount, currency, locale);
          expect(negative).not.toBe(positive);
          expect(negative.replace(/\D/g, '')).toBe(positive.replace(/\D/g, ''));
        },
      ),
    );
  });

  it('signDisplay "never" makes the sign irrelevant', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_PARSEABLE }),
        caseArb,
        (amount, { currency, locale }) => {
          expect(formatCurrency(-amount, currency, locale, { signDisplay: 'never' })).toBe(
            formatCurrency(amount, currency, locale, { signDisplay: 'never' }),
          );
        },
      ),
    );
  });
});

describe('parseCurrencyInput (properties)', () => {
  it('returns a safe, non-negative integer, or NaN above 15 digits, whatever was typed', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'binary' }), caseArb, (text, { currency, locale }) => {
        const value = parseCurrencyInput(text, currency, locale);
        if (Number.isNaN(value)) {
          expect(text.replace(/\D/gu, '').replace(/^0+/u, '').length).toBeGreaterThan(15);
          return;
        }
        expect(Number.isSafeInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it('shifts digits in from the right and ignores every other character', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9]{0,12}$/),
        fc.stringMatching(/^[ .,$+-]{0,6}$/),
        (digits, noise) => {
          const expected = digits === '' ? 0 : Number(digits);
          const mixed = digits.replace(/\d/g, (d) => d + noise);
          expect(parseCurrencyInput(mixed, 'USD', 'en-US')).toBe(expected);
          expect(parseCurrencyInput(digits, 'USD', 'en-US')).toBe(expected);
        },
      ),
    );
  });
});

describe('parseCurrencyAmount (properties)', () => {
  const roundTripCases = fc.constantFrom(
    ...(['USD', 'BRL', 'JPY', 'KWD'] as const).flatMap((currency) =>
      (['en-US', 'pt-BR'] as const).map((locale) => ({ currency, locale })),
    ),
  );

  it('round-trips: parsing the formatted amount gives the amount back', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_PARSEABLE }),
        roundTripCases,
        (amount, { currency, locale }) => {
          const shown = formatCurrency(amount, currency, locale);
          expect(parseCurrencyAmount(shown, currency, locale)).toBe(amount);
        },
      ),
    );
  });

  it('whole units without a mark are multiplied by the minor unit, exactly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 ** 9 }),
        roundTripCases,
        (whole, { currency, locale }) => {
          const digits = getCurrencyDigits(currency, locale);
          expect(parseCurrencyAmount(String(whole), currency, locale)).toBe(
            Number(`${whole}${'0'.repeat(digits)}`),
          );
        },
      ),
    );
  });

  it('returns a non-negative safe integer, or NaN, never a shortened number', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 40 }), roundTripCases, (text, { currency, locale }) => {
        const value = parseCurrencyAmount(text, currency, locale);
        if (Number.isNaN(value)) return;
        expect(Number.isSafeInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it('is NaN exactly when the digits exceed 15, otherwise the digits as written', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[1-9][0-9]{0,24}$/),
        roundTripCases,
        (whole, { currency, locale }) => {
          const digits = getCurrencyDigits(currency, locale);
          const value = parseCurrencyAmount(whole, currency, locale);
          if (whole.length + digits > 15) expect(value).toBeNaN();
          else expect(value).toBe(Number(`${whole}${'0'.repeat(digits)}`));
        },
      ),
    );
  });
});
