import { describe, expect, it } from 'vitest';
import {
  chartObstacles,
  computeLayout,
  layoutWithReferences,
  noteMarkerPath,
  placeReferenceLabels,
  tooltipPosition,
} from './chartLayout';
import type { ChartRect } from './chartLayout';

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

describe('computeLayout reference lines and tickEvery', () => {
  const base = { width: 400, height: 200, formatTick: format };

  it('extends the y-domain when a reference line lies above or below the data', () => {
    const plain = computeLayout({ ...base, values: [10, 40] });
    const above = computeLayout({ ...base, values: [10, 40], references: [500] });
    const below = computeLayout({ ...base, values: [10, 40], references: [-200] });
    expect(above.scale.max).toBeGreaterThanOrEqual(500);
    expect(below.scale.min).toBeLessThanOrEqual(-200);
    expect(above.y(500)).toBeGreaterThanOrEqual(above.top - 0.001);
    expect(below.y(-200)).toBeLessThanOrEqual(below.bottom + 0.001);
    expect(plain.scale.max).toBeLessThan(500);
  });

  it('keeps the domain when the line lies inside the data range, and ignores non-finite values', () => {
    const plain = computeLayout({ ...base, values: [10, 40] });
    const inside = computeLayout({ ...base, values: [10, 40], references: [25, Number.NaN] });
    expect(inside.scale).toEqual(plain.scale);
  });

  it('can draw reference lines with no data', () => {
    const layout = computeLayout({ ...base, values: [], references: [80] });
    expect(layout.scale.max).toBeGreaterThanOrEqual(80);
  });

  it('uses tickEvery as the label step, floors it and falls back to automatic when invalid', () => {
    const values = Array.from({ length: 30 }, (_, i) => i);
    const auto = computeLayout({ ...base, values }).labelStep;
    expect(auto).toBeGreaterThan(1);
    expect(computeLayout({ ...base, values, tickEvery: 7 }).labelStep).toBe(7);
    expect(computeLayout({ ...base, values, tickEvery: 2.9 }).labelStep).toBe(2);
    expect(computeLayout({ ...base, values, tickEvery: 1 }).labelStep).toBe(1);
    for (const invalid of [0, -3, 0.5, Number.NaN, Infinity]) {
      expect(computeLayout({ ...base, values, tickEvery: invalid }).labelStep).toBe(auto);
    }
  });
});

describe('placeReferenceLabels', () => {
  const box = { width: 400, height: 200, formatTick: format };

  it('writes each text at the end of its line, just above it, when nothing is in the way', () => {
    const layout = computeLayout({ ...box, values: [0, 0], references: [100, 40] });
    const [first, second] = placeReferenceLabels(layout, { type: 'bar', values: [0, 0] }, [
      { value: 100, characters: 8 },
      { value: 40, characters: 8 },
    ]);
    expect(first).toMatchObject({ side: 'end', anchor: 'end', x: layout.right, overlap: 0 });
    expect(first?.y).toBe(layout.y(100) - 4);
    expect(second?.y).toBe(layout.y(40) - 4);
  });

  it('moves away from a tall highlighted last bar to the start of the line', () => {
    const values = [10, 10, 10, 10, 10, 10, 10, 100];
    const layout = computeLayout({ ...box, values, references: [30] });
    const marks = {
      type: 'bar' as const,
      values,
      highlights: [{ index: 7, characters: 5, hasNote: false }],
    };
    const [label] = placeReferenceLabels(layout, marks, [{ value: 30, characters: 10 }]);
    expect(label).toMatchObject({ side: 'start', anchor: 'start', overlap: 0 });
    for (const obstacle of chartObstacles(layout, marks).boxes) {
      expect(overlaps(label?.box as ChartRect, obstacle)).toBe(false);
    }
  });

  it('keeps a pinned side and only flips above or below the line', () => {
    const values = [10, 10, 10, 10, 10, 10, 10, 100];
    const layout = computeLayout({ ...box, values, references: [30] });
    const [label] = placeReferenceLabels(layout, { type: 'bar', values }, [
      { value: 30, characters: 10, position: 'end' },
    ]);
    expect(label?.side).toBe('end');
  });

  it('keeps the texts of two close lines apart', () => {
    const layout = computeLayout({ ...box, values: [0, 0], references: [100, 98] });
    const [first, second] = placeReferenceLabels(layout, { type: 'bar', values: [0, 0] }, [
      { value: 100, characters: 8 },
      { value: 98, characters: 8 },
    ]);
    expect(overlaps(first?.box as ChartRect, second?.box as ChartRect)).toBe(false);
  });

  it('avoids the line of a line chart', () => {
    const values = [0, 20, 40, 60, 80, 100];
    const layout = computeLayout({ ...box, values, references: [90] });
    const [label] = placeReferenceLabels(layout, { type: 'line', values }, [
      { value: 90, characters: 10 },
    ]);
    // The line climbs through the end of the reference line: the text goes to the start.
    expect(label).toMatchObject({ side: 'start', overlap: 0 });
  });
});

