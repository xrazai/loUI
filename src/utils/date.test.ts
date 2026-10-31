import { describe, expect, it } from 'vitest';
import {
  daysBetween,
  dueStatus,
  formatDate,
  formatRelativeDays,
  isISODate,
  toISODate,
} from './date';

describe('isISODate', () => {
  it('accepts real dates only', () => {
    expect(isISODate('2026-10-31')).toBe(true);
    expect(isISODate('2024-02-29')).toBe(true);
    expect(isISODate('2026-02-29')).toBe(false);
    expect(isISODate('2026-13-01')).toBe(false);
    expect(isISODate('2026-00-10')).toBe(false);
    expect(isISODate('2026-04-31')).toBe(false);
    expect(isISODate('2026-1-5')).toBe(false);
    expect(isISODate('2026-10-31T10:00:00Z')).toBe(false);
    expect(isISODate('')).toBe(false);
    expect(isISODate('0099-01-01')).toBe(true);
  });
});

describe('formatDate', () => {
  it('formats the styles in en-US', () => {
    expect(formatDate('2026-10-31', 'en-US', 'short')).toBe('10/31/26');
    expect(formatDate('2026-10-31', 'en-US', 'medium')).toBe('Oct 31, 2026');
    expect(formatDate('2026-10-31', 'en-US', 'long')).toBe('October 31, 2026');
    expect(formatDate('2026-10-31', 'en-US', 'full')).toBe('Saturday, October 31, 2026');
    expect(formatDate('2026-10-31', 'en-US', 'monthDay')).toBe('Oct 31');
    expect(formatDate('2026-10-31', 'en-US', 'monthYear')).toBe('October 2026');
  });

  it('defaults to the medium style', () => {
    expect(formatDate('2026-01-05', 'en-US')).toBe('Jan 5, 2026');
  });

  it('formats in pt-BR', () => {
    expect(formatDate('2026-10-31', 'pt-BR', 'long')).toBe('31 de outubro de 2026');
    expect(formatDate('2026-10-31', 'pt-BR', 'short')).toBe('31/10/2026');
  });

  it('does not shift the day with the viewer time zone', () => {
    // Midnight UTC would be the previous day in the Americas if formatted in local time.
    expect(formatDate('2026-01-01', 'en-US', 'medium')).toBe('Jan 1, 2026');
    expect(formatDate('2026-12-31', 'en-US', 'medium')).toBe('Dec 31, 2026');
  });

  it('handles leap days and early years', () => {
    expect(formatDate('2024-02-29', 'en-US', 'medium')).toBe('Feb 29, 2024');
  });

  it('rejects invalid input in development', () => {
    expect(() => formatDate('2026-02-30', 'en-US')).toThrow(/YYYY-MM-DD/);
    expect(() => formatDate('10/31/2026', 'en-US')).toThrow(RangeError);
    expect(() => formatDate('', 'en-US')).toThrow(RangeError);
  });
});

describe('toISODate', () => {
  it('uses the local calendar day', () => {
    expect(toISODate(new Date(2026, 9, 31, 23, 59, 59))).toBe('2026-10-31');
    expect(toISODate(new Date(2026, 0, 1, 0, 0, 0))).toBe('2026-01-01');
  });

  it('can use the UTC day', () => {
    expect(toISODate(new Date(Date.UTC(2026, 9, 31, 23, 59)), { utc: true })).toBe('2026-10-31');
    expect(toISODate(new Date(Date.UTC(2026, 0, 1, 0, 0)), { utc: true })).toBe('2026-01-01');
  });

  it('pads month, day and year', () => {
    expect(toISODate(new Date(Date.UTC(2026, 2, 5)), { utc: true })).toBe('2026-03-05');
    const early = new Date(0);
    early.setUTCFullYear(99, 0, 1);
    expect(toISODate(early, { utc: true })).toBe('0099-01-01');
  });

  it('round-trips with isISODate', () => {
    expect(isISODate(toISODate(new Date(2024, 1, 29)))).toBe(true);
  });

  it('rejects invalid dates and out-of-range years in development', () => {
    expect(() => toISODate(new Date(Number.NaN))).toThrow(RangeError);
    expect(() => toISODate(new Date(Date.UTC(10000, 0, 1)), { utc: true })).toThrow(RangeError);
  });
});

