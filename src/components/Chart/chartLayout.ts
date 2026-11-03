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
/** Gap between the bottom edge of the label and the anchor, and the height of one text line plus padding. */
const TOOLTIP_GAP = 26;
const TOOLTIP_LINE = 18;
const TOOLTIP_BLOCK_PADDING = 8;
/** Widest label, mirrors `--ds-chart-tooltip-max-w`; longer notes wrap onto more lines. */
const TOOLTIP_MAX_WIDTH = 240;
/** Half-size of the diamond that marks a point with a note, and its distance above the point. */
const NOTE_MARKER_SIZE = 4;
export const NOTE_MARKER_OFFSET = 8;
/** Distance between a reference line and its text, and the minimum room between two such texts. */
export const REFERENCE_LABEL_GAP = 4;
const REFERENCE_LABEL_SPACING = 14;

export interface ChartLayoutInput {
  /** Data values, in order. */
  values: readonly number[];
  /** Measured width and height of the plot box. */
  width: number;
  height: number;
  /** Formats an axis tick; used to reserve room for the widest label. */
  formatTick: (value: number) => string;
  /** Reference line values: the value axis grows to include them when they lie outside the data. */
  references?: readonly number[];
  /** Show every nth category label. Without it (or when invalid) labels are skipped automatically. */
  tickEvery?: number;
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
  references = [],
  tickEvery,
}: ChartLayoutInput): ChartLayout {
  const count = values.length;
  const plotHeight = Math.max(1, height - PLOT_PADDING_BOTTOM - PLOT_PADDING_TOP);
  const tickCount = Math.min(MAX_TICKS, Math.max(2, Math.floor(plotHeight / TICK_MIN_SPACING) + 1));
  const domain = [...values, ...references].filter(Number.isFinite);
  const scale = niceScale(
    domain.length ? Math.min(...domain) : 0,
    domain.length ? Math.max(...domain) : 0,
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
    labelStep:
      tickEvery !== undefined && Number.isFinite(tickEvery) && tickEvery >= 1
        ? Math.floor(tickEvery)
        : Math.max(
            1,
            Math.ceil(count / Math.max(1, Math.floor((right - left) / LABEL_MIN_SPACING))),
          ),
    baseline: y(0),
    x: (index) => left + band * index + band / 2,
    y,
    indexAt: (px) => Math.min(Math.max(0, Math.floor((px - left) / band)), Math.max(0, count - 1)),
  };
}

/** Path of the small diamond that marks a point with a note, centered on (`x`, `y`). */
export function noteMarkerPath(x: number, y: number): string {
  const r = NOTE_MARKER_SIZE;
  return `M${x.toFixed(1)} ${(y - r).toFixed(1)} L${(x + r).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + r).toFixed(1)} L${(x - r).toFixed(1)} ${y.toFixed(1)} Z`;
}

/**
 * Where each reference line writes its text: just above the line, or just below it when a
 * previous text is closer than a line of text, so labels of nearby lines do not overprint.
 * Returns the baseline Y of the text for each entry of `ys` (in order).
 */
export function referenceLabelYs(ys: readonly number[]): number[] {
  const placed: number[] = [];
  return ys.map((y) => {
    const above = y - REFERENCE_LABEL_GAP;
    const crowded = placed.some((other) => Math.abs(other - above) < REFERENCE_LABEL_SPACING);
    const text = crowded ? y + REFERENCE_LABEL_SPACING : above;
    placed.push(text);
    return text;
  });
}

/**
 * Where to put the value label of the active point: centered above the anchor, kept inside
 * the box. `characters` is the length of its first line; `noteCharacters` the length of the
 * note, which wraps below it, pushing the label up so its bottom edge stays above the anchor.
 */
export function tooltipPosition(
  characters: number,
  anchorX: number,
  anchorY: number,
  boxWidth: number,
  noteCharacters = 0,
): { left: number; top: number } {
  const perLine = Math.max(1, Math.floor((TOOLTIP_MAX_WIDTH - TOOLTIP_PADDING) / CHAR_WIDTH));
  const widest = Math.max(characters, Math.min(noteCharacters, perLine));
  const estimated = Math.min(widest * CHAR_WIDTH + TOOLTIP_PADDING, TOOLTIP_MAX_WIDTH);
  const lines = 1 + (noteCharacters ? Math.ceil(noteCharacters / perLine) : 0);
  const height = lines * TOOLTIP_LINE + TOOLTIP_BLOCK_PADDING;
  const left = Math.min(Math.max(0, anchorX - estimated / 2), Math.max(0, boxWidth - estimated));
  return { left, top: Math.max(0, anchorY - TOOLTIP_GAP - height) };
}
