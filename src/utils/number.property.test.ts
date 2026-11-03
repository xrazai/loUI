import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { formatNumber, formatPercent } from './number';

const localeArb = fc.constantFrom('en-US', 'pt-BR');

/** Parses what Intl produced back to a number, for the two locales under test. */
function parseLocaleNumber(text: string, locale: string): number {
  const normalized =
    locale === 'pt-BR' ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
  // Intl may use U+2212 for the minus sign in some locales.
  return Number(normalized.replace(/−/g, '-').replace(/[^\d.-]/g, ''));
}

describe('number (properties)', () => {
  it('formatNumber of a safe integer round-trips exactly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }),
        localeArb,
        (n, locale) => {
          expect(parseLocaleNumber(formatNumber(n, locale), locale)).toBe(n);
        },
      ),
    );
  });

  it('formatNumber with fixed fraction digits stays within half a unit of the input', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e9, max: 1e9, noNaN: true }),
        fc.integer({ min: 0, max: 4 }),
        localeArb,
        (n, digits, locale) => {
          const text = formatNumber(n, locale, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          });
          expect(Math.abs(parseLocaleNumber(text, locale) - n)).toBeLessThanOrEqual(
            0.5 * 10 ** -digits + 1e-9,
          );
        },
      ),
    );
  });

  it('formatPercent shows the ratio times 100 with a percent sign', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), localeArb, (whole, locale) => {
        const text = formatPercent(whole / 100, locale);
        expect(text).toContain('%');
        expect(parseLocaleNumber(text, locale)).toBe(whole);
      }),
    );
  });
});
