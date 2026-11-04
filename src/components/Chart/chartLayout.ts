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
/** Caption text box around its baseline (ascent and descent), and the clear space kept around it. */
const TEXT_ASCENT = 12;
const TEXT_DESCENT = 4;
const LABEL_CLEARANCE = 2;
/** Distance of a highlight text above its point. */
const HIGHLIGHT_LABEL_OFFSET = 10;
/** Half-size of the box kept clear around a drawn point of a line chart. */
const POINT_CLEARANCE = 5;
/** Gap between the plot and a reference text printed outside it, and the widest share of the box it may take. */
const OUTSIDE_LABEL_GAP = 6;
const OUTSIDE_MAX_SHARE = 0.4;
/** Row above the plot for reference texts that fit nowhere else: height, gap to the plot, line sample. */
const TOP_ROW_HEIGHT = 20;
const TOP_ROW_GAP = 4;
const TOP_ROW_SWATCH = 20;
const TOP_ROW_SWATCH_GAP = 6;
const TOP_ROW_ITEM_GAP = 16;

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
  /** Extra room on the end side of the plot, for reference texts printed outside it. Default 0. */
  endMargin?: number;
  /** Extra room above the plot, for reference texts printed in a row there. Default 0. */
  topMargin?: number;
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
  endMargin = 0,
  topMargin = 0,
}: ChartLayoutInput): ChartLayout {
  const paddingTop = PLOT_PADDING_TOP + Math.max(0, topMargin);
  const count = values.length;
  const plotHeight = Math.max(1, height - PLOT_PADDING_BOTTOM - paddingTop);
  const tickCount = Math.min(MAX_TICKS, Math.max(2, Math.floor(plotHeight / TICK_MIN_SPACING) + 1));
  const domain = [...values, ...references].filter(Number.isFinite);
  const scale = niceScale(
    domain.length ? Math.min(...domain) : 0,
    domain.length ? Math.max(...domain) : 0,
    tickCount,
  );
  const widest = Math.max(1, ...scale.ticks.map((tick) => formatTick(tick).length));
  const left = Math.max(AXIS_MIN_WIDTH, widest * CHAR_WIDTH + AXIS_GAP);
  const right = Math.max(left + 1, width - PLOT_PADDING_END - Math.max(0, endMargin));
  const top = paddingTop;
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

/** Baseline Y of the highlight text of a point whose top is at `pointTop`. */
export function highlightLabelY(pointTop: number, hasNote: boolean): number {
  return pointTop - HIGHLIGHT_LABEL_OFFSET - (hasNote ? NOTE_MARKER_OFFSET : 0);
}

/** An axis-aligned box in SVG user units. */
export interface ChartRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Where the text of a reference line goes: `auto` (default) avoids marks, `end` and `start` pin the side. */
export type ChartReferenceLabelPosition = 'auto' | 'end' | 'start';

/** What is drawn in the plot, so reference texts can stay clear of it. */
export interface ChartMarks {
  type: 'bar' | 'line';
  values: readonly number[];
  /** Highlight texts: index of the point, length of the text, and whether the point also has a note marker. */
  highlights?: readonly { index: number; characters: number; hasNote: boolean }[];
  /** Indexes of points with a note marker. */
  notes?: readonly number[];
}

export interface ChartReferenceLabelInput {
  /** Value of the line. */
  value: number;
  /** Length of the printed text. */
  characters: number;
  position?: ChartReferenceLabelPosition;
}

export interface ChartReferenceLabelPlacement {
  /** Anchor point of the text (`text-anchor` is `anchor`); `y` is the baseline. */
  x: number;
  y: number;
  anchor: 'start' | 'end';
  /**
   * `end` or `start` of the line (above or below it), `outside` the plot on the end side, or
   * `top`: in a row above the plot, after a short sample of the line (`swatch`).
   */
  side: 'end' | 'start' | 'outside' | 'top';
  /** Estimated box of the text, with clearance. */
  box: ChartRect;
  /** Overlap with marks, other texts and the edges; 0 means clear. */
  overlap: number;
  /** Short sample of the line drawn before a text in the row above the plot. */
  swatch?: { x1: number; x2: number; y: number };
}

function textBox(x: number, baseline: number, width: number, anchor: 'start' | 'end'): ChartRect {
  const left = anchor === 'end' ? x - width : x;
  return {
    left: left - LABEL_CLEARANCE,
    right: left + width + LABEL_CLEARANCE,
    top: baseline - TEXT_ASCENT - LABEL_CLEARANCE,
    bottom: baseline + TEXT_DESCENT + LABEL_CLEARANCE,
  };
}

function overlapArea(a: ChartRect, b: ChartRect): number {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

/** How much of the polyline runs through `box` (straight segments, so the clipped ends are exact). */
function polylineOverlap(points: readonly { x: number; y: number }[], box: ChartRect): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1];
    const b = points[index];
    if (!a || !b) continue;
    const x0 = Math.max(Math.min(a.x, b.x), box.left);
    const x1 = Math.min(Math.max(a.x, b.x), box.right);
    if (x1 < x0) continue;
    const at = (x: number) => a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
    const yA = a.x === b.x ? Math.min(a.y, b.y) : at(x0);
    const yB = a.x === b.x ? Math.max(a.y, b.y) : at(x1);
    if (Math.max(yA, yB) < box.top || Math.min(yA, yB) > box.bottom) continue;
    // Weighted like a 2-unit stroke so it compares with areas.
    total += Math.max(1, x1 - x0) * 2;
  }
  return total;
}

