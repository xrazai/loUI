import { formatNumber } from '../../utils/number';
import { isDev } from '../../utils/env';

/**
 * Shared accessibility helpers for charts (internal, not exported from the package).
 *
 * Every chart in the library repeats the same few decisions: values are formatted with `Intl`
 * for the active locale, a text summary stands in for the picture, the data is also available
 * as a table, and a series never relies on color alone (a neutral ramp of four steps that
 * repeats with a hatch). They live here so the charts stay consistent.
 */

/** Number of solid steps in the neutral series ramp (`--ds-chart-series-1` to `-4`). */
export const SERIES_RAMP_SIZE = 4;
/** How many series can look different without explicit colors: the ramp, then the ramp with a hatch. */
export const MAX_DISTINCT_SERIES = SERIES_RAMP_SIZE * 2;

/** Negative and non-finite values count as 0. */
export function safeValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export interface SeriesEncoding {
  /** Step of the neutral ramp, `0` to `3`. */
  ramp: number;
  /** True from the fifth series on (without explicit color): the ramp repeats with a hatch pattern. */
  hatched: boolean;
}

/**
 * The non-color encoding of the series at `index`: a ramp step, plus a hatch pattern once the
 * ramp repeats. A series with an explicit color is never hatched (its color is the author's call).
 */
export function seriesEncoding(index: number, hasExplicitColor = false): SeriesEncoding {
  return {
    ramp: index % SERIES_RAMP_SIZE,
    hatched: !hasExplicitColor && Math.floor(index / SERIES_RAMP_SIZE) % 2 === 1,
  };
}

/** Warns in development when more series than the ramp and hatch can tell apart have no color. */
export function warnTooManySeries(
  component: string,
  count: number,
  someWithoutColor: boolean,
): void {
  if (isDev() && count > MAX_DISTINCT_SERIES && someWithoutColor) {
    console.warn(
      `[loui-ds] ${component}: ${String(count)} parts without explicit colors cannot all look different (limit ${String(MAX_DISTINCT_SERIES)}). Group the smallest parts into "Other" or pass \`color\`.`,
    );
  }
}

/** Joins texts for the locale ("A, B and C") with `Intl.ListFormat`. */
export function joinList(locale: string, items: readonly string[]): string {
  return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items);
}

export interface ValueFormatters {
  /** Compact text for an axis tick. */
  tick: (value: number) => string;
  /** Full text for the tooltip, the announcement and the data table. */
  value: (value: number) => string;
}

/**
 * The value formatters of a chart. A consumer `format` (for example `formatCurrency`) is used
 * everywhere; without one, numbers use `Intl` for the locale (compact on the axis, up to two
 * decimals elsewhere).
 */
export function createValueFormatters(
  locale: string,
  format?: (value: number) => string,
): ValueFormatters {
  return {
    tick: format ?? ((value) => formatNumber(value, locale, { notation: 'compact' })),
    value: format ?? ((value) => formatNumber(value, locale, { maximumFractionDigits: 2 })),
  };
}
