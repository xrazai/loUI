import type { ReactNode, Ref } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import type { ButtonProps as AriaButtonProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { Spinner } from '../Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-solid';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'style' | 'children'> {
  /**
   * Visual style.
   * - `primary`: the single main action of the screen (light ink on dark). One per screen.
   * - `secondary`: default for other actions.
   * - `ghost`: tertiary, low emphasis actions.
   * - `danger`: destructive action that is not yet confirmed.
   * - `danger-solid`: the confirm button of a destructive dialog.
   */
  variant?: ButtonVariant;
  /** Height token: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: ButtonSize;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
  /** Node before the label, usually `<Icon size="sm" />`. Decorative; the label names the button. */
  leading?: ReactNode;
  /** Node after the label, for example a `Kbd` shortcut hint. */
  trailing?: ReactNode;
  /** Label: a short verb plus object in sentence case ("Create order"). */
  children?: ReactNode;
  className?: string;
  /** Ref to the underlying `<button>` element. */
  ref?: Ref<HTMLButtonElement>;
}

const SPINNER_SIZE = { sm: 'sm', md: 'md', lg: 'md' } as const;

/**
 * An action button built on React Aria's `Button`.
 *
 * Use one `primary` button per screen. While `isPending` the button keeps its width, shows a
 * spinner, stays focusable, sets `aria-disabled` and ignores presses, so it can be explained
 * by a tooltip and focus is never lost.
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  leading,
  trailing,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <AriaButton
      {...rest}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      className={classNames(styles.root, className)}
    >
      {({ isPending }) => (
        <>
          <span className={styles.content}>
            {leading ? <span className={styles.slot}>{leading}</span> : null}
            {children}
            {trailing ? <span className={styles.slot}>{trailing}</span> : null}
          </span>
          {isPending ? (
            <span className={styles.pending}>
              <Spinner size={SPINNER_SIZE[size]} />
            </span>
          ) : null}
        </>
      )}
    </AriaButton>
  );
}