describe('layoutWithReferences', () => {
  /** Ninety days with every other bar above the average: no clear place inside the plot. */
  const values = Array.from({ length: 90 }, (_, index) => (index % 2 ? 90 : 30));
  const input = { values, width: 1366, height: 200, formatTick: format };
  const marks = {
    type: 'bar' as const,
    highlights: [{ index: 89, characters: 5, hasNote: false }],
  };

  it('prints the text outside the plot, level with its line, when every place inside is taken', () => {
    const plain = computeLayout({ ...input, references: [60] });
    const { layout, labels } = layoutWithReferences(input, marks, [{ value: 60, characters: 12 }]);
    const [label] = labels;
    expect(label?.side).toBe('outside');
    expect(layout.right).toBeLessThan(plain.right);
    expect(label?.x).toBeGreaterThan(layout.right);
    expect(label?.box.right).toBeLessThanOrEqual(input.width);
    expect(Math.abs((label?.y ?? 0) - 4 - layout.y(60))).toBeLessThan(1);
    for (const obstacle of chartObstacles(layout, { ...marks, values }).boxes) {
      expect(overlaps(label?.box as ChartRect, obstacle)).toBe(false);
    }
  });

  it('keeps the plot as wide as before when a place inside is clear', () => {
    const plain = computeLayout({ ...input, references: [95] });
    const { layout, labels } = layoutWithReferences(input, { type: 'bar' }, [
      { value: 95, characters: 12 },
    ]);
    expect(layout.right).toBe(plain.right);
    expect(labels[0]?.side).toBe('end');
  });

  it('never moves a pinned text outside', () => {
    const { labels } = layoutWithReferences(input, marks, [
      { value: 60, characters: 12, position: 'end' },
    ]);
    expect(labels[0]?.side).toBe('end');
  });

  it('spreads the texts of nearby lines outside the plot', () => {
    const { labels } = layoutWithReferences(input, marks, [
      { value: 60, characters: 12 },
      { value: 58, characters: 12 },
    ]);
    const [first, second] = labels;
    expect(first?.side).toBe('outside');
    expect(second?.side).toBe('outside');
    expect(overlaps(first?.box as ChartRect, second?.box as ChartRect)).toBe(false);
  });

  it('uses a row above the plot when the end margin would be too wide', () => {
    const narrow = { ...input, width: 470 };
    const plain = computeLayout({ ...narrow, references: [60] });
    const { layout, labels } = layoutWithReferences(narrow, marks, [{ value: 60, characters: 32 }]);
    const [label] = labels;
    expect(label?.side).toBe('top');
    expect(layout.right).toBe(plain.right);
    expect(layout.top).toBeGreaterThan(plain.top);
    expect(label?.box.bottom).toBeLessThanOrEqual(layout.top - 20);
    expect(label?.swatch?.x2).toBeLessThan(label?.box.right ?? 0);
    for (const obstacle of chartObstacles(layout, { ...marks, values }).boxes) {
      expect(overlaps(label?.box as ChartRect, obstacle)).toBe(false);
    }
  });

  it('puts several texts side by side in the row, then on more rows', () => {
    const { labels } = layoutWithReferences({ ...input, width: 300 }, marks, [
      { value: 60, characters: 20 },
      { value: 58, characters: 20 },
    ]);
    const [first, second] = labels;
    expect(first?.side).toBe('top');
    // Two 20-character texts do not fit one 300 px row: the second goes on a row below.
    expect(second?.y).toBeGreaterThan(first?.y ?? 0);
    expect(second?.side).toBe('top');
    expect(overlaps(first?.box as ChartRect, second?.box as ChartRect)).toBe(false);
  });
});

function overlaps(a: ChartRect, b: ChartRect): boolean {
  return (
    Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
    Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)
  );
}

describe('noteMarkerPath', () => {
  it('draws a closed diamond around the point', () => {
    const path = noteMarkerPath(50, 20);
    expect(path.startsWith('M50.0 16.0')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
  });
});

describe('tooltipPosition with a note', () => {
  it('lifts the label by the lines the note needs, and keeps the one-line position unchanged', () => {
    const plain = tooltipPosition(10, 100, 120, 400);
    expect(plain.top).toBe(68);
    const short = tooltipPosition(10, 100, 120, 400, 20);
    const long = tooltipPosition(10, 100, 120, 400, 200);
    expect(short.top).toBeLessThan(plain.top);
    expect(long.top).toBeLessThan(short.top);
  });

  it('never leaves the box', () => {
    const { left, top } = tooltipPosition(10, 395, 10, 400, 300);
    expect(top).toBe(0);
    expect(left).toBeLessThanOrEqual(400);
    expect(left).toBeGreaterThanOrEqual(0);
  });
});
