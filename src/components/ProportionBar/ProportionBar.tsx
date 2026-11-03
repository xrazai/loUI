import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber, formatPercent } from '../../utils/number';
import { joinList, safeValue, seriesEncoding, warnTooManySeries } from '../Chart/a11y';
import { messages } from './ProportionBar.messages';
import styles from './ProportionBar.module.css';

export interface ProportionSegment {
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
  /** Formats each value in the legend. Default: `formatNumber` with the active locale. Use `formatCurrency` for money. */
  format?: (value: number) => ReactNode;
  /** Decimals of the percentages in the summary and the legend. Default `0`. */
  percentDigits?: number;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

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
  format,
  percentDigits = 0,
  messages: overrides,
  className,
  ...rest
}: ProportionBarProps) {
  const locale = useDSLocale();
  const t = useMessages('ProportionBar', messages, overrides);

  const total = segments.reduce((sum, segment) => sum + safeValue(segment.value), 0);
  const parts = segments.map((segment, index) => {
    const value = safeValue(segment.value);
    const ratio = total > 0 ? value / total : 0;
    return {
      ...segment,
      value,
      ratio,
      percent: formatPercent(ratio, locale, {
        minimumFractionDigits: percentDigits,
        maximumFractionDigits: percentDigits,
      }),
      ...seriesEncoding(index, segment.color !== undefined),
    };
  });

  warnTooManySeries(
    'ProportionBar',
    segments.length,
    segments.some((s) => s.color === undefined),
  );

  const summary = t.summary(
    joinList(
      locale,
      parts.map((part) => t.segment(part.label, part.percent)),
    ),
    label,
  );
  const renderValue = format ?? ((value: number) => formatNumber(value, locale));

  return (
    <div {...rest} className={classNames(styles.root, className)}>
      <div
        className={styles.track}
        role="img"
        aria-label={summary}
        data-empty={total === 0 || undefined}
      >
        {parts.map((part, index) =>
          part.value > 0 ? (
            <div
              key={index}
              className={styles.segment}
              data-ramp={part.ramp}
              data-hatched={part.hatched || undefined}
              style={segmentStyle(part.ratio * 100, part.color)}
            />
          ) : null,
        )}
      </div>
      {legend ? (
        <ul className={styles.legend}>
          {parts.map((part, index) => (
            <li key={index} className={styles.item}>
              <span
                className={styles.swatch}
                aria-hidden="true"
                data-ramp={part.ramp}
                data-hatched={part.hatched || undefined}
                style={segmentStyle(part.value, part.color)}
              />
              <span className={styles.name}>{part.label}</span>
              <span className={styles.percent}>{part.percent}</span>
              <span className={styles.amount}>{renderValue(part.value)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