/** Boxes (and, for a line chart, the line itself) that reference texts should not cover. */
export function chartObstacles(
  layout: ChartLayout,
  marks: ChartMarks,
): { boxes: ChartRect[]; line: { x: number; y: number }[] } {
  const boxes: ChartRect[] = [];
  const { values } = marks;
  const pointTop = (index: number) => Math.min(layout.y(values[index] ?? 0), layout.baseline);
  if (marks.type === 'bar') {
    values.forEach((value, index) => {
      const y = layout.y(value);
      const top = Math.min(y, layout.baseline);
      boxes.push({
        left: layout.x(index) - layout.barWidth / 2,
        right: layout.x(index) + layout.barWidth / 2,
        top,
        bottom: Math.max(y, layout.baseline, top + 1),
      });
    });
  }
  for (const { index, characters, hasNote } of marks.highlights ?? []) {
    if (index < 0 || index >= values.length) continue;
    const width = characters * CHAR_WIDTH;
    const x = layout.x(index);
    const baseline = highlightLabelY(pointTop(index), hasNote);
    boxes.push({
      left: x - width / 2,
      right: x + width / 2,
      top: baseline - TEXT_ASCENT,
      bottom: baseline + TEXT_DESCENT,
    });
    if (marks.type === 'line') {
      const y = layout.y(values[index] ?? 0);
      boxes.push({
        left: x - POINT_CLEARANCE,
        right: x + POINT_CLEARANCE,
        top: y - POINT_CLEARANCE,
        bottom: y + POINT_CLEARANCE,
      });
    }
  }
  for (const index of marks.notes ?? []) {
    if (index < 0 || index >= values.length) continue;
    const x = layout.x(index);
    const y = pointTop(index) - NOTE_MARKER_OFFSET;
    boxes.push({
      left: x - NOTE_MARKER_SIZE,
      right: x + NOTE_MARKER_SIZE,
      top: y - NOTE_MARKER_SIZE,
      bottom: y + NOTE_MARKER_SIZE,
    });
  }
  const line =
    marks.type === 'line' && values.length > 1
      ? values.map((value, index) => ({ x: layout.x(index), y: layout.y(value) }))
      : [];
  return { boxes, line };
}

/**
 * Places the text of each reference line inside the plot, clear of bars, the line, highlight
 * texts, note markers and the texts of earlier reference lines. Candidates, in order: end of the
 * line above it, start above, end below, start below (`end` and `start` keep their side). The
 * first clear candidate wins; otherwise the one with the least overlap (see `overlap`).
 * Labels with a value that is not finite are skipped (returned with `overlap` 0 at the end).
 */
