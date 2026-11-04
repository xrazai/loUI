import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { getCurrencyDigits, splitCurrencyAmount } from '../../utils/currency';
import {
  formatMinorCurrency,
  interpretAmountTyping,
  interpretPaste,
  interpretTyping,
  toDecimalString,
} from './CurrencyInput.model';
import type { TypingOptions } from './CurrencyInput.model';

const usd: TypingOptions = {
  currency: 'USD',
  locale: 'en-US',
  allowNegative: false,
  maxDigits: 15,
};
const brl: TypingOptions = {
  currency: 'BRL',
  locale: 'pt-BR',
  allowNegative: false,
  maxDigits: 15,
};

describe('toDecimalString', () => {
  it('builds exact decimals for any number of digits', () => {
    expect(toDecimalString(1234, 2)).toBe('12.34');
    expect(toDecimalString(5, 2)).toBe('0.05');
    expect(toDecimalString(0, 2)).toBe('0.00');
    expect(toDecimalString(-1234, 2)).toBe('-12.34');
    expect(toDecimalString(500, 0)).toBe('500');
    expect(toDecimalString(1234567, 3)).toBe('1234.567');
    expect(toDecimalString(0, 2, true)).toBe('-0.00');
  });

  it('is exact where floating point is not (0.1 + 0.2, 9007199254740 cents)', () => {
    // 0.1 + 0.2 === 0.30000000000000004: the same money in minor units is just 10 + 20.
    expect(toDecimalString(10 + 20, 2)).toBe('0.30');
    expect(toDecimalString(999_999_999_999_999, 2)).toBe('9999999999999.99');
  });
});

describe('formatMinorCurrency', () => {
  it('uses the currency format of the locale, symbol included', () => {
    expect(formatMinorCurrency(123456, 'USD', 'en-US')).toBe('$1,234.56');
    expect(formatMinorCurrency(123456, 'BRL', 'pt-BR')).toBe('R$\u00a01.234,56');
    expect(formatMinorCurrency(123456, 'EUR', 'de-DE')).toBe('1.234,56\u00a0\u20ac');
    expect(formatMinorCurrency(5, 'USD', 'en-US')).toBe('$0.05');
    expect(formatMinorCurrency(1234, 'JPY', 'en-US')).toBe('\u00a51,234');
    expect(formatMinorCurrency(1234567, 'KWD', 'en-US')).toBe('KWD\u00a01,234.567');
    expect(formatMinorCurrency(-1234, 'USD', 'en-US')).toBe('-$12.34');
    expect(formatMinorCurrency(0, 'USD', 'en-US', true)).toBe('-$0.00');
  });

  it('formats a 15-digit amount exactly', () => {
    expect(formatMinorCurrency(999_999_999_999_999, 'USD', 'en-US')).toBe('$9,999,999,999,999.99');
  });
});

describe('interpretTyping (digits shift in from the right)', () => {
  it('shifts digits in and out, ignoring separators and symbols', () => {
    expect(interpretTyping('1', usd)).toEqual({ minorUnits: 1, negativeZero: false });
    expect(interpretTyping('0.012', usd)).toEqual({ minorUnits: 12, negativeZero: false });
    expect(interpretTyping('1,234.567', usd)).toEqual({ minorUnits: 1234567, negativeZero: false });
    expect(interpretTyping('1.234,567', brl)).toEqual({ minorUnits: 1234567, negativeZero: false });
    expect(interpretTyping('0.0', usd)).toEqual({ minorUnits: 0, negativeZero: false });
  });

  it('returns null for an emptied field', () => {
    expect(interpretTyping('', usd)).toEqual({ minorUnits: null, negativeZero: false });
    expect(interpretTyping('abc', usd)).toEqual({ minorUnits: null, negativeZero: false });
  });

  it('ignores minus signs unless negatives are allowed, and toggles with each minus', () => {
    expect(interpretTyping('-12.34', usd)?.minorUnits).toBe(1234);
    const negative = { ...usd, allowNegative: true };
    expect(interpretTyping('-12.34', negative)?.minorUnits).toBe(-1234);
    expect(interpretTyping('-12.345', negative)?.minorUnits).toBe(-12345);
    expect(interpretTyping('-12.34-', negative)?.minorUnits).toBe(1234);
    expect(interpretTyping('−12.34', negative)?.minorUnits).toBe(-1234);
    expect(interpretTyping('-', negative)).toEqual({ minorUnits: 0, negativeZero: true });
    expect(interpretTyping('-0.00', negative)).toEqual({ minorUnits: 0, negativeZero: true });
  });

  it('rejects an edit that exceeds maxDigits', () => {
    const limited = { ...usd, maxDigits: 5 };
    expect(interpretTyping('123.45', limited)?.minorUnits).toBe(12345);
    expect(interpretTyping('1,234.56', limited)).toBeUndefined();
  });

  it('accepts locale and full-width digits', () => {
    expect(interpretTyping('１２', usd)?.minorUnits).toBe(12);
  });
});

