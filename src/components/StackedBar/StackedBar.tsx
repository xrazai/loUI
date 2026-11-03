import { useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, CSSProperties, KeyboardEvent } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import {
  createValueFormatters,
  joinList,
  safeValue,
  seriesEncoding,
  warnTooManySeries,
} from '../Chart/a11y';
import { ChartDataTable } from '../Chart/ChartDataTable';
import { Legend } from '../Legend';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './StackedBar.messages';
import styles from './StackedBar.module.css';

export type StackedBarOrientation = 'horizontal' | 'vertical';

export interface StackedBarSeries {
  /** Stable identity: the key of this series in each datum's `values`, and the id reported by `onHiddenSeriesChange`. */
  id: string;
  /** Name of the series ("Online"). Shown in the legend, read in each bar's summary and used as a column header in the data table. */
  label: string;
  /**
   * Explicit CSS color (for example `var(--ds-success)`), for when the neutral ramp is not
   * enough. Color never carries the meaning alone: the legend and the summary name every
   * series. The color needs 3:1 contrast against the track (`--ds-bg`).
   */
  color?: string;
}

export interface StackedBarDatum {
  /** Name of the bar ("Q1", "North"). Short: shown under or beside the bar and in the summary. */
  label: string;
  /** Value of each series by series `id`. Missing, negative and non-finite values count as 0. */
  values: Readonly<Record<string, number>>;
}