export function placeReferenceLabels(
  layout: ChartLayout,
  marks: ChartMarks,
  labels: readonly ChartReferenceLabelInput[],
): ChartReferenceLabelPlacement[] {
  const { boxes, line } = chartObstacles(layout, marks);
  const placed: ChartRect[] = [];
  return labels.map(({ value, characters, position = 'auto' }) => {
    const width = characters * CHAR_WIDTH;
    if (!Number.isFinite(value)) {
      return {
        x: layout.right,
        y: layout.top,
        anchor: 'end',
        side: 'end',
        box: textBox(layout.right, layout.top, width, 'end'),
        overlap: 0,
      };
    }
    const lineY = layout.y(value);
    const above = lineY - REFERENCE_LABEL_GAP;
    const below = lineY + REFERENCE_LABEL_SPACING;
    const end = { x: layout.right, anchor: 'end' as const, side: 'end' as const };
    const start = { x: layout.left, anchor: 'start' as const, side: 'start' as const };
    const sides = position === 'end' ? [end] : position === 'start' ? [start] : [end, start];
    const candidates = [
      ...sides.map((side) => ({ ...side, y: above })),
      ...sides.map((side) => ({ ...side, y: below })),
    ];
    let best: ChartReferenceLabelPlacement | null = null;
    for (const candidate of candidates) {
      const box = textBox(candidate.x, candidate.y, width, candidate.anchor);
      let overlap = polylineOverlap(line, box);
      for (const other of boxes) overlap += overlapArea(box, other);
      for (const other of placed) overlap += overlapArea(box, other);
      // Leaving the plot vertically runs into the category labels or the top edge.
      overlap += Math.max(0, box.bottom - layout.bottom) * width;
      overlap += Math.max(0, -box.top) * width;
      if (!best || overlap < best.overlap) best = { ...candidate, box, overlap };
      if (overlap === 0) break;
    }
    // `candidates` always has at least two entries, so `best` is set.
    const chosen = best as ChartReferenceLabelPlacement;
    placed.push(chosen.box);
    return chosen;
  });
}

/**
 * Lays the chart out and places the reference texts. An `auto` text that cannot be placed clear
 * of the marks at either end of its line goes, in order:
 *
 * 1. outside the plot on the end side, level with its line (the plot gives up the width of the
 *    text; texts of nearby lines are moved apart). Skipped when that margin would take more
 *    than 40% of the width or hide category labels that all fit before;
 * 2. otherwise into a row above the plot, end-aligned, after a short sample of its line (the
 *    plot gives up the height of the row). Nothing else is drawn there, so it is always clear.
 */
export function layoutWithReferences(
  input: Omit<ChartLayoutInput, 'references' | 'endMargin' | 'topMargin'>,
  marks: Omit<ChartMarks, 'values'>,
  labels: readonly ChartReferenceLabelInput[],
): { layout: ChartLayout; labels: ChartReferenceLabelPlacement[] } {
  const references = labels.map((label) => label.value);
  const fullMarks = { ...marks, values: input.values };
  const isAuto = (index: number) => (labels[index]?.position ?? 'auto') === 'auto';
  const blockedIn = (placements: readonly ChartReferenceLabelPlacement[]) =>
    placements.flatMap((placement, index) =>
      placement.overlap > 0 && placement.side !== 'top' && isAuto(index) ? [index] : [],
    );
  /** Places the texts not in `moved` inside `layout`; `moved` ones get a placeholder. */
  const placeRest = (layout: ChartLayout, moved: ReadonlySet<number>) =>
    placeReferenceLabels(
      layout,
      fullMarks,
      labels.map((label, index) => (moved.has(index) ? { ...label, value: Number.NaN } : label)),
    );

  const first = computeLayout({ ...input, references });
  const inside = placeReferenceLabels(first, fullMarks, labels);
  const blocked = blockedIn(inside);
  if (blocked.length === 0) return { layout: first, labels: inside };

  // 1. Outside the plot on the end side.
  const widest = Math.max(...blocked.map((index) => labels[index]?.characters ?? 0));
  const margin = widest * CHAR_WIDTH + OUTSIDE_LABEL_GAP;
  if (margin <= input.width * OUTSIDE_MAX_SHARE) {
    const layout = computeLayout({ ...input, references, endMargin: margin });
    if (!(first.labelStep === 1 && layout.labelStep > 1)) {
      const outside = new Set(blocked);
      const placements = placeRest(layout, outside);
      placeOutside(layout, chartObstacles(layout, fullMarks).boxes, labels, outside, placements);
      if (blockedIn(placements).length === 0) return { layout, labels: placements };
    }
  }

  // 2. A row above the plot. Moving texts there changes the plot height, so a text that was
  // clear may become blocked: it joins the row and the layout is computed again.
  const moved = new Set(blocked);
  for (;;) {
    const rows = packTopRows(input.width - PLOT_PADDING_END, labels, moved);
    const layout = computeLayout({
      ...input,
      references,
      topMargin: rows.count * TOP_ROW_HEIGHT + TOP_ROW_GAP,
    });
    const placements = placeRest(layout, moved);
    for (const [index, slot] of rows.slots) {
      const width = (labels[index]?.characters ?? 0) * CHAR_WIDTH;
      const box = textBox(slot.right, slot.baseline, width, 'end');
      const swatchEnd = slot.right - width - TOP_ROW_SWATCH_GAP;
      placements[index] = {
        x: slot.right,
        y: slot.baseline,
        anchor: 'end',
        side: 'top',
        box: { ...box, left: swatchEnd - TOP_ROW_SWATCH - LABEL_CLEARANCE },
        overlap: 0,
        swatch: {
          x1: swatchEnd - TOP_ROW_SWATCH,
          x2: swatchEnd,
          y: slot.baseline - (TEXT_ASCENT - TEXT_DESCENT) / 2,
        },
      };
    }
    const more = blockedIn(placements).filter((index) => !moved.has(index));
    if (more.length === 0) return { layout, labels: placements };
    for (const index of more) moved.add(index);
  }
}