describe('interpretPaste', () => {
  it('reads a decimal mark as the decimal mark', () => {
    expect(interpretPaste('12.50', usd)?.minorUnits).toBe(1250);
    expect(interpretPaste('12,50', usd)?.minorUnits).toBe(1250);
    expect(interpretPaste('12,50', brl)?.minorUnits).toBe(1250);
    expect(interpretPaste('12.5', usd)?.minorUnits).toBe(1250);
    expect(interpretPaste('12.5', brl)?.minorUnits).toBe(1250);
  });

  it('reads thousands groups as grouping', () => {
    expect(interpretPaste('1,234.56', usd)?.minorUnits).toBe(123456);
    expect(interpretPaste('1.234,56', brl)?.minorUnits).toBe(123456);
    expect(interpretPaste('1.234.567,89', brl)?.minorUnits).toBe(123456789);
    expect(interpretPaste('1,234', usd)?.minorUnits).toBe(123400);
    expect(interpretPaste('1.234', brl)?.minorUnits).toBe(123400);
  });

  it('strips symbols and spaces, and pastes a whole number as major units', () => {
    expect(interpretPaste('R$ 1.234,56', brl)?.minorUnits).toBe(123456);
    expect(interpretPaste('$ 1,234.56 USD', usd)?.minorUnits).toBe(123456);
    expect(interpretPaste('12', usd)?.minorUnits).toBe(1200);
  });

  it('rounds half up beyond the currency digits', () => {
    expect(interpretPaste('1.234', usd)?.minorUnits).toBe(123);
    expect(interpretPaste('1.235', usd)?.minorUnits).toBe(124);
    expect(interpretPaste('0.999', usd)?.minorUnits).toBe(100);
  });

  it('handles currencies with 0 and 3 digits', () => {
    const jpy = { ...usd, currency: 'JPY' };
    expect(interpretPaste('1,234', jpy)?.minorUnits).toBe(1234);
    const kwd = { ...usd, currency: 'KWD' };
    expect(interpretPaste('1.234', kwd)?.minorUnits).toBe(1234);
    expect(interpretPaste('1.5', kwd)?.minorUnits).toBe(1500);
  });

  it('keeps the sign only when negatives are allowed', () => {
    expect(interpretPaste('-12.50', usd)?.minorUnits).toBe(1250);
    expect(interpretPaste('-12.50', { ...usd, allowNegative: true })?.minorUnits).toBe(-1250);
  });

  it('ignores text without digits and rejects text over maxDigits', () => {
    expect(interpretPaste('abc', usd)).toBeUndefined();
    expect(interpretPaste('123456.78', { ...usd, maxDigits: 5 })).toBeUndefined();
  });

  it('is exact for large values', () => {
    expect(interpretPaste('9,999,999,999,999.99', usd)?.minorUnits).toBe(999_999_999_999_999);
  });
});

describe('interpretAmountTyping decimal lock (D-M2)', () => {
  it('refuses the digit that would regroup a typed decimal (pt-BR "12.90" then "5")', () => {
    expect(interpretAmountTyping('12.90', brl, '12.9')?.typed.minorUnits).toBe(1290);
    expect(interpretAmountTyping('12.905', brl, '12.90')).toBeUndefined();
    // Without the previous draft (paste, fresh text) the smart reading still applies.
    expect(interpretAmountTyping('12.905', brl)?.typed.minorUnits).toBe(1290500);
  });

  it('keeps the lock when digits are typed in the integer part', () => {
    expect(interpretAmountTyping('112.90', brl, '12.90')?.typed.minorUnits).toBe(11290);
  });

  it('drops the lock once the mark is deleted', () => {
    expect(interpretAmountTyping('1290', brl, '12.90')?.typed.minorUnits).toBe(129000);
  });

  it('refuses a second mark of the locked kind', () => {
    expect(interpretAmountTyping('12.9.0', brl, '12.9')).toBeUndefined();
  });
});

describe('D-B2 over-long input', () => {
  it('ignores a paste with more than 15 digits instead of cutting it', () => {
    expect(interpretPaste('1234567890123456', usd)).toBeUndefined();
    expect(interpretPaste('99999999999999999999', usd)).toBeUndefined();
    expect(interpretPaste('1000000000000000000000', usd)).toBeUndefined();
    expect(interpretPaste('0000000000000000012.50', usd)?.minorUnits).toBe(1250);
  });

  it('ignores a typed digit past 15 digits', () => {
    expect(interpretTyping('9999999999999999', usd)).toBeUndefined();
    expect(interpretTyping('999999999999999', usd)?.minorUnits).toBe(999999999999999);
  });
});

describe('interpretAmountTyping decimal lock (property)', () => {
  const cases = fc.constantFrom(
    { options: usd, minor: 2 },
    { options: brl, minor: 2 },
    { options: { ...usd, currency: 'KWD' }, minor: 3 },
    { options: { ...brl, currency: 'KWD' }, minor: 3 },
  );
  const keystrokes = fc.array(fc.constantFrom(...'0123456789'.split(''), '.', ',', '.', ','), {
    maxLength: 24,
  });

  it('once a prefix was read with a fraction, extending it never regroups into a larger order of magnitude', () => {
    fc.assert(
      fc.property(cases, keystrokes, ({ options }, keys) => {
        const scale = 10 ** getCurrencyDigits(options.currency, options.locale);
        let draft = '';
        let previous = 0;
        for (const key of keys) {
          const result = interpretAmountTyping(draft + key, options, draft);
          if (!result) continue;
          const value = result.typed.minorUnits ?? 0;
          const hadFraction = splitCurrencyAmount(
            draft,
            options.currency,
            options.locale,
          ).hasDecimalMark;
          if (hadFraction) {
            expect(Math.floor(value / scale)).toBe(Math.floor(previous / scale));
            if (previous > 0) expect(value).toBeLessThan(previous * 10);
          }
          draft = result.draft;
          previous = value;
        }
      }),
      { numRuns: 500 },
    );
  });
});