interface StackedBarBaseProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'aria-label' | 'aria-labelledby' | 'onChange'
> {
  /** One bar per datum, in display order. The chart does not sort. */
  data: readonly StackedBarDatum[];
  /**
   * The parts of each bar, bottom to top (vertical) or start to end (horizontal). Without
   * `color` they follow a neutral ramp of four steps; from the fifth series on the ramp
   * repeats with a hatch (up to eight; beyond that pass `color` or group the tail into "Other").
   */
  series: readonly StackedBarSeries[];
  /** `horizontal` (default): one row per datum. `vertical`: one column per datum. */
  orientation?: StackedBarOrientation;
  /**
   * Draws every bar at full length so each shows the share of its parts (100% stacked). By
   * default bars are scaled to the largest total, so lengths also compare the totals.
   */
  normalize?: boolean;
  /** Formats values in the totals, the legend, the readout and the data table. Default: `Intl` for the active locale. Use `formatCurrency` for money. */
  format?: (value: number) => string;
  /** Shows the legend under the bars. On by default: the legend is what names the series. */
  legend?: boolean;
  /** Makes the legend items toggle buttons that hide and show series. Hidden series leave the bars, totals, summaries and the data table. */
  interactiveLegend?: boolean;
  /**
   * Adds the share of each series (its total over the total of the visible series) to the
   * legend, next to the formatted total. Hidden series leave the denominator. Shares are rounded
   * one by one and may not add up to exactly 100%.
   */
  legendShare?: boolean;
  /** Controlled list of hidden series ids. */
  hiddenSeries?: readonly string[];
  /** Initial hidden series ids when uncontrolled. */
  defaultHiddenSeries?: readonly string[];
  /** Called with the new list of hidden series ids when the user toggles a legend item. */
  onHiddenSeriesChange?: (hiddenSeries: string[]) => void;
  /** Height of the plot area of a vertical chart (a number is px, or any CSS length). Default `--ds-stacked-bar-height` (200px). Ignored when horizontal. */
  height?: number | string;
  /** Longer description of what the chart shows. Read after the name, together with the keyboard instructions. */
  description?: string;
  /** Header of the category column in the hidden data table. Default: the "Category" message. */
  categoryLabel?: string;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

type StackedBarNaming =
  | {
      /** Accessible name of the chart: what it shows ("Orders by channel, per quarter"). Required unless `aria-labelledby` is set. */
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      'aria-label'?: string;
      /** Id of the element that names the chart (a visible heading). */
      'aria-labelledby': string;
    };

export type StackedBarProps = StackedBarBaseProps & StackedBarNaming;

const NO_IDS: readonly string[] = [];

function toLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${String(value)}px` : value;
}

function colorStyle(color: string | undefined, extent?: number, share?: number): CSSProperties {
  return {
    ...(color ? { '--ds-stacked-bar-color': color } : {}),
    ...(extent === undefined ? {} : { '--ds-stacked-bar-extent': extent }),
    ...(share === undefined ? {} : { '--ds-stacked-bar-share': share }),
  } as CSSProperties;
}

/**
 * Stacked bars: how each category divides into the same set of parts, horizontal (a row per
 * category) or vertical (a column per category). Drawn in HTML and CSS, no axis: the total of
 * each bar is printed with it and the bars share one scale.
 *
 * Series are told apart without color: a gap separates neighbouring parts, the neutral ramp
 * differs in lightness, and beyond four series a hatch pattern repeats the ramp. The legend
 * names every series (and can hide them), and a visually hidden table carries all the numbers.
 *
 * Each bar is an image with a text summary ("Q1: Online 40 and Store 30. Total 70."). The bars
 * are one tab stop; the arrow keys move between them, and the active bar's summary is also
 * printed in a readout line under the chart (hover works the same). A single readout per bar,
 * not per segment, keeps the keyboard path short and the focus target large.
 */
export function StackedBar({
  data,
  series,
  orientation = 'horizontal',
  normalize = false,
  format,
  legend = true,
  interactiveLegend = false,
  legendShare = false,
  hiddenSeries,
  defaultHiddenSeries = NO_IDS,
  onHiddenSeriesChange,
  height,
  description,
  categoryLabel,
  messages: overrides,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  style,
  ...rest
}: StackedBarProps) {
  const locale = useDSLocale();
  const t = useMessages('StackedBar', messages, overrides);
  const descriptionId = useId();
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [tabStop, setTabStop] = useState(0);
  const [focused, setFocused] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [hiddenIds, setHiddenIds] = useControllableState<readonly string[]>({
    value: hiddenSeries,
    defaultValue: defaultHiddenSeries,
    onChange: onHiddenSeriesChange
      ? (ids) => {
          onHiddenSeriesChange([...ids]);
        }
      : undefined,
  });

  const { value: formatValue } = createValueFormatters(locale, format);
  warnTooManySeries(
    'StackedBar',
    series.length,
    series.some((s) => s.color === undefined),
  );

  // Encoding follows the position in `series`, so hiding a series never changes the others.
  const visible = series
    .map((s, index) => ({ ...s, ...seriesEncoding(index, s.color !== undefined) }))
    .filter((s) => !hiddenIds.includes(s.id));

  const bars = data.map((datum) => {
    const parts = visible.map((s) => ({ ...s, value: safeValue(datum.values[s.id] ?? 0) }));
    const total = parts.reduce((sum, part) => sum + part.value, 0);
    return { label: datum.label, parts, total };
  });
  const largest = Math.max(0, ...bars.map((bar) => bar.total));
  const summaries = bars.map((bar) =>
    t.bar(
      bar.label,
      joinList(
        locale,
        bar.parts.map((part) => t.series(part.label, formatValue(part.value))),
      ),
      formatValue(bar.total),
    ),
  );

  const count = bars.length;
  const tabIndexOf = Math.min(tabStop, Math.max(0, count - 1));
  const shown = dismissed ? null : (hovered ?? focused);
  const readout = shown === null ? undefined : summaries[shown];

  const focusBar = (index: number) => {
    const next = Math.min(Math.max(0, index), count - 1);
    setTabStop(next);
    barRefs.current[next]?.focus();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.defaultPrevented || count === 0) return;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        focusBar(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        focusBar(index - 1);
        break;
      case 'Home':
        focusBar(0);
        break;
      case 'End':
        focusBar(count - 1);
        break;
      case 'Escape':
        setDismissed(true);
        return;
      default:
        return;
    }
    event.preventDefault();
  };

  const rootStyle =
    orientation === 'vertical' && height !== undefined
      ? ({ ...style, '--ds-stacked-bar-height': toLength(height) } as CSSProperties)
      : style;
  const describedBy = `${descriptionId}-description`;
  const allHidden = series.length > 0 && visible.length === 0;
  const naming = {
    ...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel }),
    ...(ariaLabelledBy === undefined ? {} : { 'aria-labelledby': ariaLabelledBy }),
  };

  return (
    <div
      {...rest}
      className={classNames(styles.root, className)}
      data-orientation={orientation}
      {...(rootStyle ? { style: rootStyle } : {})}
    >
      <div role="group" {...naming} aria-describedby={describedBy} className={styles.plot}>
        {count === 0 ? <p className={styles.empty}>{t.empty}</p> : null}
        {count > 0 && allHidden ? <p className={styles.empty}>{t.allHidden}</p> : null}
        {count > 0 && !allHidden ? (
          <ul className={styles.bars}>
            {bars.map((bar, index) => {
              const empty = bar.total === 0;
              const extent = normalize || empty ? 100 : (bar.total / largest) * 100;
              return (
                <li key={index} className={styles.row} data-active={index === shown || undefined}>
                  <span className={styles.category} aria-hidden="true">
                    {bar.label}
                  </span>
                  <div className={styles.slot}>
                    {/* A focusable image: arrow keys move between bars. No interactive role fits a chart, and the hidden table holds the data. */}
                    {/* eslint-disable-next-line jsx-a11y-x/no-noninteractive-element-interactions -- chart keyboard traversal, see the comment above */}
                    <div
                      ref={(element) => {
                        barRefs.current[index] = element;
                      }}
                      className={styles.track}
                      role="img"
                      aria-label={summaries[index]}
                      tabIndex={index === tabIndexOf ? 0 : -1}
                      data-empty={empty || undefined}
                      style={colorStyle(undefined, extent)}
                      onKeyDown={(event) => {
                        handleKeyDown(event, index);
                      }}
                      onFocus={() => {
                        setTabStop(index);
                        setFocused(index);
                        setDismissed(false);
                      }}
                      onBlur={() => {
                        setFocused(null);
                      }}
                      onPointerEnter={() => {
                        setHovered(index);
                        setDismissed(false);
                      }}
                      onPointerLeave={() => {
                        setHovered(null);
                      }}
                    >
                      {bar.parts.map((part) =>
                        part.value > 0 ? (
                          <div
                            key={part.id}
                            className={styles.segment}
                            data-ramp={part.ramp}
                            data-hatched={part.hatched || undefined}
                            style={colorStyle(part.color, undefined, part.value)}
                          />
                        ) : null,
                      )}
                    </div>
                  </div>
                  <span className={styles.total} aria-hidden="true">
                    {formatValue(bar.total)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      {/* Visual only: the focused bar is announced through its own name. */}
      <p className={styles.readout} aria-hidden="true">
        {readout}
      </p>
      {legend && series.length > 0 ? (
        <Legend
          items={series.map((s) => ({
            id: s.id,
            label: s.label,
            ...(s.color ? { color: s.color } : {}),
            amount: data.reduce((sum, datum) => sum + safeValue(datum.values[s.id] ?? 0), 0),
            value: formatValue(
              data.reduce((sum, datum) => sum + safeValue(datum.values[s.id] ?? 0), 0),
            ),
          }))}
          showShare={legendShare}
          orientation={legendShare ? 'vertical' : 'horizontal'}
          interactive={interactiveLegend}
          hiddenIds={hiddenIds}
          onHiddenIdsChange={setHiddenIds}
        />
      ) : null}
      <VisuallyHidden id={describedBy}>
        {description ? `${description} ` : ''}
        {t.instructions(count, formatNumber(count, locale))}
      </VisuallyHidden>
      <ChartDataTable
        caption={t.tableCaption(ariaLabel)}
        columns={[categoryLabel ?? t.category, ...visible.map((s) => s.label), t.total]}
        rows={bars.map((bar) => ({
          header: bar.label,
          cells: [...bar.parts.map((part) => formatValue(part.value)), formatValue(bar.total)],
        }))}
      />
    </div>
  );
}
