import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../../utils/classNames';
import {
  SPARKLINE_DEFAULT_HEIGHT,
  SPARKLINE_DEFAULT_WIDTH,
  areaPath,
  computeSparkline,
  linePath,
} from './sparklineLayout';
import styles from './Sparkline.module.css';

export type SparklineVariant = 'line' | 'area';
export type SparklineTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface SparklineBaseProps extends Omit<
  ComponentPropsWithRef<'svg'>,
  'children' | 'role' | 'aria-label' | 'aria-labelledby' | 'aria-hidden' | 'width' | 'height'
> {
  /**
   * The values in display order, usually time. `null`, `undefined` and non-finite numbers are
   * gaps: the line breaks there. An empty array draws nothing.
   */
  data: readonly (number | null | undefined)[];
  /** `line` (default) or `area`, which also fills softly under the line. */
  variant?: SparklineVariant;
  /**
   * Color of the line: `neutral` (default), `accent`, `success`, `warning` or `danger`. Color is
   * never the only signal: say what the trend means in the accessible name or next to it.
   */
  tone?: SparklineTone;
  /** Width in px (user units). Shrinks to fit a narrower container. Default 96. */
  width?: number;
  /** Height in px (user units). Default 24. */
  height?: number;
  /** Draws a solid dot on the last value, the current one. */
  showLast?: boolean;
  /** Draws hollow markers on the lowest and the highest value (omitted when all values are equal). */
  showMinMax?: boolean;
  /** Keeps 0 in the vertical range. Default: the range is the data's own minimum to maximum. */
  includeZero?: boolean;
  className?: string;
}

type SparklineNaming =
  | {
      /** Summary of the trend, required unless `decorative` or `aria-labelledby`: "Revenue, last 7 days: up 12%". */
      'aria-label': string;
      'aria-labelledby'?: string;
      decorative?: false;
    }
  | {
      'aria-label'?: string;
      /** Id of the element that summarizes the trend. */
      'aria-labelledby': string;
      decorative?: false;
    }
  | {
      /**
       * Hides the sparkline from assistive technology. Use it only when the same information
       * is in text next to it (a number and "+12%"): the line alone is never the only source.
       */
      decorative: true;
      'aria-label'?: undefined;
      'aria-labelledby'?: undefined;
    };

export type SparklineProps = SparklineBaseProps & SparklineNaming;

function num(value: number): string {
  return String(value);
}

/**
 * A tiny trend line (or area) without axes, drawn in SVG, for tables, stat cards and lists. It
 * shows the shape of a series, not its values: put the current number next to it.
 *
 * It is an image with a required text summary (`aria-label`), or `decorative` when the same
 * information is written next to it. It is not interactive and not focusable. The vertical
 * range is the data's own minimum to maximum, so a small change on a large number still
 * shows; use `Chart` when readers need axes, values per point or zero as a reference.
 */
export function Sparkline({
  data,
  variant = 'line',
  tone = 'neutral',
  width = SPARKLINE_DEFAULT_WIDTH,
  height = SPARKLINE_DEFAULT_HEIGHT,
  showLast = false,
  showMinMax = false,
  includeZero = false,
  decorative = false,
  className,
  ...rest
}: SparklineProps) {
  const layout = computeSparkline({ values: data, width, height, includeZero });
  const semantics = decorative ? ({ 'aria-hidden': true } as const) : ({ role: 'img' } as const);
  return (
    <svg
      {...rest}
      {...semantics}
      focusable="false"
      width={width}
      height={height}
      viewBox={`0 0 ${num(width)} ${num(height)}`}
      data-variant={variant}
      data-tone={tone}
      className={classNames(styles.root, className)}
    >
      {variant === 'area'
        ? layout.segments.map((points) => {
            const d = areaPath(points, layout.baseline);
            return d ? (
              <path key={`area-${num(points[0]?.index ?? 0)}`} d={d} className={styles.area} />
            ) : null;
          })
        : null}
      {layout.segments.map((points) => (
        <path
          key={`line-${num(points[0]?.index ?? 0)}`}
          d={linePath(points)}
          className={styles.line}
        />
      ))}
      {showMinMax && layout.min ? (
        <circle cx={layout.min.x} cy={layout.min.y} className={styles.marker} data-kind="min" />
      ) : null}
      {showMinMax && layout.max ? (
        <circle cx={layout.max.x} cy={layout.max.y} className={styles.marker} data-kind="max" />
      ) : null}
      {showLast && layout.last ? (
        <circle cx={layout.last.x} cy={layout.last.y} className={styles.last} />
      ) : null}
    </svg>
  );
}
