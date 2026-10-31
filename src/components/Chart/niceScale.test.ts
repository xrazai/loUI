import { describe, expect, it } from 'vitest';
import { niceScale } from './niceScale';

describe('niceScale', () => {
  it('rounds the top of positive data up to a round tick', () => {
    expect(niceScale(0, 42).ticks).toEqual([0, 10, 20, 30, 40, 50]);
    expect(niceScale(0, 100).ticks).toEqual([0, 25, 50, 75, 100]);
    expect(niceScale(10, 87).ticks).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it('always includes zero, even when all values are far from it', () => {
    const scale = niceScale(900, 1000);
    expect(scale.min).toBe(0);
    expect(scale.max).toBeGreaterThanOrEqual(1000);
  });

  it('shows a unit axis when every value is zero', () => {
    expect(niceScale(0, 0)).toEqual({
      min: 0,
      max: 1,
      step: 0.25,
      ticks: [0, 0.25, 0.5, 0.75, 1],
    });
  });

  it('handles tiny values without log10 breakage', () => {
    const scale = niceScale(0, 0.00003);
    expect(scale.max).toBeCloseTo(0.00003, 10);
    expect(scale.step).toBeGreaterThan(0);
    expect(scale.ticks[0]).toBe(0);
    expect(scale.ticks.every((tick) => Number.isFinite(tick))).toBe(true);
    // No float noise such as 0.000010000000000000001.
    expect(scale.ticks.map(String).every((text) => !text.includes('0000000'))).toBe(true);
  });

  it('handles values below 1', () => {
    expect(niceScale(0, 0.8).ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8]);
    expect(niceScale(0, 0.3).ticks).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it('handles negative values', () => {
    expect(niceScale(-3, 8).ticks).toEqual([-5, -2.5, 0, 2.5, 5, 7.5, 10]);
    const onlyNegative = niceScale(-50, -10);
    expect(onlyNegative.max).toBe(0);
    expect(onlyNegative.min).toBeLessThanOrEqual(-50);
  });

  it('handles very large values', () => {
    const scale = niceScale(0, 4.2e12);
    expect(scale.max).toBe(5e12);
    expect(scale.ticks[0]).toBe(0);
  });

  it('accepts the bounds in either order and treats non-finite input as 0', () => {
    expect(niceScale(42, 0).ticks).toEqual(niceScale(0, 42).ticks);
    expect(niceScale(Number.NaN, Number.POSITIVE_INFINITY)).toEqual(niceScale(0, 0));
  });

  it('respects the requested tick count roughly and never exceeds the cap', () => {
    expect(niceScale(0, 100, 3).ticks).toEqual([0, 50, 100]);
    expect(niceScale(0, 1e9, 1e6).ticks.length).toBeLessThanOrEqual(101);
  });

  it('produces evenly spaced ticks from min to max', () => {
    for (const [low, high] of [
      [0, 1],
      [-7.3, 19.2],
      [0, 999],
      [-0.004, 0.002],
    ] as const) {
      const { ticks, step, min, max } = niceScale(low, high);
      expect(ticks[0]).toBe(min);
      expect(ticks.at(-1)).toBe(max);
      expect(min).toBeLessThanOrEqual(low);
      expect(max).toBeGreaterThanOrEqual(high);
      for (let i = 1; i < ticks.length; i += 1) {
        expect((ticks[i] ?? 0) - (ticks[i - 1] ?? 0)).toBeCloseTo(step, 9);
      }
    }
  });
});
