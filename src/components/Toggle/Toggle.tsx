import { useContext } from 'react';
import type { ReactNode, Ref } from 'react';
import { ToggleButton as AriaToggleButton } from 'react-aria-components';
import type { ToggleButtonProps as AriaToggleButtonProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { Icon } from '../Icon';
import type { IconComponent } from '../Icon/icons';
import { Tooltip } from '../Tooltip';
import type { TooltipPlacement } from '../Tooltip';
import { ToggleGroupDefaultsContext } from './ToggleContext';
import styles from './Toggle.module.css';

export type ToggleVariant = 'secondary' | 'ghost';
export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleTooltipOptions {
  /** Keyboard shortcut shown after the label ("B"). */
  shortcut?: string;
  /** Side of the button, `top` by default. */
  placement?: TooltipPlacement;
}

interface ToggleBaseProps extends Omit<
  AriaToggleButtonProps,
  'className' | 'style' | 'children' | 'render' | 'id' | 'aria-label' | 'aria-labelledby'
> {
  /**
   * Inside a `ToggleGroup`: the value of this toggle in the group's `value` (required there,
   * unique in the group). Standalone: the DOM id.
   */
  id?: string;
  /**
   * Visual style, as for `Button`. `secondary` (default) has a border; `ghost` has none at rest.
   * Inside a `ToggleGroup` it defaults to the group's `variant`.
   */
  variant?: ToggleVariant;
  /**
   * Height token: `sm` 32px, `md` 40px (default), `lg` 48px. Inside a `ToggleGroup` it defaults
   * to the group's `size`.
   */
  size?: ToggleSize;
  className?: string;
  /** Ref to the underlying `<button>` element. */
  ref?: Ref<HTMLButtonElement>;
}

export interface TextToggleProps extends ToggleBaseProps {
  /** Label: a short noun or verb in sentence case ("Bold", "Show archived"). */
  children: ReactNode;
  /** Node before the label, usually `<Icon size="sm" />`. Decorative; the label names the toggle. */
  leading?: ReactNode;
  /** Replaces the accessible name when the visible label is not enough. Rarely needed. */
  'aria-label'?: string;
  /** Id of the element that names the toggle. */
  'aria-labelledby'?: string;
  icon?: undefined;
  label?: undefined;
  tooltip?: undefined;
}

export interface IconToggleProps extends ToggleBaseProps {
  /**
   * Accessible name of an icon-only toggle, required. Name what the toggle controls, not what
   * it looks like and not its state ("Bold", "Show archived"): the pressed state is announced
   * separately.
   */
  label: string;
  /** The icon to draw: one of the curated set (for example `StarIcon`). Decorative inside the button. */
  icon: IconComponent;
  /**
   * Shows `label` in a `Tooltip` on hover and keyboard focus. Pass `true`, or an object to add
   * a shortcut or change the side. The `label` stays the accessible name.
   */
  tooltip?: boolean | ToggleTooltipOptions;
  children?: undefined;
  leading?: undefined;
}

export type ToggleProps = TextToggleProps | IconToggleProps;

const ICON_SIZE = { sm: 'sm', md: 'md', lg: 'lg' } as const;

/**
 * A button that stays pressed: it switches one setting on or off (bold text, a filter, "show
 * archived"). Built on React Aria `ToggleButton`: a native `<button>` with `aria-pressed`,
 * toggled by `Enter` and `Space`.
 *
 * Use it for an independent on/off choice that applies at once. For a setting inside a form
 * use `Switch` or `Checkbox`; for several related toggles use `ToggleGroup`; for one value out
 * of a few use `SegmentedControl`.
 */
export function Toggle(props: ToggleProps) {
  const defaults = useContext(ToggleGroupDefaultsContext);
  const {
    variant = defaults.variant ?? 'secondary',
    size = defaults.size ?? 'md',
    className,
    label,
    icon,
    tooltip,
    leading,
    children,
    ...rest
  } = props;
  const button = (
    <AriaToggleButton
      {...rest}
      {...(icon === undefined ? {} : { 'aria-label': label })}
      data-variant={variant}
      data-size={size}
      data-icon-only={icon !== undefined || undefined}
      className={classNames(styles.root, className)}
    >
      {icon === undefined ? (
        <span className={styles.content}>
          {leading ? <span className={styles.slot}>{leading}</span> : null}
          {children}
        </span>
      ) : (
        <Icon icon={icon} size={ICON_SIZE[size]} />
      )}
    </AriaToggleButton>
  );
  if (icon === undefined || !tooltip) return button;
  const options = tooltip === true ? {} : tooltip;
  return (
    <Tooltip
      content={label}
      isDisabled={rest.isDisabled === true}
      {...(options.shortcut ? { shortcut: options.shortcut } : {})}
      {...(options.placement ? { placement: options.placement } : {})}
    >
      {button}
    </Tooltip>
  );
}
