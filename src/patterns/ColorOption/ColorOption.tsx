import type { ReactNode, Ref } from 'react';
import { ToggleButton } from 'react-aria-components';
import type { ToggleButtonProps } from 'react-aria-components';
import { Icon } from '../../components/Icon';
import { CheckIcon } from '../../components/Icon/icons';
import { Swatch } from '../../components/Swatch';
import { classNames } from '../../utils/classNames';
import styles from './ColorOption.module.css';

export interface ColorOptionProps extends Omit<
  ToggleButtonProps,
  'className' | 'style' | 'children' | 'aria-label' | 'aria-labelledby' | 'aria-pressed'
> {
  /** The color to show, as `#rgb` or `#rrggbb`. */
  color: string;
  /** Name of the color ("Navy"). It is the accessible name of the option and is always visible. */
  label: string;
  /**
   * Optional short text after the label (a count, "Default", a code). It is part of the
   * accessible name. While the option is selected and no `mark` is given, a check is shown
   * instead.
   */
  mark?: ReactNode;
  /** Class name for the button. */
  className?: string | undefined;
  /** Ref to the underlying `<button>`. */
  ref?: Ref<HTMLButtonElement> | undefined;
}

/**
 * A selectable option that shows a color swatch and its name. It is a toggle button
 * (`aria-pressed`), so each option is chosen independently: put several in a
 * `role="group"` with an accessible name to pick any number of colors.
 * `isSelected` / `defaultSelected` / `onChange(isSelected)` follow React Aria.
 *
 * Why a toggle and not a radio: the handoff uses it to pick several colors (a product's
 * available colors). To pick exactly one color, use `ChoiceTiles` or `RadioGroup` instead.
 */
export function ColorOption({ color, label, mark, className, ref, ...rest }: ColorOptionProps) {
  return (
    <ToggleButton {...rest} ref={ref} className={classNames(styles.root, className)}>
      {({ isSelected }) => (
        <>
          <Swatch color={color} size="sm" decorative />
          <span className={styles.label}>{label}</span>
          {mark ? (
            <span className={styles.mark}>{mark}</span>
          ) : isSelected ? (
            <span className={styles.mark} aria-hidden="true">
              <Icon icon={CheckIcon} size="sm" />
            </span>
          ) : null}
        </>
      )}
    </ToggleButton>
  );
}
