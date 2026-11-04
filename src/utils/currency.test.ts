import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  getCurrencyDigits,
  parseCurrencyAmount,
  parseCurrencyInput,
} from './currency';

const NBSP = ' ';

describe('getCurrencyDigits', () => {
  it('reads the minor-unit exponent from Intl', () => {
    expect(getCurrencyDigits('USD', 'en-US')).toBe(2);
    expect(getCurrencyDigits('BRL', 'pt-BR')).toBe(2);
    expect(getCurrencyDigits('JPY', 'en-US')).toBe(0);
    expect(getCurrencyDigits('KWD', 'en-US')).toBe(3);
  });
});

describe('formatCurrency', () => {
  it('formats USD in en-US', () => {
    expect(formatCurrency(123456, 'USD', 'en-US')).toBe('$1,234.56');
    expect(formatCurrency(0, 'USD', 'en-US')).toBe('$0.00');
    expect(formatCurrency(1, 'USD', 'en-US')).toBe('$0.01');
    expect(formatCurrency(100, 'USD', 'en-US')).toBe('$1.00');
    expect(formatCurrency(99, 'USD', 'en-US')).toBe('$0.99');
  });

  it('formats BRL in pt-BR', () => {
    expect(formatCurrency(123456, 'BRL', 'pt-BR')).toBe(`R$${NBSP}1.234,56`);
  });

  it('puts the symbol after the number in de-DE', () => {
    expect(formatCurrency(123456, 'EUR', 'de-DE')).toBe(`1.234,56${NBSP}€`);
  });

  it('respects zero-decimal currencies (JPY)', () => {
    expect(formatCurrency(1235, 'JPY', 'en-US')).toBe('¥1,235');
    expect(formatCurrency(0, 'JPY', 'en-US')).toBe('¥0');
  });

  it('respects three-decimal currencies (KWD)', () => {
    expect(formatCurrency(1234, 'KWD', 'en-US')).toBe(`KWD${NBSP}1.234`);
    expect(formatCurrency(5, 'KWD', 'en-US', { currencyDisplay: 'code' })).toBe(`KWD${NBSP}0.005`);
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-123456, 'USD', 'en-US')).toBe('-$1,234.56');
    expect(formatCurrency(-1, 'USD', 'en-US')).toBe('-$0.01');
    expect(formatCurrency(-5, 'JPY', 'en-US')).toBe('-¥5');
  });

  it('does not show a negative zero', () => {
    expect(formatCurrency(-0, 'USD', 'en-US')).toBe('$0.00');
  });

  it('is exact for large amounts (no floating-point drift)', () => {
    expect(formatCurrency(9_007_199_254_740_991, 'USD', 'en-US')).toBe('$90,071,992,547,409.91');
    expect(formatCurrency(1_000_000_000_001, 'USD', 'en-US')).toBe('$10,000,000,000.01');
  });

  it('supports display options', () => {
    expect(formatCurrency(123456, 'USD', 'en-US', { notation: 'compact' })).toBe('$1.2K');
    expect(formatCurrency(100, 'USD', 'en-US', { currencyDisplay: 'code' })).toBe(`USD${NBSP}1.00`);
    expect(formatCurrency(100, 'USD', 'en-US', { signDisplay: 'always' })).toBe('+$1.00');
    expect(formatCurrency(-100, 'USD', 'en-US', { signDisplay: 'never' })).toBe('$1.00');
    expect(formatCurrency(0, 'USD', 'en-US', { signDisplay: 'exceptZero' })).toBe('$0.00');
  });

  it('rejects fractional amounts in development with a clear message', () => {
    expect(() => formatCurrency(12.5, 'USD', 'en-US')).toThrow(/integer amount in minor units/);
    expect(() => formatCurrency(0.1 + 0.2, 'USD', 'en-US')).toThrow(RangeError);
  });

  it('rejects NaN, Infinity and unsafe integers in development', () => {
    expect(() => formatCurrency(Number.NaN, 'USD', 'en-US')).toThrow(/NaN/);
    expect(() => formatCurrency(Number.POSITIVE_INFINITY, 'USD', 'en-US')).toThrow(RangeError);
    expect(() => formatCurrency(2 ** 53, 'USD', 'en-US')).toThrow(RangeError);
  });

  it('rejects an invalid currency code', () => {
    expect(() => formatCurrency(100, 'NOPE', 'en-US')).toThrow(RangeError);
  });
});