describe('daysBetween', () => {
  it('counts days, positive when the second date is later', () => {
    expect(daysBetween('2026-10-31', '2026-11-01')).toBe(1);
    expect(daysBetween('2026-11-01', '2026-10-31')).toBe(-1);
    expect(daysBetween('2026-10-31', '2026-10-31')).toBe(0);
    expect(daysBetween('2026-01-01', '2026-12-31')).toBe(364);
  });

  it('is exact across leap years and year boundaries', () => {
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
    expect(daysBetween('2025-02-28', '2025-03-01')).toBe(1);
    expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
    expect(daysBetween('2000-01-01', '2100-01-01')).toBe(36525);
  });

  it('is DST-safe (no 23- or 25-hour days)', () => {
    // US spring forward 2026-03-08, fall back 2026-11-01; EU 2026-03-29 and 2026-10-25.
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2);
    expect(daysBetween('2026-10-31', '2026-11-02')).toBe(2);
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    expect(daysBetween('2026-03-01', '2026-04-01')).toBe(31);
  });

  it('rejects invalid dates in development', () => {
    expect(() => daysBetween('2026-02-30', '2026-03-01')).toThrow(RangeError);
    expect(() => daysBetween('2026-03-01', 'tomorrow')).toThrow(RangeError);
  });
});

describe('dueStatus', () => {
  const today = '2026-10-31';

  it('is danger when overdue', () => {
    expect(dueStatus('2026-10-30', today)).toEqual({ days: -1, tone: 'danger' });
    expect(dueStatus('2025-10-31', today)).toEqual({ days: -365, tone: 'danger' });
  });

  it('is warning from today up to and including 7 days', () => {
    expect(dueStatus('2026-10-31', today)).toEqual({ days: 0, tone: 'warning' });
    expect(dueStatus('2026-11-01', today)).toEqual({ days: 1, tone: 'warning' });
    expect(dueStatus('2026-11-07', today)).toEqual({ days: 7, tone: 'warning' });
  });

  it('is neutral after 7 days', () => {
    expect(dueStatus('2026-11-08', today)).toEqual({ days: 8, tone: 'neutral' });
    expect(dueStatus('2027-10-31', today)).toEqual({ days: 365, tone: 'neutral' });
  });

  it('uses calendar days across DST changes', () => {
    expect(dueStatus('2026-11-08', '2026-11-01')).toEqual({ days: 7, tone: 'warning' });
  });
});

describe('formatRelativeDays', () => {
  it('uses words for -1, 0 and 1 (numeric auto)', () => {
    expect(formatRelativeDays(-1, 'en-US')).toBe('yesterday');
    expect(formatRelativeDays(0, 'en-US')).toBe('today');
    expect(formatRelativeDays(1, 'en-US')).toBe('tomorrow');
  });

  it('uses counts otherwise', () => {
    expect(formatRelativeDays(3, 'en-US')).toBe('in 3 days');
    expect(formatRelativeDays(-3, 'en-US')).toBe('3 days ago');
    expect(formatRelativeDays(1000, 'en-US')).toBe('in 1,000 days');
  });

  it('localizes', () => {
    expect(formatRelativeDays(-1, 'pt-BR')).toBe('ontem');
    expect(formatRelativeDays(0, 'pt-BR')).toBe('hoje');
    expect(formatRelativeDays(1, 'pt-BR')).toBe('amanhã');
    expect(formatRelativeDays(5, 'pt-BR')).toBe('em 5 dias');
    expect(formatRelativeDays(2, 'pt-BR')).toBe('depois de amanhã');
  });

  it('treats negative zero as today', () => {
    expect(formatRelativeDays(-0, 'en-US')).toBe('today');
  });

  it('rejects fractional days in development', () => {
    expect(() => formatRelativeDays(1.5, 'en-US')).toThrow(RangeError);
  });
});
