import type { CSSProperties, ReactNode, Ref } from 'react';
import { Label, Meter as AriaMeter, ProgressBar as AriaProgressBar } from 'react-aria-components';
import type {
  MeterProps as AriaMeterProps,
  ProgressBarProps as AriaProgressBarProps,
} from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import styles from './Progress.module.css';

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger';

interface BarProps {
  /**
   * Visible label, wired to the bar with `aria-labelledby`. Required unless you set `aria-label`
   * or `aria-labelledby`: a bar without a name is an accessibility bug (React Aria warns in development).
   */
  label?: ReactNode;
  /**
   * Text on the right of the label, in mono type: "6.2 / 10 GB". It is visual only. If it says
   * more than the percentage, also pass `valueLabel` so screen readers hear the same thing.
   */
  meta?: ReactNode;
  /** Shows the formatted percentage (`62%`, from `Intl` with the active locale) as `meta` when `meta` is not given. */
  showValue?: boolean;
  /** Color of the fill. Color is never the only signal: pair it with a label or `meta`. Default `accent`. */
  tone?: ProgressTone;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

type AriaPassThrough<P> = Omit<P, 'children' | 'className' | 'style' | 'render' | 'slot'>;

export type ProgressProps = BarProps & AriaPassThrough<AriaProgressBarProps>;
export type MeterProps = BarProps & AriaPassThrough<AriaMeterProps>;

interface BarRenderValues {
  percentage: number | undefined;
  valueText: string | undefined;
}

function renderBar(
  {
    label,
    meta,
    showValue = false,
  }: {
    label: ReactNode | undefined;
    meta: ReactNode | undefined;
    showValue: boolean | undefined;
  },
  { percentage, valueText }: BarRenderValues,
  indeterminate: boolean,
) {
  const metaText = meta ?? (showValue && !indeterminate ? valueText : undefined);
  const hasHeader = Boolean(label) || Boolean(metaText);
  const fillStyle =
    percentage === undefined
      ? undefined
      : ({ '--progress-value': `${String(percentage)}%` } as CSSProperties);
  return (
    <>
      {hasHeader ? (
        <div className={styles.header}>
          {label ? <Label className={classNames(styles.label)}>{label}</Label> : <span />}
          {metaText ? <span className={styles.meta}>{metaText}</span> : null}
        </div>
      ) : null}
      <div className={styles.track}>
        <div
          className={styles.fill}
          data-indeterminate={indeterminate || undefined}
          {...(fillStyle ? { style: fillStyle } : {})}
        />
      </div>
    </>
  );
}

/**
 * A thin bar for a task that makes progress: determinate with a `value`, or indeterminate
 * when the amount is unknown. Built on React Aria `ProgressBar` (`role="progressbar"`).
 * For a measured quantity that is not a task (disk used, quota) use `Meter`.
 */
export function Progress({
  label,
  meta,
  showValue,
  tone = 'accent',
  className,
  ref,
  ...rest
}: ProgressProps) {
  return (
    <AriaProgressBar
      {...rest}
      {...(ref ? { ref } : {})}
      className={classNames(styles.root, className)}
      data-tone={tone}
    >
      {({ percentage, valueText, isIndeterminate }) =>
        renderBar({ label, meta, showValue }, { percentage, valueText }, isIndeterminate)
      }
    </AriaProgressBar>
  );
}

/**
 * A bar that shows a quantity within a known range (disk used, quota, score), as opposed to
 * progress of a task. Built on React Aria `Meter` (`role="meter"`).
 */
export function Meter({
  label,
  meta,
  showValue,
  tone = 'accent',
  className,
  ref,
  ...rest
}: MeterProps) {
  return (
    <AriaMeter
      {...rest}
      {...(ref ? { ref } : {})}
      className={classNames(styles.root, className)}
      data-tone={tone}
    >
      {({ percentage, valueText }) =>
        renderBar({ label, meta, showValue }, { percentage, valueText }, false)
      }
    </AriaMeter>
  );
}