describe('parseCurrencyInput (digits-only typing model)', () => {
  it('shifts digits in from the right', () => {
    expect(['1', '12', '123', '1234'].map((t) => parseCurrencyInput(t, 'USD', 'en-US'))).toEqual([
      1, 12, 123, 1234,
    ]);
  });

  it('round-trips what formatCurrency produced', () => {
    for (const [amount, currency, locale] of [
      [123456, 'USD', 'en-US'],
      [123456, 'BRL', 'pt-BR'],
      [123456, 'EUR', 'de-DE'],
      [1235, 'JPY', 'ja-JP'],
      [1234, 'KWD', 'en-US'],
      [0, 'USD', 'en-US'],
    ] as const) {
      expect(parseCurrencyInput(formatCurrency(amount, currency, locale), currency, locale)).toBe(
        amount,
      );
    }
  });

  it('ignores separators, symbols, spaces and signs', () => {
    expect(parseCurrencyInput('R$ 1.234,56', 'BRL', 'pt-BR')).toBe(123456);
    expect(parseCurrencyInput('-$1,234.56', 'USD', 'en-US')).toBe(123456);
    expect(parseCurrencyInput('  1 2 3  ', 'USD', 'en-US')).toBe(123);
  });

  it('treats empty and digit-free input as zero', () => {
    expect(parseCurrencyInput('', 'USD', 'en-US')).toBe(0);
    expect(parseCurrencyInput('abc', 'USD', 'en-US')).toBe(0);
    expect(parseCurrencyInput('$', 'USD', 'en-US')).toBe(0);
  });

  it('drops leading zeros', () => {
    expect(parseCurrencyInput('0001', 'USD', 'en-US')).toBe(1);
    expect(parseCurrencyInput('$0.00', 'USD', 'en-US')).toBe(0);
  });

  it('returns NaN above 15 digits instead of cutting the number (D-B2)', () => {
    expect(parseCurrencyInput('9'.repeat(15), 'USD', 'en-US')).toBe(Number('9'.repeat(15)));
    expect(parseCurrencyInput('1234567890123456', 'USD', 'en-US')).toBeNaN();
    expect(parseCurrencyInput('9'.repeat(40), 'USD', 'en-US')).toBeNaN();
    expect(parseCurrencyInput('0'.repeat(20) + '7', 'USD', 'en-US')).toBe(7);
  });

  it('handles Backspace (the formatted text loses its last digit)', () => {
    expect(parseCurrencyInput('$12.3', 'USD', 'en-US')).toBe(123);
  });

  it('reads locale digits and full-width digits', () => {
    expect(parseCurrencyInput('١٢٣', 'EGP', 'ar-EG')).toBe(123);
    expect(parseCurrencyInput('１２３', 'JPY', 'ja-JP')).toBe(123);
  });

  it('does not treat vulgar fractions or superscripts as digits', () => {
    expect(parseCurrencyInput('½', 'USD', 'en-US')).toBe(0);
    expect(parseCurrencyInput('²', 'USD', 'en-US')).toBe(0);
  });

  it('keeps 15 digits exactly and never cuts a longer text', () => {
    expect(parseCurrencyInput('9'.repeat(15), 'USD', 'en-US')).toBe(999_999_999_999_999);
    expect(parseCurrencyInput('9'.repeat(30), 'USD', 'en-US')).toBeNaN();
  });

  it('is independent of the currency exponent', () => {
    expect(parseCurrencyInput('123', 'JPY', 'ja-JP')).toBe(123);
    expect(parseCurrencyInput('123', 'KWD', 'en-US')).toBe(123);
  });
});

