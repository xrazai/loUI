import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ComponentPropsWithRef, CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { normalizeSearch } from '../../utils/text';
import { VisuallyHidden } from '../VisuallyHidden';
import { createValueFormatters, joinList } from './a11y';
import { ChartDataTable } from './ChartDataTable';
import { messages } from './Chart.messages';
import styles from './Chart.module.css';
import {
  NOTE_MARKER_OFFSET,
  highlightLabelY,
  layoutWithReferences,
  noteMarkerPath,
  tooltipPosition,
} from './chartLayout';
import type { ChartReferenceLabelPosition } from './chartLayout';

export type { ChartReferenceLabelPosition } from './chartLayout';

export type ChartType = 'bar' | 'line';
export type ChartTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export type ChartReferenceKind = 'average' | 'target';

export interface ChartReferenceLine {
  /** Where the line sits, in the same unit as the data. The value axis grows to include it. */
  value: number;
  /** Text printed next to the line ("Average", "Monthly goal"). Also read by screen readers. */
  label: string;
  /**
   * `average` is drawn with long dashes, `target` with dash and dot, so the two never depend on
   * color. The kind name ("Average" / "Target") is part of the spoken text.
   */
  kind: ChartReferenceKind;
  /**
   * Where the text is printed. `auto` (default): at the end of the line, above it, unless that
   * covers a bar, the line, a highlight text, a note marker or another reference text; then at
   * the start, then below the line; when every place is taken, outside the plot on the end side
   * (the plot gets narrower), or, when that margin would be too wide, in a row above the plot
   * after a short sample of the line (the plot gets shorter). It never covers marks or texts. `end` and `start` pin the text to that end of the line (above
   * it, or below it when above is taken) and never move it outside.
   */
  labelPosition?: ChartReferenceLabelPosition;
}

export interface ChartDatum {
  /** Category text: shown under the point, in the tooltip and in the data table. Keep it short ("Mon", "Oct 28"). */
  label: string;
  /** The value. May be negative or zero. */
  value: number;
}

