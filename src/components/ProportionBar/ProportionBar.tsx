import { useId } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber, formatPercent } from '../../utils/number';
import { joinList, safeValue, seriesEncoding, warnTooManySeries } from '../Chart/a11y';
import { messages } from './ProportionBar.messages';
import styles from './ProportionBar.module.css';

/** A column of the built-in legend. */
export type ProportionLegendColumn = 'value' | 'share' | 'count';

export interface ProportionSegment {
  /**
   * Stable identity of the part ("pix"). It links the bar segment to its legend item: both carry
   * `data-segment`, and the legend item gets the DOM id `<bar id>-<id>`. Without it the position is used.
   */
  id?: string;
  /** Name of the part: "Cash". Shown in the legend and read in the summary, so it is required. */
  label: string;
  /** Size of the part, zero or more. Negative and non-finite values count as 0. */
  value: number;
  /**
   * Explicit CSS color for this segment (for example `var(--ds-success)`), for when the neutral
   * ramp is not enough. Color never carries the meaning alone: the legend and the summary name
   * every part. The color needs 3:1 contrast against the track (`--ds-bg`).
   */
  color?: string;
  /** How many records make up the part (3 invoices). Printed in the `count` legend column. */
  count?: number;
}

export interface ProportionBarProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * The parts of the whole, in display order. Without `color` they use a neutral ramp of four
   * steps (`text`, `text-2`, `text-3`, `line-control`); from the fifth part on, the ramp
   * repeats with a hatch pattern so no two parts look the same (up to eight; group the tail
   * into "Other" or give explicit colors beyond that). The bar never sorts.
   */
  segments: readonly ProportionSegment[];
  /** Name of the whole ("Payment methods"). It starts the summary read for the bar. */
  label?: string;
  /** Shows a list under the bar with swatch, label, percentage and formatted value for each part. */
  legend?: boolean;
  /**
   * The size of the whole, in the unit of the segment values. When it is larger than the sum of
   * the segments, the difference is the remaining part: an unlabelled track after the segments,
   * named "Remaining" in the summary and in the legend. This is how a single segment becomes a
   * "part of the whole" indicator ("Paid 1,240 of 2,000"). When smaller than the sum it is ignored.
   */
  total?: number;
  /**
   * Columns of the legend, in order: `share` (percentage), `value` (formatted with `format`)
   * and `count` (the segment `count`). Default `['share', 'value']`. Percentages are rounded one
   * by one and may not add up to exactly 100%.
   */
  legendColumns?: readonly ProportionLegendColumn[];
  /** Formats each value in the legend. Default: `formatNumber` with the active locale. Use `formatCurrency` for money. */
  format?: (value: number) => ReactNode;
  /** Decimals of the percentages in the summary and the legend. Default `0`. */
  percentDigits?: number;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

const DEFAULT_COLUMNS: readonly ProportionLegendColumn[] = ['share', 'value'];

function segmentStyle(share: number, color: string | undefined): CSSProperties {
  return {
    '--ds-proportion-bar-share': share,
    ...(color ? { '--ds-proportion-bar-color': color } : {}),
  } as CSSProperties;
}

/**
 * A single bar split into the parts of a whole (payment methods, composition). It is an image
 * with a text summary ("Payment methods: Pix 47%, Cash 16%…"), and an optional legend with the
 * percentage and the value of each part.
 *
 * Neutral by default: signal colors are not used for categories. Parts are separated by a
 * gap, and beyond four parts the ramp repeats with a hatch so they never look alike.
 */
export function ProportionBar({
  segments,
  label,
  legend = false,
  total: wholeProp,
  legendColumns = DEFAULT_COLUMNS,
  format,
  percentDigits = 0,
  messages: overrides,
  className,
  ...rest
}: ProportionBarProps) {
  const locale = useDSLocale();
  const t = useMessages('ProportionBar', messages, overrides);

  const baseId = useId();
  const sum = segments.reduce((acc, segment) => acc + safeValue(segment.value), 0);
  const whole = wholeProp !== undefined && safeValue(wholeProp) > sum ? safeValue(wholeProp) : sum;
  const remaining = whole - sum;
  const total = whole;
  const percentOf = (ratio: number) =>
    formatPercent(ratio, locale, {
      minimumFractionDigits: percentDigits,
      maximumFractionDigits: percentDigits,
    });
  const parts = segments.map((segment, index) => {
    const value = safeValue(segment.value);
    const ratio = total > 0 ? value / total : 0;
    return {
      ...segment,
      value,
      ratio,
      percent: percentOf(ratio),
      ...seriesEncoding(index, segment.color !== undefined),
    };
  });

  warnTooManySeries(
    'ProportionBar',
    segments.length,
    segments.some((s) => s.color === undefined),
  );

  const summary = t.summary(
    joinList(locale, [
      ...parts.map((part) => t.segment(part.label, part.percent)),
      ...(remaining > 0 ? [t.segment(t.remaining, percentOf(remaining / total))] : []),
    ]),
    label,
  );
  const renderValue = format ?? ((value: number) => formatNumber(value, locale));

  return (
    <div {...rest} className={classNames(styles.root, className)}>
      <div
        className={styles.track}
        role="img"
        aria-label={summary}
        data-empty={sum === 0 || undefined}
      >
        {parts.map((part, index) =>
          part.value > 0 ? (
            <div
              key={part.id ?? index}
              data-segment={part.id ?? index}
              className={styles.segment}
              data-ramp={part.ramp}
              data-hatched={part.hatched || undefined}
              style={segmentStyle(part.ratio * 100, part.color)}
            />
          ) : null,
        )}
        {remaining > 0 ? (
          <div
            className={styles.rest}
            aria-hidden="true"
            style={{ '--ds-proportion-bar-share': (remaining / total) * 100 } as CSSProperties}
          />
        ) : null}
      </div>
      {legend ? (
        <ul
          className={styles.legend}
          style={{ '--ds-proportion-bar-columns': legendColumns.length } as CSSProperties}
        >
          {parts.map((part, index) => (
            <li
              key={part.id ?? index}
              id={`${baseId}-${part.id ?? index}`}
              className={styles.item}
              data-segment={part.id ?? index}
            >
              <span
                className={styles.swatch}
                aria-hidden="true"
                data-ramp={part.ramp}
                data-hatched={part.hatched || undefined}
                style={segmentStyle(part.value, part.color)}
              />
              <span className={styles.name}>{part.label}</span>
              {legendColumns.map((column) => (
                <span key={column} className={styles[column]}>
                  {column === 'share'
                    ? part.percent
                    : column === 'value'
                      ? renderValue(part.value)
                      : part.count === undefined
                        ? null
                        : formatNumber(part.count, locale)}
                </span>
              ))}
            </li>
          ))}
          {remaining > 0 ? (
            <li className={styles.item} data-remaining="">
              <span className={styles.swatch} aria-hidden="true" data-remaining="" />
              <span className={styles.name}>{t.remaining}</span>
              {legendColumns.map((column) => (
                <span key={column} className={styles[column]}>
                  {column === 'share'
                    ? percentOf(remaining / total)
                    : column === 'value'
                      ? renderValue(remaining)
                      : null}
                </span>
              ))}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
