import { describe, expect, it } from 'vitest';
import { compareValues, sortRows } from './sortRows';

interface Row {
  id: number;
  name?: string | null;
  qty?: number;
}

const identity = (row: Row) => row.name;

describe('sortRows', () => {
  it('sorts strings alphabetically for the locale, ignoring accents and case', () => {
    const rows: Row[] = [
      { id: 1, name: 'zebra' },
      { id: 2, name: 'Émile' },
      { id: 3, name: 'apple' },
      { id: 4, name: 'Eve' },
    ];
    expect(sortRows(rows, identity, 'asc', 'en-US').map((r) => r.name)).toEqual([
      'apple',
      'Émile',
      'Eve',
      'zebra',
    ]);
  });

  it('uses natural number order inside strings', () => {
    const rows: Row[] = [
      { id: 1, name: 'Item 10' },
      { id: 2, name: 'Item 2' },
    ];
    expect(sortRows(rows, identity, 'asc', 'en-US').map((r) => r.id)).toEqual([2, 1]);
  });

  it('follows the locale (sv puts z before ä)', () => {
    const rows: Row[] = [
      { id: 1, name: 'ä' },
      { id: 2, name: 'z' },
    ];
    expect(sortRows(rows, identity, 'asc', 'sv').map((r) => r.name)).toEqual(['z', 'ä']);
  });

  it('sorts numbers numerically, not as text', () => {
    const rows: Row[] = [
      { id: 1, qty: 100 },
      { id: 2, qty: 9 },
      { id: 3, qty: 25 },
    ];
    expect(sortRows(rows, (r) => r.qty, 'asc', 'en-US').map((r) => r.qty)).toEqual([9, 25, 100]);
    expect(sortRows(rows, (r) => r.qty, 'desc', 'en-US').map((r) => r.qty)).toEqual([100, 25, 9]);
  });

  it('keeps equal rows in input order in both directions (stable)', () => {
    const rows: Row[] = [
      { id: 1, name: 'a' },
      { id: 2, name: 'A' },
      { id: 3, name: 'b' },
      { id: 4, name: 'á' },
    ];
    expect(sortRows(rows, identity, 'asc', 'en-US').map((r) => r.id)).toEqual([1, 2, 4, 3]);
    expect(sortRows(rows, identity, 'desc', 'en-US').map((r) => r.id)).toEqual([3, 1, 2, 4]);
  });

  it('places missing values last in both directions', () => {
    const rows: Row[] = [
      { id: 1, name: null },
      { id: 2, name: 'b' },
      { id: 3 },
      { id: 4, name: 'a' },
    ];
    expect(sortRows(rows, identity, 'asc', 'en-US').map((r) => r.id)).toEqual([4, 2, 1, 3]);
    expect(sortRows(rows, identity, 'desc', 'en-US').map((r) => r.id)).toEqual([2, 4, 1, 3]);
  });

  it('treats NaN and invalid dates as missing', () => {
    const rows = [{ v: Number.NaN }, { v: 1 }, { v: new Date('nope') }, { v: 0 }];
    const sorted = sortRows(rows, (r) => r.v, 'asc', 'en-US');
    expect(sorted.map((r) => r.v)).toEqual([0, 1, Number.NaN, expect.any(Date)]);
  });

  it('sorts dates and booleans', () => {
    const dates = [new Date('2026-03-01'), new Date('2025-01-01')];
    expect(sortRows(dates, (d) => d, 'asc', 'en-US')[0]).toEqual(new Date('2025-01-01'));
    expect(sortRows([true, false], (b) => b, 'asc', 'en-US')).toEqual([false, true]);
  });

  it('does not mutate the input', () => {
    const rows: Row[] = [
      { id: 1, name: 'b' },
      { id: 2, name: 'a' },
    ];
    sortRows(rows, identity, 'asc', 'en-US');
    expect(rows.map((r) => r.id)).toEqual([1, 2]);
  });
});

describe('compareValues', () => {
  it('puts numeric values before strings', () => {
    expect(compareValues(5, 'a', 'en-US')).toBeLessThan(0);
    expect(compareValues('a', 5, 'en-US')).toBeGreaterThan(0);
  });
});