interface ChartBaseProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'aria-label' | 'aria-labelledby' | 'onChange'
> {
  /** `bar` (default) or `line`. One series per chart. */
  type?: ChartType;
  /** The data, in display order (usually time). The chart does not sort. */
  data: readonly ChartDatum[];
  /**
   * Formats values on the axis, in the tooltip, in the announcement and in the data table.
   * Receives a number and returns text; use `formatCurrency` or `formatNumber` with the active
   * locale. Default: `formatNumber` (compact on the axis, full in the tooltip).
   */
  format?: (value: number) => string;
  /** Color of the active point and of the line: `accent` (default), `neutral`, `success`, `warning` or `danger`. */
  tone?: ChartTone;
  /**
   * Marks points by index with short text, for example `{ 29: 'Today', 12: 'Best day' }`. The
   * marked point is drawn in the strong ink color, and its text is printed above it and read
   * by screen readers, so the highlight never depends on color. Keep the texts short.
   */
  highlight?: Readonly<Record<number, string>>;
  /**
   * Long text about a point by index, for example `{ 12: 'Free shipping started this day.' }`.
   * Shown under the value in the label of the active point, in the "Note" column of the hidden
   * table and in the announcement of the point. Points with a note get a small diamond marker
   * above them (a shape, not a color). Unlike `highlight`, the text is not printed on the
   * chart, so it may be a full sentence.
   */
  notes?: Readonly<Record<number, string>>;
  /**
   * Dashed lines across the plot, each with its label printed next to the line, where it does
   * not cover bars or other texts (see `labelPosition`). `average` and `target` differ by dash
   * pattern and by name. Use `chartAverage(values)` for the average. The lines are listed in the description and in the last rows of the hidden
   * table. A value outside the data range widens the axis.
   */
  referenceLines?: readonly ChartReferenceLine[];
  /**
   * Show the label of every nth category (`tickEvery={7}` shows 1st, 8th, 15th...). Default:
   * automatic, labels are skipped only when they would collide. Values below 1 or not finite
   * mean automatic. Points still get a keyboard stop and a table row.
   */
  tickEvery?: number;
  /** Height of the chart (a number is px, or any CSS length). Default `--ds-chart-height` (200px). The width is always 100% of the container. */
  height?: number | string;
  /** Longer description of what the chart shows. Read after the name, together with the keyboard instructions. */
  description?: string;
  /** Header of the category column in the hidden data table. Default: the "Category" message. */
  categoryLabel?: string;
  /** Header of the value column in the hidden data table (for example "Sales"). Default: the "Value" message. */
  valueLabel?: string;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

type ChartNaming =
  | {
      /** Accessible name of the chart: what it shows ("Sales, last 30 days"). Required unless `aria-labelledby` is set. */
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      'aria-label'?: string;
      /** Id of the element that names the chart (a visible heading). */
      'aria-labelledby': string;
    };

export type ChartProps = ChartBaseProps & ChartNaming;

interface Size {
  width: number;
  height: number;
}

function toLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${String(value)}px` : value;
}

/**
 * A responsive bar or line chart for one series, drawn in SVG.
 *
 * It is a single focusable image: `Tab` focuses it, the left and right arrow keys (and Home and
 * End) move between data points, and each point is announced politely ("Tue: 58. 2 of 7") and
 * shown in a label above it. Pointer users get the same label on hover. A visually hidden
 * `<table>` with a caption carries the same data for assistive technology.
 *
 * Limits: one series, a value axis that always includes zero, categories spaced evenly, no
 * zoom, no stacked or grouped bars, no legend. The axis is not mirrored in right-to-left
 * languages (time reads left to right in charts).
 */
export function Chart({
  type = 'bar',
  data,
  format,
  tone = 'accent',
  highlight,
  notes,
  referenceLines,
  tickEvery,
  height,
  description,
  categoryLabel,
  valueLabel,
  messages: overrides,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  style,
  ...rest
}: ChartProps) {
  const locale = useDSLocale();
  const t = useMessages('Chart', messages, overrides);
  const descriptionId = useId();
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const element = plotRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height: measured } = entry.contentRect;
      setSize((previous) =>
        previous && previous.width === width && previous.height === measured
          ? previous
          : { width, height: measured },
      );
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  const count = data.length;
  const { tick: formatTick, value: formatValue } = useMemo(
    () => createValueFormatters(locale, format),
    [format, locale],
  );

  const references = useMemo(
    () => (referenceLines ?? []).filter((line) => Number.isFinite(line.value)),
    [referenceLines],
  );
  const placed = useMemo(() => {
    if (!size || size.width <= 0 || size.height <= 0) return null;
    const hasNote = (index: number) => Boolean(notes?.[index]);
    const highlights = Object.entries(highlight ?? {}).flatMap(([key, text]) => {
      const index = Number(key);
      return Number.isInteger(index) && index >= 0 && index < data.length
        ? [{ index, characters: text.length, hasNote: hasNote(index) }]
        : [];
    });
    const noted = data.flatMap((_, index) => (hasNote(index) ? [index] : []));
    return layoutWithReferences(
      {
        values: data.map((datum) => datum.value),
        width: size.width,
        height: size.height,
        formatTick,
        ...(tickEvery === undefined ? {} : { tickEvery }),
      },
      { type, highlights, notes: noted },
      references.map((line) => ({
        value: line.value,
        characters: referenceText(line.label, formatValue(line.value)).length,
        position: line.labelPosition ?? 'auto',
      })),
    );
  }, [data, size, formatTick, formatValue, references, tickEvery, type, highlight, notes]);
  const layout = placed?.layout ?? null;

  const activeIndex = active !== null && active < count ? active : null;
  const activeDatum = activeIndex === null ? undefined : data[activeIndex];
  const noteAt = (index: number): string | undefined => notes?.[index] || undefined;
  /** Highlight text and note of a point, as read by assistive technology. */
  const spokenNote = (index: number): string | undefined => {
    const parts = [highlight?.[index], noteAt(index)].filter(Boolean);
    return parts.length ? parts.join('. ') : undefined;
  };
  const hasNotes =
    (highlight !== undefined && Object.keys(highlight).length > 0) ||
    (notes !== undefined && Object.values(notes).some(Boolean));
  const referenceTexts = references.map((line) => {
    const kind = line.kind === 'average' ? t.average : t.target;
    return {
      ...line,
      text: startsWithWord(line.label, kind)
        ? line.label.trim()
        : t.referenceLine(kind, line.label),
      formatted: formatValue(line.value),
    };
  });

  const announcement =
    activeIndex !== null && activeDatum
      ? t.point(
          activeDatum.label,
          formatValue(activeDatum.value),
          formatNumber(activeIndex + 1, locale),
          formatNumber(count, locale),
          // The message adds its own full stop after the note.
          spokenNote(activeIndex)?.replace(/\.+$/, ''),
        )
      : '';

  // Functional updates: a held arrow key fires several events before React re-renders.
  const move = (next: (current: number | null) => number) => {
    setActive((current) => Math.min(Math.max(0, next(current)), count - 1));
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || count === 0) return;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        move((current) => (current === null ? 0 : current + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        move((current) => (current === null ? count - 1 : current - 1));
        break;
      case 'Home':
        move(() => 0);
        break;
      case 'End':
        move(() => count - 1);
        break;
      case 'Escape':
        setActive(null);
        break;
      default:
        return;
    }
    if (event.key !== 'Escape') event.preventDefault();
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!layout || count === 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    setActive(layout.indexAt(event.clientX - box.left));
  };

  const rootStyle =
    height === undefined
      ? style
      : ({ ...style, '--ds-chart-height': toLength(height) } as CSSProperties);

  // Tooltip: value, category and highlight text, above the active point.
  let tooltip: { text: string; note?: string; left: number; top: number } | null = null;
  if (layout && activeIndex !== null && activeDatum) {
    const text = `${formatValue(activeDatum.value)} · ${activeDatum.label}${
      highlight?.[activeIndex] ? ` · ${highlight[activeIndex] ?? ''}` : ''
    }`;
    const anchorY = Math.min(layout.y(activeDatum.value), layout.baseline);
    const note = noteAt(activeIndex);
    tooltip = {
      text,
      ...(note ? { note } : {}),
      ...tooltipPosition(
        text.length,
        layout.x(activeIndex),
        anchorY,
        size?.width ?? 0,
        note?.length ?? 0,
      ),
    };
  }

  const describedBy = `${descriptionId}-description`;
  const tableCaption = t.tableCaption(ariaLabel);
  const referenceSummary = referenceTexts.length
    ? t.referenceSummary(
        joinList(
          locale,
          referenceTexts.map((line) => `${line.text}: ${line.formatted}`),
        ),
      )
    : '';

  return (
    <div
      {...rest}
      className={classNames(styles.root, className)}
      data-type={type}
      data-tone={tone}
      {...(rootStyle ? { style: rootStyle } : {})}
    >
      {/* A focusable image: arrow keys move between data points. No interactive role fits a chart, and the hidden table holds the data. */}
      {/* eslint-disable-next-line jsx-a11y-x/no-noninteractive-element-interactions -- chart keyboard traversal, see the comment above */}
      <div
        ref={plotRef}
        className={styles.plot}
        role="img"
        // eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex -- the chart must be focusable for arrow key traversal
        tabIndex={0}
        {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
        {...(ariaLabelledBy === undefined ? {} : { 'aria-labelledby': ariaLabelledBy })}
        aria-describedby={describedBy}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          if (document.activeElement !== plotRef.current) setActive(null);
        }}
        onBlur={() => {
          setActive(null);
        }}
      >
        {layout ? (
          <svg
            className={styles.svg}
            width={size?.width}
            height={size?.height}
            aria-hidden="true"
            focusable="false"
          >
            {layout.scale.ticks.map((tick) => (
              <g key={tick}>
                <line
                  className={styles.grid}
                  data-zero={tick === 0 || undefined}
                  x1={layout.left}
                  x2={layout.right}
                  y1={layout.y(tick)}
                  y2={layout.y(tick)}
                />
                <text
                  className={styles.tick}
                  x={layout.left - 8}
                  y={layout.y(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatTick(tick)}
                </text>
              </g>
            ))}
            {type === 'bar'
              ? data.map((datum, index) => {
                  const top = Math.min(layout.y(datum.value), layout.baseline);
                  const barHeight = Math.max(1, Math.abs(layout.y(datum.value) - layout.baseline));
                  return (
                    <rect
                      key={index}
                      className={styles.bar}
                      data-active={index === activeIndex || undefined}
                      data-highlight={highlight?.[index] === undefined ? undefined : ''}
                      x={layout.x(index) - layout.barWidth / 2}
                      y={top}
                      width={layout.barWidth}
                      height={barHeight}
                    />
                  );
                })
              : null}
            {type === 'line' && count > 1 ? (
              <>
                <path
                  className={styles.area}
                  d={`${data
                    .map(
                      (datum, index) =>
                        `${index ? 'L' : 'M'}${layout.x(index).toFixed(1)} ${layout.y(datum.value).toFixed(1)}`,
                    )
                    .join(
                      ' ',
                    )} L${layout.x(count - 1).toFixed(1)} ${layout.baseline.toFixed(1)} L${layout.x(0).toFixed(1)} ${layout.baseline.toFixed(1)} Z`}
                />
                <path
                  className={styles.line}
                  d={data
                    .map(
                      (datum, index) =>
                        `${index ? 'L' : 'M'}${layout.x(index).toFixed(1)} ${layout.y(datum.value).toFixed(1)}`,
                    )
                    .join(' ')}
                />
              </>
            ) : null}
            {type === 'line'
              ? data.map((datum, index) =>
                  count === 1 || index === activeIndex || highlight?.[index] !== undefined ? (
                    <circle
                      key={index}
                      className={styles.point}
                      data-active={index === activeIndex || undefined}
                      data-highlight={highlight?.[index] === undefined ? undefined : ''}
                      cx={layout.x(index)}
                      cy={layout.y(datum.value)}
                    />
                  ) : null,
                )
              : null}
            {references.map((line, index) => (
              <g key={`reference-${String(index)}`}>
                <line
                  className={styles.reference}
                  data-kind={line.kind}
                  x1={layout.left}
                  x2={layout.right}
                  y1={layout.y(line.value)}
                  y2={layout.y(line.value)}
                />
                {placed?.labels[index]?.swatch ? (
                  <line
                    className={styles.reference}
                    data-kind={line.kind}
                    x1={placed.labels[index].swatch.x1}
                    x2={placed.labels[index].swatch.x2}
                    y1={placed.labels[index].swatch.y}
                    y2={placed.labels[index].swatch.y}
                  />
                ) : null}
                <text
                  className={styles.referenceLabel}
                  data-side={placed?.labels[index]?.side}
                  x={placed?.labels[index]?.x ?? layout.right}
                  y={placed?.labels[index]?.y ?? layout.y(line.value)}
                  textAnchor={placed?.labels[index]?.anchor ?? 'end'}
                >
                  {referenceText(line.label, referenceTexts[index]?.formatted ?? '')}
                </text>
              </g>
            ))}
            {activeIndex !== null && type === 'line' ? (
              <line
                className={styles.cursor}
                x1={layout.x(activeIndex)}
                x2={layout.x(activeIndex)}
                y1={layout.top}
                y2={layout.bottom}
              />
            ) : null}
            {data.map((datum, index) =>
              index % layout.labelStep === 0 ? (
                <text
                  key={index}
                  className={styles.category}
                  data-active={index === activeIndex || undefined}
                  x={layout.x(index)}
                  y={layout.bottom + 16}
                  textAnchor="middle"
                >
                  {datum.label}
                </text>
              ) : null,
            )}
            {data.map((datum, index) => {
              const note = highlight?.[index];
              // The active point repeats its note in the value label, so the two never overlap.
              if (note === undefined || index === activeIndex) return null;
              return (
                <text
                  key={`note-${String(index)}`}
                  className={styles.note}
                  x={layout.x(index)}
                  y={highlightLabelY(
                    Math.min(layout.y(datum.value), layout.baseline),
                    Boolean(noteAt(index)),
                  )}
                  textAnchor="middle"
                >
                  {note}
                </text>
              );
            })}
            {data.map((datum, index) =>
              noteAt(index) ? (
                <path
                  key={`marker-${String(index)}`}
                  className={styles.noteMarker}
                  d={noteMarkerPath(
                    layout.x(index),
                    Math.min(layout.y(datum.value), layout.baseline) - NOTE_MARKER_OFFSET,
                  )}
                />
              ) : null,
            )}
          </svg>
        ) : null}
        {layout && count === 0 ? <span className={styles.empty}>{t.empty}</span> : null}
        {tooltip ? (
          <span
            className={styles.tooltip}
            aria-hidden="true"
            {...(tooltip.note ? { 'data-note': '' } : {})}
            style={
              {
                '--ds-chart-tooltip-x': `${String(tooltip.left)}px`,
                '--ds-chart-tooltip-y': `${String(tooltip.top)}px`,
              } as CSSProperties
            }
          >
            {tooltip.note ? <span>{tooltip.text}</span> : tooltip.text}
            {tooltip.note ? <span className={styles.tooltipNote}>{tooltip.note}</span> : null}
          </span>
        ) : null}
      </div>
      <VisuallyHidden id={describedBy}>
        {description ? `${description} ` : ''}
        {referenceSummary ? `${referenceSummary} ` : ''}
        {t.instructions(count, formatNumber(count, locale))}
      </VisuallyHidden>
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
      <ChartDataTable
        caption={tableCaption}
        columns={[
          categoryLabel ?? t.category,
          valueLabel ?? t.value,
          ...(hasNotes ? [t.note] : []),
        ]}
        rows={data.map((datum, index) => ({
          header: datum.label,
          cells: [formatValue(datum.value), ...(hasNotes ? [spokenNote(index) ?? ''] : [])],
        }))}
        footerRows={referenceTexts.map((line) => ({
          header: line.text,
          cells: [line.formatted],
        }))}
      />
    </div>
  );
}

/** The text printed next to a reference line: its label and its formatted value. */
function referenceText(label: string, formatted: string): string {
  return `${label} ${formatted}`;
}

/**
 * True when `label` already starts with the word `kind` ("Average per open day" for the
 * `average` kind), ignoring case and accents, so the spoken name does not repeat it.
 */
function startsWithWord(label: string, kind: string): boolean {
  const text = normalizeSearch(label.trim());
  const prefix = normalizeSearch(kind.trim());
  if (prefix === '' || !text.startsWith(prefix)) return false;
  const next = text.charAt(prefix.length);
  return next === '' || !/[\p{L}\p{N}]/u.test(next);
}
