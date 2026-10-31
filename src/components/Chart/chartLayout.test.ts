import { describe, expect, it } from 'vitest';
import { computeLayout, tooltipPosition } from './chartLayout';

const format = (value: number) => String(value);

describe('computeLayout', () => {
  it('uses fewer value ticks in a short chart so the labels never touch', () => {
    const spacing = (height: number) => {
      const layout = computeLayout({ values: [10, 90], width: 400, height, formatTick: format });
      return (layout.bottom - layout.top) / (layout.scale.ticks.length - 1);
    };
    expect(spacing(96)).toBeGreaterThanOrEqual(24);
    expect(spacing(200)).toBeGreaterThanOrEqual(24);
  });

  it('maps values to y inside the plot, with 0 on the baseline', () => {
    const layout = computeLayout({
      values: [0, 50, 100],
      width: 400,
      height: 200,
      formatTick: format,
    });
    expect(layout.y(layout.scale.min)).toBeCloseTo(layout.bottom);
    expect(layout.y(layout.scale.max)).toBeCloseTo(layout.top);
    expect(layout.baseline).toBeCloseTo(layout.bottom);
    expect(layout.y(50)).toBeLessThan(layout.baseline);
  });

  it('places the zero baseline inside the plot when values are negative', () => {
    const layout = computeLayout({
      values: [-20, 40],
      width: 400,
      height: 200,
      formatTick: format,
    });
    expect(layout.baseline).toBeGreaterThan(layout.top);
    expect(layout.baseline).toBeLessThan(layout.bottom);
    expect(layout.y(-20)).toBeGreaterThan(layout.baseline);
  });

  it('centers categories in equal bands and finds the category under a position', () => {
    const layout = computeLayout({
      values: [1, 2, 3, 4],
      width: 400,
      height: 200,
      formatTick: format,
    });
    expect(layout.x(1) - layout.x(0)).toBeCloseTo(layout.band);
    expect(layout.indexAt(layout.x(2))).toBe(2);
    expect(layout.indexAt(-50)).toBe(0);
    expect(layout.indexAt(9999)).toBe(3);
  });

  it('caps the bar width and keeps bars narrower than their band', () => {
    const wide = computeLayout({ values: [1, 2], width: 800, height: 200, formatTick: format });
    const narrow = computeLayout({
      values: Array.from({ length: 40 }, (_, i) => i),
      width: 400,
      height: 200,
      formatTick: format,
    });
    expect(wide.barWidth).toBe(28);
    expect(narrow.barWidth).toBeLessThan(narrow.band);
  });

  it('skips category labels when there is not enough room', () => {
    const few = computeLayout({ values: [1, 2, 3], width: 600, height: 200, formatTick: format });
    const many = computeLayout({
      values: Array.from({ length: 60 }, (_, i) => i),
      width: 400,
      height: 200,
      formatTick: format,
    });
    expect(few.labelStep).toBe(1);
    expect(many.labelStep).toBeGreaterThan(1);
  });

  it('reserves more room for wider tick labels', () => {
    const short = computeLayout({ values: [9], width: 400, height: 200, formatTick: format });
    const long = computeLayout({
      values: [9],
      width: 400,
      height: 200,
      formatTick: (v) => `$ ${String(v * 1000000)}`,
    });
    expect(long.left).toBeGreaterThan(short.left);
  });

  it('copes with empty data and tiny boxes', () => {
    const empty = computeLayout({ values: [], width: 10, height: 10, formatTick: format });
    expect(empty.right).toBeGreaterThan(empty.left);
    expect(empty.bottom).toBeGreaterThan(empty.top);
    expect(Number.isFinite(empty.y(0))).toBe(true);
    expect(empty.indexAt(5)).toBe(0);
  });
});

describe('tooltipPosition', () => {
  it('centers above the anchor and stays inside the box', () => {
    const middle = tooltipPosition(8, 200, 100, 400);
    expect(middle.top).toBe(48);
    const nearStart = tooltipPosition(8, 2, 100, 400);
    expect(nearStart.left).toBe(0);
    const nearEnd = tooltipPosition(8, 399, 100, 400);
    expect(nearEnd.left + 8 * 7 + 16).toBeLessThanOrEqual(400);
    expect(tooltipPosition(8, 100, 10, 400).top).toBe(0);
  });
});
