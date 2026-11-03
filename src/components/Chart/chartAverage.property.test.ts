import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { chartAverage } from './chartAverage';

const finite = fc.double({ min: -1e9, max: 1e9, noNaN: true });

describe('chartAverage (properties)', () => {
  it('stays between the smallest and the largest value', () => {
    fc.assert(
      fc.property(fc.array(finite, { minLength: 1, maxLength: 50 }), (values) => {
        const mean = chartAverage(values);
        const slack = 1e-6 * Math.max(1, ...values.map(Math.abs));
        expect(mean).toBeGreaterThanOrEqual(Math.min(...values) - slack);
        expect(mean).toBeLessThanOrEqual(Math.max(...values) + slack);
      }),
    );
  });

  it('is the value itself for a constant series, and is order independent', () => {
    fc.assert(
      fc.property(finite, fc.integer({ min: 1, max: 20 }), (value, length) => {
        expect(chartAverage(Array.from({ length }, () => value))).toBeCloseTo(value, 3);
      }),
    );
    fc.assert(
      fc.property(fc.array(fc.integer({ min: -1000, max: 1000 }), { maxLength: 30 }), (values) => {
        expect(chartAverage([...values].reverse())).toBeCloseTo(chartAverage(values), 6);
      }),
    );
  });

  it('ignores non-finite values, accepts chart data and never returns NaN', () => {
    fc.assert(
      fc.property(fc.array(fc.double(), { maxLength: 30 }), (values) => {
        expect(Number.isNaN(chartAverage(values))).toBe(false);
        expect(Number.isFinite(chartAverage(values.filter(Number.isFinite)))).toBe(true);
      }),
    );
    expect(chartAverage([])).toBe(0);
    expect(chartAverage([Number.NaN, Infinity])).toBe(0);
    expect(chartAverage([{ value: 10 }, { value: 20 }])).toBe(15);
  });
});
