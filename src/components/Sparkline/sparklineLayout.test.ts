import { describe, expect, it } from 'vitest';
import { areaPath, computeSparkline, linePath } from './sparklineLayout';

const box = { width: 100, height: 28 };

describe('computeSparkline', () => {
  it('spreads the points over the width, first and last on the padded edges', () => {
    const { segments } = computeSparkline({ values: [1, 2, 3], ...box });
    expect(segments).toHaveLength(1);
    expect(segments[0]?.map((point) => point.x)).toEqual([4, 50, 96]);
  });

  it('maps the lowest value to the bottom and the highest to the top of the plot', () => {
    const { segments, baseline } = computeSparkline({ values: [10, 30, 20], ...box });
    const [low, high, mid] = segments[0] ?? [];
    expect(low?.y).toBe(baseline);
    expect(high?.y).toBe(4);
    expect(mid?.y).toBe(14);
  });

  it('uses the range of the data, so a small change on a large number is visible', () => {
    const { segments } = computeSparkline({ values: [1000, 1002], ...box });
    expect(segments[0]?.map((point) => point.y)).toEqual([24, 4]);
  });

  it('keeps zero in range with includeZero', () => {
    const { segments } = computeSparkline({ values: [10, 20], includeZero: true, ...box });
    expect(segments[0]?.map((point) => point.y)).toEqual([14, 4]);
  });

  it('draws a series without range as a centered flat line and has no min or max', () => {
    const layout = computeSparkline({ values: [5, 5, 5], ...box });
    expect(layout.segments[0]?.map((point) => point.y)).toEqual([14, 14, 14]);
    expect(layout.min).toBeUndefined();
    expect(layout.max).toBeUndefined();
    expect(layout.last?.index).toBe(2);
  });

  it('centers a single value', () => {
    const { segments } = computeSparkline({ values: [3], ...box });
    expect(segments[0]).toEqual([{ index: 0, value: 3, x: 50, y: 14 }]);
  });

  it('returns nothing for empty data', () => {
    expect(computeSparkline({ values: [], ...box })).toEqual({
      segments: [],
      baseline: 24,
      min: undefined,
      max: undefined,
      last: undefined,
    });
  });

  it('splits the line at gaps (null, undefined, NaN, Infinity) and never emits NaN', () => {
    const { segments } = computeSparkline({
      values: [1, 2, null, 3, Number.NaN, undefined, Number.POSITIVE_INFINITY, 4],
      ...box,
    });
    expect(segments.map((run) => run.map((point) => point.index))).toEqual([[0, 1], [3], [7]]);
    for (const point of segments.flat()) {
      expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true);
    }
  });

  it('finds the first minimum, the first maximum and the last value', () => {
    const layout = computeSparkline({ values: [3, 1, 9, 1, 9, 5], ...box });
    expect(layout.min?.index).toBe(1);
    expect(layout.max?.index).toBe(2);
    expect(layout.last?.index).toBe(5);
  });

  it('handles negative values and a tiny box', () => {
    const layout = computeSparkline({ values: [-5, -1], width: 4, height: 4 });
    expect(layout.segments[0]?.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(
      true,
    );
  });
});

describe('linePath and areaPath', () => {
  const points = [
    { index: 0, value: 1, x: 4, y: 24 },
    { index: 1, value: 2, x: 50, y: 4 },
  ];

  it('builds the line path', () => {
    expect(linePath(points)).toBe('M4 24L50 4');
  });

  it('turns a single point into a zero-length line (drawn as a dot by round caps)', () => {
    expect(linePath([{ index: 0, value: 1, x: 4, y: 24 }])).toBe('M4 24L4 24');
  });

  it('closes the area on the baseline', () => {
    expect(areaPath(points, 24)).toBe('M4 24L50 4L50 24L4 24Z');
  });

  it('has no area for fewer than two points', () => {
    expect(areaPath(points.slice(0, 1), 24)).toBe('');
    expect(linePath([])).toBe('');
  });
});
