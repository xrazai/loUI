import { useId } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { ToggleButton } from 'react-aria-components';
import { useControllableState } from '../../hooks/useControllableState';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { seriesEncoding } from '../Chart/a11y';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './Legend.messages';
import styles from './Legend.module.css';

export type LegendOrientation = 'horizontal' | 'vertical';

export interface LegendItem {
  /** Stable identity of the series. Used by `hiddenIds`; never shown. */
  id: string;
  /** Name of the series ("Online"). Short, sentence case. */
  label: string;
  /** Optional value printed after the label (a formatted number, a percentage). */
  value?: ReactNode;
  /**
   * Explicit CSS color of the swatch (for example `var(--ds-success)`). Without it the swatch
   * follows the neutral series ramp by position, with a hatch from the fifth item on, exactly
   * like the charts that use this legend. Color never carries the meaning alone: the label does.
   */
  color?: string;
}

export interface LegendProps extends Omit<
  ComponentPropsWithRef<'ul'>,
  'children' | 'onChange' | 'role'
> {
  /** The series, in the same order as in the chart (the order sets the swatch of items without `color`). */
  items: readonly LegendItem[];
  /** `horizontal` (default) wraps items in a row; `vertical` stacks them, one per line. */
  orientation?: LegendOrientation;
  /**
   * Turns each item into a toggle button (`aria-pressed`: pressed means the series is shown),
   * so readers can hide series in the chart that consumes the legend. Off by default: a plain list.
   */
  interactive?: boolean;
  /** Controlled list of hidden series ids (interactive legends). */
  hiddenIds?: readonly string[];
  /** Initial hidden series ids when uncontrolled. */
  defaultHiddenIds?: readonly string[];
  /** Called with the new list of hidden ids whenever the user toggles an item. */
  onHiddenIdsChange?: (hiddenIds: string[]) => void;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

const NO_IDS: readonly string[] = [];

function swatchStyle(color: string | undefined): CSSProperties | undefined {
  return color ? ({ '--ds-legend-color': color } as CSSProperties) : undefined;
}

/**
 * A list of the series of a chart: swatch, name and, optionally, a value. With `interactive`
 * each item is a toggle button that hides or shows its series, and the legend reports the
 * hidden ids so the chart can leave those series out (`StackedBar` does this itself; with
 * `Chart` keep `hiddenIds` in state and filter your data).
 *
 * The swatch is never the only identification: every item has its text label, a hatch pattern
 * tells apart series beyond the fourth, and a hidden series shows a hollow swatch and a struck
 * label in addition to the pressed state read by screen readers.
 */
export function Legend({
  items,
  orientation = 'horizontal',
  interactive = false,
  hiddenIds,
  defaultHiddenIds = NO_IDS,
  onHiddenIdsChange,
  messages: overrides,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: LegendProps) {
  const t = useMessages('Legend', messages, overrides);
  const hintId = useId();
  const [hidden, setHidden] = useControllableState<readonly string[]>({
    value: hiddenIds,
    defaultValue: defaultHiddenIds,
    onChange: onHiddenIdsChange
      ? (ids) => {
          onHiddenIdsChange([...ids]);
        }
      : undefined,
  });

  const describedBy = [ariaDescribedBy, interactive ? hintId : undefined].filter(Boolean).join(' ');
  const naming =
    ariaLabelledBy === undefined
      ? { 'aria-label': ariaLabel ?? t.label }
      : { 'aria-labelledby': ariaLabelledBy };

  return (
    <>
      <ul
        {...rest}
        {...naming}
        {...(describedBy ? { 'aria-describedby': describedBy } : {})}
        className={classNames(styles.root, className)}
        data-orientation={orientation}
        data-interactive={interactive || undefined}
      >
        {items.map((item, index) => {
          const off = hidden.includes(item.id);
          const encoding = seriesEncoding(index, item.color !== undefined);
          const content = (
            <>
              <span
                className={styles.swatch}
                aria-hidden="true"
                data-ramp={encoding.ramp}
                data-hatched={encoding.hatched || undefined}
                data-off={off || undefined}
                style={swatchStyle(item.color)}
              />
              <span className={styles.name}>{item.label}</span>
              {item.value === undefined ? null : <span className={styles.value}>{item.value}</span>}
            </>
          );
          return (
            <li key={item.id} className={styles.item} data-off={off || undefined}>
              {interactive ? (
                <ToggleButton
                  className={classNames(styles.toggle)}
                  isSelected={!off}
                  onChange={(shown) => {
                    setHidden(shown ? hidden.filter((id) => id !== item.id) : [...hidden, item.id]);
                  }}
                >
                  {content}
                </ToggleButton>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
      {interactive ? <VisuallyHidden id={hintId}>{t.toggleHint}</VisuallyHidden> : null}
    </>
  );
}