/**
 * Puts the `outside` texts right of the plot, level with their lines, one text line apart, and
 * records any overlap with `obstacles`.
 */
function placeOutside(
  layout: ChartLayout,
  obstacles: readonly ChartRect[],
  labels: readonly ChartReferenceLabelInput[],
  outside: ReadonlySet<number>,
  placements: ChartReferenceLabelPlacement[],
): void {
  const order = [...outside].sort(
    (a, b) => layout.y(labels[a]?.value ?? 0) - layout.y(labels[b]?.value ?? 0),
  );
  let previous = -Infinity;
  for (const index of order) {
    const label = labels[index];
    if (!label) continue;
    const centered = layout.y(label.value) + (TEXT_ASCENT - TEXT_DESCENT) / 2;
    const y = Math.min(
      Math.max(
        centered,
        previous + TEXT_ASCENT + TEXT_DESCENT + 2 * LABEL_CLEARANCE,
        TEXT_ASCENT + LABEL_CLEARANCE,
      ),
      layout.bottom,
    );
    previous = y;
    const x = layout.right + OUTSIDE_LABEL_GAP;
    const box = textBox(x, y, label.characters * CHAR_WIDTH, 'start');
    // A highlight text of the last point can reach past the plot: then this place is taken too.
    const overlap = obstacles.reduce((sum, other) => sum + overlapArea(box, other), 0);
    placements[index] = { x, y, anchor: 'start', side: 'outside', box, overlap };
  }
}

/**
 * Packs the `moved` texts (each after its line sample) into rows above the plot, from the end
 * side towards the start, in the order of `labels`. A text wider than a row gets a row of its
 * own. Returns the number of rows and, per text, the right edge and baseline of its slot.
 */
function packTopRows(
  right: number,
  labels: readonly ChartReferenceLabelInput[],
  moved: ReadonlySet<number>,
): { count: number; slots: Map<number, { right: number; baseline: number }> } {
  const slots = new Map<number, { right: number; baseline: number }>();
  let row = 0;
  let cursor = right;
  labels.forEach((label, index) => {
    if (!moved.has(index)) return;
    const width = label.characters * CHAR_WIDTH + TOP_ROW_SWATCH_GAP + TOP_ROW_SWATCH;
    if (slots.size > 0 && cursor - width < 0) {
      row += 1;
      cursor = right;
    }
    slots.set(index, {
      right: cursor,
      baseline: LABEL_CLEARANCE + TEXT_ASCENT + row * TOP_ROW_HEIGHT,
    });
    cursor -= width + TOP_ROW_ITEM_GAP;
  });
  return { count: slots.size > 0 ? row + 1 : 0, slots };
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
