import type { Ref } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import type { ButtonProps as AriaButtonProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { Icon } from '../Icon';
import type { IconComponent } from '../Icon';
import { Tooltip } from '../Tooltip';
import type { TooltipPlacement } from '../Tooltip';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'secondary' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonTooltipOptions {
  /** Keyboard shortcut shown after the label ("N"). */
  shortcut?: string;
  /** Side of the button, `top` by default. */
  placement?: TooltipPlacement;
}

export interface IconButtonProps extends Omit<
  AriaButtonProps,
  'className' | 'style' | 'children' | 'isPending' | 'aria-label' | 'aria-labelledby'
> {
  /**
   * Accessible name, required. Say what the button does, as a verb plus object when there is
   * one ("Add order", "Close dialog"), not what it looks like ("Plus").
   */
  label: string;
  /** The icon to draw: one of the curated set (for example `PlusIcon`). Decorative inside the button. */
  icon: IconComponent;
  /** Visual style: `secondary` (default, bordered) or `ghost` (no border at rest). */
  variant?: IconButtonVariant;
  /** Square size token: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: IconButtonSize;
  /**
   * Shows `label` in a `Tooltip` on hover and keyboard focus. Pass `true`, or an object to add a
   * shortcut or change the side. Off by default. The `label` stays the accessible name; the
   * tooltip only repeats it visually for sighted mouse users.
   */
  tooltip?: boolean | IconButtonTooltipOptions;
  className?: string;
  /** Ref to the underlying `<button>` element. */
  ref?: Ref<HTMLButtonElement>;
}

const ICON_SIZE = { sm: 'sm', md: 'md', lg: 'lg' } as const;

/**
 * A square button with a single icon and a required accessible name.
 *
 * The `label` becomes `aria-label`; there is no `title` (it would duplicate the name and is
 * not keyboard accessible). Set `tooltip` to show the label in a `Tooltip` on hover and focus.
 */
export function IconButton({
  label,
  icon,
  variant = 'secondary',
  size = 'md',
  tooltip,
  className,
  ...rest
}: IconButtonProps) {
  const button = (
    <AriaButton
      {...rest}
      aria-label={label}
      data-variant={variant}
      data-size={size}
      className={classNames(styles.root, className)}
    >
      <Icon icon={icon} size={ICON_SIZE[size]} />
    </AriaButton>
  );
  if (!tooltip) return button;
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
