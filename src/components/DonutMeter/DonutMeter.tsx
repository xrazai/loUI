import type { CSSProperties, ReactNode, Ref } from 'react';
import { Label, Meter as AriaMeter } from 'react-aria-components';
import type { MeterProps as AriaMeterProps } from 'react-aria-components';
import { useDSLocale } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatPercent } from '../../utils/number';
import type { FieldLabelingProps } from '../Field';
import { warnMissingName } from '../Field/labeling';
import styles from './DonutMeter.module.css';

export type DonutMeterTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type DonutMeterSize = 'sm' | 'md' | 'lg';

interface DonutMeterBaseProps extends Omit<
  AriaMeterProps,
  'children' | 'className' | 'style' | 'render' | 'slot' | 'aria-label' | 'aria-labelledby'
> {
  /**
   * Color of the ring: `accent` (default), `neutral`, `success`, `warning` or `danger`. Color
   * is never the only signal: the percentage is printed in the center and the label says what
   * it is.
   */
  tone?: DonutMeterTone;
  /** Diameter token: `sm` 48px, `md` 72px (default), `lg` 96px. */
  size?: DonutMeterSize;
  /** Prints the percentage in the center. On by default. Turn it off when the center is empty on purpose. */
  showValue?: boolean;
  /**
   * Replaces the percentage in the center ("12" over "days"). Visual only: screen readers get
   * `valueLabel` (or the percentage) as the value of the meter.
   */
  centerLabel?: ReactNode;
  className?: string;
  /** Ref to the meter element. */
  ref?: Ref<HTMLDivElement>;
}

export type DonutMeterProps = DonutMeterBaseProps & FieldLabelingProps;

/**
 * A circular meter for one proportion: how much of a whole is used, done or filled (storage
 * used, goal reached, stock level). The percentage is printed in the center, formatted with
 * `Intl` for the active locale. Built on React Aria `Meter` (`role="meter"` with
 * `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`).
 *
 * It needs an accessible name: a visible `label` (printed under the ring), `aria-label` or
 * `aria-labelledby`. For a task that makes progress use `Progress`; for a bar use `Meter`;
 * for one proportion among several use `ProportionBar`.
 */
export function DonutMeter({
  label,
  tone = 'accent',
  size = 'md',
  showValue = true,
  centerLabel,
  className,
  ref,
  ...rest
}: DonutMeterProps) {
  warnMissingName('DonutMeter', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const locale = useDSLocale();
  return (
    <AriaMeter
      {...rest}
      {...(ref ? { ref } : {})}
      className={classNames(styles.root, className)}
      data-tone={tone}
      data-size={size}
    >
      {({ percentage }) => {
        const share = Number.isFinite(percentage) ? Math.min(100, Math.max(0, percentage)) : 0;
        const ringStyle = { '--ds-donut-meter-value': share } as CSSProperties;
        return (
          <>
            <div className={styles.ring}>
              <svg
                className={styles.svg}
                viewBox="0 0 100 100"
                aria-hidden="true"
                focusable="false"
              >
                <circle className={styles.track} cx="50" cy="50" />
                <circle
                  className={styles.fill}
                  cx="50"
                  cy="50"
                  pathLength="100"
                  style={ringStyle}
                />
              </svg>
              {showValue ? (
                <span className={styles.center}>
                  {centerLabel ?? formatPercent(share / 100, locale)}
                </span>
              ) : null}
            </div>
            {label ? <Label className={classNames(styles.label)}>{label}</Label> : null}
          </>
        );
      }}
    </AriaMeter>
  );
}