describe('parseCurrencyAmount (whole-unit typing)', () => {
  it('reads digits as whole units', () => {
    expect(parseCurrencyAmount('200', 'BRL', 'pt-BR')).toBe(20000);
    expect(parseCurrencyAmount('200', 'USD', 'en-US')).toBe(20000);
    expect(parseCurrencyAmount('', 'USD', 'en-US')).toBe(0);
    expect(parseCurrencyAmount('abc', 'USD', 'en-US')).toBe(0);
  });

  it('starts the fraction at the locale decimal mark, and at the other mark when it fits', () => {
    expect(parseCurrencyAmount('12,5', 'BRL', 'pt-BR')).toBe(1250);
    expect(parseCurrencyAmount('12.5', 'BRL', 'pt-BR')).toBe(1250);
    expect(parseCurrencyAmount('12.50', 'USD', 'en-US')).toBe(1250);
    expect(parseCurrencyAmount('12,50', 'USD', 'en-US')).toBe(1250);
    expect(parseCurrencyAmount('200,', 'BRL', 'pt-BR')).toBe(20000);
    expect(parseCurrencyAmount(',5', 'BRL', 'pt-BR')).toBe(50);
  });

  it('treats a mark followed by more digits than the currency has as grouping', () => {
    expect(parseCurrencyAmount('1.234,56', 'BRL', 'pt-BR')).toBe(123456);
    expect(parseCurrencyAmount('1,234.56', 'USD', 'en-US')).toBe(123456);
    expect(parseCurrencyAmount('1,234', 'USD', 'en-US')).toBe(123400);
    expect(parseCurrencyAmount('1.234', 'BRL', 'pt-BR')).toBe(123400);
    expect(parseCurrencyAmount('1.234.567', 'USD', 'en-US')).toBe(123456700);
  });

  it('cuts extra fraction digits after the locale decimal mark', () => {
    expect(parseCurrencyAmount('12,567', 'BRL', 'pt-BR')).toBe(1256);
    expect(parseCurrencyAmount('12.567', 'USD', 'en-US')).toBe(1256);
  });

  it('handles 0 and 3 digit currencies', () => {
    expect(parseCurrencyAmount('1500', 'JPY', 'en-US')).toBe(1500);
    expect(parseCurrencyAmount('1,500', 'JPY', 'en-US')).toBe(1500);
    expect(parseCurrencyAmount('1.500', 'JPY', 'pt-BR')).toBe(1500);
    expect(parseCurrencyAmount('1.5', 'KWD', 'en-US')).toBe(1500);
    expect(parseCurrencyAmount('1.234', 'KWD', 'en-US')).toBe(1234);
    expect(parseCurrencyAmount('1.234', 'KWD', 'pt-BR')).toBe(1234000);
    expect(parseCurrencyAmount('1.234,567', 'KWD', 'pt-BR')).toBe(1234567);
  });

  it('ignores symbols, spaces and signs, understands other digits, and is a safe integer', () => {
    expect(parseCurrencyAmount('R$ 1.234,50', 'BRL', 'pt-BR')).toBe(123450);
    expect(parseCurrencyAmount('-$5', 'USD', 'en-US')).toBe(500);
    expect(parseCurrencyAmount('９９', 'USD', 'en-US')).toBe(9900);
  });

  it('returns NaN above 15 digits instead of cutting the number (D-B2)', () => {
    expect(parseCurrencyAmount('9'.repeat(30), 'USD', 'en-US')).toBeNaN();
    expect(parseCurrencyAmount('9'.repeat(14), 'USD', 'en-US')).toBeNaN();
    expect(parseCurrencyAmount('9'.repeat(13), 'USD', 'en-US')).toBe(999999999999900);
    expect(parseCurrencyAmount('12345678901234.56', 'USD', 'en-US')).toBeNaN();
    expect(parseCurrencyAmount('0'.repeat(20) + '5', 'USD', 'en-US')).toBe(500);
  });
});
