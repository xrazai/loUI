/*
 * SVG geometry in user units (one unit is one CSS pixel at the default size). These numbers
 * place marks inside the box; they are layout, not styling. Colors, strokes and radii come
 * from tokens in the CSS Module.
 */

/** Room around the plot so a stroke and the largest dot never touch the edge of the box. */
const PLOT_PADDING = 4;

/** Default width and height of a Sparkline in user units. */
export const SPARKLINE_DEFAULT_WIDTH = 96;
export const SPARKLINE_DEFAULT_HEIGHT = 24;

/** A drawn point of the series. */
export interface SparklinePoint {
  /** Index in the input data. */
  index: number;
  /** The data value. */
  value: number;
  x: number;
  y: number;
}

export interface SparklineLayoutInput {
  /** Values in display order. `null`, `undefined` and non-finite numbers are gaps. */
  values: readonly (number | null | undefined)[];
  width: number;
  height: number;
  /** Extend the value range to include 0. Default: the range is the data's min to max. */
  includeZero?: boolean;
}

export interface SparklineLayout {
  /** Runs of consecutive finite values. A gap in the data starts a new run. */
  segments: SparklinePoint[][];
  /** Y of the bottom of the plot, where an area is closed. */
  baseline: number;
  /** First lowest point, or `undefined` when there are fewer than two distinct values. */
  min: SparklinePoint | undefined;
  /** First highest point, or `undefined` when there are fewer than two distinct values. */
  max: SparklinePoint | undefined;
  /** Last point with a value, or `undefined` when there is none. */
  last: SparklinePoint | undefined;
}

function isValue(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Pure geometry of a Sparkline: where each value goes in a `width` by `height` box.
 *
 * The vertical range is the data's own minimum to maximum (a trend line, not a bar chart), so
 * `98, 100, 102` is not flattened by a zero baseline; pass `includeZero` to keep zero in
 * range. A series without range (all values equal) is a centered flat line. Non-finite values
 * are gaps, never `NaN` coordinates.
 */
export function computeSparkline({
  values,
  width,
  height,
  includeZero = false,
}: SparklineLayoutInput): SparklineLayout {
  const finite = values.filter(isValue);
  const left = PLOT_PADDING;
  const right = Math.max(left, width - PLOT_PADDING);
  const top = PLOT_PADDING;
  const bottom = Math.max(top, height - PLOT_PADDING);
  const lowest = finite.length ? Math.min(...finite, ...(includeZero ? [0] : [])) : 0;
  const highest = finite.length ? Math.max(...finite, ...(includeZero ? [0] : [])) : 0;
  const span = highest - lowest;
  const count = values.length;
  const x = (index: number) =>
    count <= 1 ? (left + right) / 2 : round(left + ((right - left) * index) / (count - 1));
  const y = (value: number) =>
    span === 0
      ? round((top + bottom) / 2)
      : round(bottom - ((value - lowest) / span) * (bottom - top));

  const segments: SparklinePoint[][] = [];
  let run: SparklinePoint[] | undefined;
  let min: SparklinePoint | undefined;
  let max: SparklinePoint | undefined;
  let last: SparklinePoint | undefined;
  values.forEach((value, index) => {
    if (!isValue(value)) {
      run = undefined;
      return;
    }
    const point: SparklinePoint = { index, value, x: x(index), y: y(value) };
    if (!run) {
      run = [];
      segments.push(run);
    }
    run.push(point);
    last = point;
    if (!min || value < min.value) min = point;
    if (!max || value > max.value) max = point;
  });
  const hasRange = min !== undefined && max !== undefined && min.value !== max.value;
  return {
    segments,
    baseline: bottom,
    min: hasRange ? min : undefined,
    max: hasRange ? max : undefined,
    last,
  };
}

/** SVG path data (`M x y L x y ...`) of one run of points. A single point is a zero-length line. */
export function linePath(points: readonly SparklinePoint[]): string {
  const [first, ...rest] = points;
  if (!first) return '';
  if (rest.length === 0)
    return `M${String(first.x)} ${String(first.y)}L${String(first.x)} ${String(first.y)}`;
  return `M${String(first.x)} ${String(first.y)}${rest.map((p) => `L${String(p.x)} ${String(p.y)}`).join('')}`;
}

/** SVG path data of the area under a run, closed on `baseline`. Empty for fewer than two points. */
export function areaPath(points: readonly SparklinePoint[], baseline: number): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || points.length < 2) return '';
  return `${linePath(points)}L${String(last.x)} ${String(baseline)}L${String(first.x)} ${String(baseline)}Z`;
}
