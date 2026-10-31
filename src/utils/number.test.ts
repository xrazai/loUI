import { describe, expect, it } from 'vitest';
import { formatNumber, formatPercent } from './number';

describe('formatNumber', () => {
  it('uses locale separators', () => {
    expect(formatNumber(1234567.891, 'en-US')).toBe('1,234,567.891');
    expect(formatNumber(1234567.891, 'pt-BR')).toBe('1.234.567,891');
    expect(formatNumber(1234567.891, 'de-DE')).toBe('1.234.567,891');
  });

  it('handles zero, negatives and rounding', () => {
    expect(formatNumber(0, 'en-US')).toBe('0');
    expect(formatNumber(-1234.5, 'en-US')).toBe('-1,234.5');
    expect(formatNumber(1.005, 'en-US', { maximumFractionDigits: 2 })).toBe('1.01');
    expect(formatNumber(2, 'en-US', { minimumFractionDigits: 2 })).toBe('2.00');
  });

  it('supports options', () => {
    expect(formatNumber(1234, 'en-US', { useGrouping: false })).toBe('1234');
    expect(formatNumber(1500, 'en-US', { notation: 'compact' })).toBe('1.5K');
  });

  it('formats non-finite values the way Intl does', () => {
    expect(formatNumber(Number.NaN, 'en-US')).toBe('NaN');
    expect(formatNumber(Number.POSITIVE_INFINITY, 'en-US')).toBe('∞');
  });
});

describe('formatPercent', () => {
  it('formats ratios', () => {
    expect(formatPercent(0.256, 'en-US')).toBe('26%');
    expect(formatPercent(0.256, 'en-US', { maximumFractionDigits: 1 })).toBe('25.6%');
    expect(formatPercent(1, 'en-US')).toBe('100%');
    expect(formatPercent(0, 'en-US')).toBe('0%');
    expect(formatPercent(-0.5, 'en-US')).toBe('-50%');
    expect(formatPercent(1.5, 'en-US')).toBe('150%');
  });

  it('uses the locale spacing', () => {
    expect(formatPercent(0.25, 'de-DE')).toBe('25 %');
    expect(formatPercent(0.25, 'pt-BR')).toBe('25%');
  });
});
