import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  daysBetween,
  dueStatus,
  formatRelativeDays,
  isISODate,
  toCalendarDay,
  toISODate,
} from './date';

const dateArb = fc.date({
  min: new Date('1900-01-01T00:00:00Z'),
  max: new Date('2200-12-31T00:00:00Z'),
  noInvalidDate: true,
});
const isoArb = dateArb.map((d) => toISODate(d, { utc: true }));
const TONE_RANK = { danger: 0, warning: 1, neutral: 2 } as const;

function addDays(iso: string, offset: number): string {
  const moved = new Date(`${iso}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + offset);
  return toISODate(moved, { utc: true });
}

describe('date (properties)', () => {
  it('toCalendarDay keeps plain ISO dates and maps a Date or its ISO string to the local day', () => {
    fc.assert(
      fc.property(isoArb, dateArb, (iso, date) => {
        expect(toCalendarDay(iso)).toBe(iso);
        expect(toCalendarDay(date)).toBe(toISODate(date));
        expect(toCalendarDay(date.toISOString())).toBe(toISODate(date));
      }),
    );
  });

  it('toISODate produces real ISO dates', () => {
    fc.assert(fc.property(isoArb, (iso) => isISODate(iso)));
  });

  it('daysBetween is an antisymmetric integer with a zero identity', () => {
    fc.assert(
      fc.property(isoArb, isoArb, (a, b) => {
        expect(Number.isInteger(daysBetween(a, b))).toBe(true);
        expect(daysBetween(a, b) + daysBetween(b, a)).toBe(0);
        expect(daysBetween(a, a)).toBe(0);
      }),
    );
  });

  it('daysBetween is additive (a to c equals a to b plus b to c)', () => {
    fc.assert(
      fc.property(isoArb, isoArb, isoArb, (a, b, c) => {
        expect(daysBetween(a, c)).toBe(daysBetween(a, b) + daysBetween(b, c));
      }),
    );
  });

  it('daysBetween matches adding whole calendar days (no DST drift)', () => {
    fc.assert(
      fc.property(isoArb, fc.integer({ min: -40_000, max: 40_000 }), (iso, offset) => {
        const movedIso = addDays(iso, offset);
        if (movedIso === '' || movedIso < '1000-01-01') return;
        expect(daysBetween(iso, movedIso)).toBe(offset);
      }),
    );
  });

  it('dueStatus reports the days until the due date and the documented tone', () => {
    fc.assert(
      fc.property(isoArb, isoArb, (due, today) => {
        const status = dueStatus(due, today);
        expect(status.days).toBe(daysBetween(today, due));
        const expected = status.days < 0 ? 'danger' : status.days <= 7 ? 'warning' : 'neutral';
        expect(status.tone).toBe(expected);
      }),
    );
  });

  it('dueStatus is monotonic: a later due date is never more urgent', () => {
    fc.assert(
      fc.property(
        isoArb,
        fc.integer({ min: -400, max: 400 }),
        fc.nat(400),
        (today, offset, extra) => {
          const sooner = dueStatus(addDays(today, offset), today);
          const later = dueStatus(addDays(today, offset + extra), today);
          expect(later.days).toBeGreaterThanOrEqual(sooner.days);
          expect(TONE_RANK[later.tone]).toBeGreaterThanOrEqual(TONE_RANK[sooner.tone]);
        },
      ),
    );
  });

  it('formatRelativeDays never throws for integers and is never empty', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100_000, max: 100_000 }),
        fc.constantFrom('en-US', 'pt-BR'),
        (days, locale) => {
          expect(formatRelativeDays(days, locale).length).toBeGreaterThan(0);
        },
      ),
    );
  });
});
