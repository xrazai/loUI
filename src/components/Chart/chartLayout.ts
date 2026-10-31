import { niceScale } from './niceScale';
import type { NiceScale } from './niceScale';

/*
 * SVG geometry in user units (one unit is one CSS pixel at 100% zoom). These numbers place
 * marks inside the measured box; they are layout, not styling. Colors, strokes, radii and
 * fonts all come from tokens in the CSS Module.
 */

/** Space above the plot for the highlight labels, and on the end side. */
const PLOT_PADDING_TOP = 28;
const PLOT_PADDING_END = 8;
/** Space under the plot for the category labels. */
const PLOT_PADDING_BOTTOM = 24;
/** Estimated advance of one caption-size mono character, and the gap next to the axis. */
const CHAR_WIDTH = 7;
const AXIS_GAP = 12;
const AXIS_MIN_WIDTH = 28;
/** Bars take this share of their band, up to a maximum width. */
const BAR_BAND_RATIO = 0.6;
const BAR_MAX_WIDTH = 28;
/** Minimum vertical room per value-axis tick; short charts get fewer ticks so labels never touch. */
const TICK_MIN_SPACING = 24;
const MAX_TICKS = 5;
/** Minimum horizontal room per category label before labels are skipped. */
const LABEL_MIN_SPACING = 44;
/** Tooltip estimate: padding on both sides, and distance above the anchor. */
const TOOLTIP_PADDING = 16;
const TOOLTIP_OFFSET_Y = 52;

export interface ChartLayoutInput {
  /** Data values, in order. */
  values: readonly number[];
  /** Measured width and height of the plot box. */
  width: number;
  height: number;
  /** Formats an axis tick; used to reserve room for the widest label. */
  formatTick: (value: number) => string;
}

export interface ChartLayout {
  scale: NiceScale;
  /** Plot rectangle. */
  left: number;
  right: number;
  top: number;
  bottom: number;
  /** Width of the band reserved for one category. */
  band: number;
  /** Width of a bar. */
  barWidth: number;
  /** Show the label of every `labelStep`-th category so labels never collide. */
  labelStep: number;
  /** Y of the zero baseline. */
  baseline: number;
  /** Center X of category `index`. */
  x: (index: number) => number;
  /** Y of `value`. */
  y: (value: number) => number;
  /** Category under the horizontal position `px`, clamped to the data. */
  indexAt: (px: number) => number;
}

/** Pure geometry of the chart: scale, plot rectangle and coordinate functions. */
export function computeLayout({
  values,
  width,
  height,
  formatTick,
}: ChartLayoutInput): ChartLayout {
  const count = values.length;
  const plotHeight = Math.max(1, height - PLOT_PADDING_BOTTOM - PLOT_PADDING_TOP);
  const tickCount = Math.min(MAX_TICKS, Math.max(2, Math.floor(plotHeight / TICK_MIN_SPACING) + 1));
  const scale = niceScale(
    count ? Math.min(...values) : 0,
    count ? Math.max(...values) : 0,
    tickCount,
  );
  const widest = Math.max(1, ...scale.ticks.map((tick) => formatTick(tick).length));
  const left = Math.max(AXIS_MIN_WIDTH, widest * CHAR_WIDTH + AXIS_GAP);
  const right = Math.max(left + 1, width - PLOT_PADDING_END);
  const top = PLOT_PADDING_TOP;
  const bottom = Math.max(top + 1, height - PLOT_PADDING_BOTTOM);
  const band = (right - left) / Math.max(1, count);
  const span = scale.max - scale.min;
  const y = (value: number) => bottom - ((value - scale.min) / span) * (bottom - top);
  return {
    scale,
    left,
    right,
    top,
    bottom,
    band,
    barWidth: Math.min(BAR_MAX_WIDTH, band * BAR_BAND_RATIO),
    labelStep: Math.max(
      1,
      Math.ceil(count / Math.max(1, Math.floor((right - left) / LABEL_MIN_SPACING))),
    ),
    baseline: y(0),
    x: (index) => left + band * index + band / 2,
    y,
    indexAt: (px) => Math.min(Math.max(0, Math.floor((px - left) / band)), Math.max(0, count - 1)),
  };
}

/**
 * Where to put the value label of the active point: centered above the anchor, kept inside
 * the box. `characters` is the length of its text.
 */
export function tooltipPosition(
  characters: number,
  anchorX: number,
  anchorY: number,
  boxWidth: number,
): { left: number; top: number } {
  const estimated = characters * CHAR_WIDTH + TOOLTIP_PADDING;
  const left = Math.min(Math.max(0, anchorX - estimated / 2), Math.max(0, boxWidth - estimated));
  return { left, top: Math.max(0, anchorY - TOOLTIP_OFFSET_Y) };
}
