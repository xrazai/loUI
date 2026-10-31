import { describe, expect, it } from 'vitest';
import { formatCurrency, getCurrencyDigits, parseCurrencyInput } from './currency';

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

  it('caps the length so the result stays a safe integer', () => {
    const result = parseCurrencyInput('9'.repeat(30), 'USD', 'en-US');
    expect(Number.isSafeInteger(result)).toBe(true);
    expect(result).toBe(999_999_999_999_999);
  });

  it('is independent of the currency exponent', () => {
    expect(parseCurrencyInput('123', 'JPY', 'ja-JP')).toBe(123);
    expect(parseCurrencyInput('123', 'KWD', 'en-US')).toBe(123);
  });
});
