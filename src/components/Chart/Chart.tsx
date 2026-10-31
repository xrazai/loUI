import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ComponentPropsWithRef, CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './Chart.messages';
import styles from './Chart.module.css';
import { computeLayout, tooltipPosition } from './chartLayout';

export type ChartType = 'bar' | 'line';
export type ChartTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

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
  const formatTick = useMemo(
    () => format ?? ((value: number) => formatNumber(value, locale, { notation: 'compact' })),
    [format, locale],
  );
  const formatValue = useMemo(
    () => format ?? ((value: number) => formatNumber(value, locale, { maximumFractionDigits: 2 })),
    [format, locale],
  );

  const layout = useMemo(
    () =>
      size && size.width > 0 && size.height > 0
        ? computeLayout({
            values: data.map((datum) => datum.value),
            width: size.width,
            height: size.height,
            formatTick,
          })
        : null,
    [data, size, formatTick],
  );

  const activeIndex = active !== null && active < count ? active : null;
  const activeDatum = activeIndex === null ? undefined : data[activeIndex];
  const hasNotes = highlight !== undefined && Object.keys(highlight).length > 0;

  const announcement =
    activeIndex !== null && activeDatum
      ? t.point(
          activeDatum.label,
          formatValue(activeDatum.value),
          formatNumber(activeIndex + 1, locale),
          formatNumber(count, locale),
          highlight?.[activeIndex],
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
  let tooltip: { text: string; left: number; top: number } | null = null;
  if (layout && activeIndex !== null && activeDatum) {
    const text = `${formatValue(activeDatum.value)} · ${activeDatum.label}${
      highlight?.[activeIndex] ? ` · ${highlight[activeIndex] ?? ''}` : ''
    }`;
    const anchorY = Math.min(layout.y(activeDatum.value), layout.baseline);
    tooltip = {
      text,
      ...tooltipPosition(text.length, layout.x(activeIndex), anchorY, size?.width ?? 0),
    };
  }

  const describedBy = `${descriptionId}-description`;
  const tableCaption = t.tableCaption(ariaLabel);

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
                  y={Math.min(layout.y(datum.value), layout.baseline) - 10}
                  textAnchor="middle"
                >
                  {note}
                </text>
              );
            })}
          </svg>
        ) : null}
        {layout && count === 0 ? <span className={styles.empty}>{t.empty}</span> : null}
        {tooltip ? (
          <span
            className={styles.tooltip}
            aria-hidden="true"
            style={
              {
                '--ds-chart-tooltip-x': `${String(tooltip.left)}px`,
                '--ds-chart-tooltip-y': `${String(tooltip.top)}px`,
              } as CSSProperties
            }
          >
            {tooltip.text}
          </span>
        ) : null}
      </div>
      <VisuallyHidden id={describedBy}>
        {description ? `${description} ` : ''}
        {t.instructions(count, formatNumber(count, locale))}
      </VisuallyHidden>
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
      {/* The wrapper clips the table: a table ignores `overflow` and would stretch the page. */}
      <VisuallyHidden as="div">
        <table>
          <caption>{tableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">{categoryLabel ?? t.category}</th>
              <th scope="col">{valueLabel ?? t.value}</th>
              {hasNotes ? <th scope="col">{t.note}</th> : null}
            </tr>
          </thead>
          <tbody>
            {data.map((datum, index) => (
              <tr key={index}>
                <th scope="row">{datum.label}</th>
                <td>{formatValue(datum.value)}</td>
                {hasNotes ? <td>{highlight[index] ?? ''}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  );
}
