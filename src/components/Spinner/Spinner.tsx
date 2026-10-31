import type { ComponentPropsWithRef } from 'react';
import { useContext } from 'react';
import { ProgressBarContext } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { messages } from './Spinner.messages';
import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends Omit<
  ComponentPropsWithRef<'span'>,
  'children' | 'role' | 'aria-label' | 'aria-hidden' | 'aria-labelledby'
> {
  /** Size token: `sm` 14px, `md` 18px (default), `lg` 20px. */
  size?: SpinnerSize;
  /**
   * Accessible name. Defaults to the "Loading" message. Say what is loading when it helps
   * ("Loading orders").
   */
  label?: string;
  /**
   * Hide the spinner from assistive technology. Use it only when the surrounding UI already
   * announces the busy state (visible status text, `aria-busy` region). Not needed inside a
   * pending `Button`, which wires the spinner as its busy label.
   */
  decorative?: boolean;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

/**
 * An indeterminate loading ring that inherits the text color.
 *
 * It is a `progressbar` without a value, not a live region, so many spinners on a screen do
 * not each interrupt a screen reader. For large areas prefer `Skeleton`. Under
 * `prefers-reduced-motion` the ring is static.
 */
export function Spinner({
  size = 'md',
  label,
  decorative = false,
  messages: overrides,
  className,
  id,
  ...rest
}: SpinnerProps) {
  const t = useMessages('Spinner', messages, overrides);
  // A pending RAC Button provides the id it uses as part of its own accessible name.
  const context = useContext(ProgressBarContext);
  const contextId = context && 'id' in context ? context.id : undefined;
  const classes = classNames(styles.root, className);

  if (decorative) {
    return <span {...rest} id={id} aria-hidden="true" data-size={size} className={classes} />;
  }
  return (
    <span
      {...rest}
      id={id ?? contextId}
      role="progressbar"
      aria-label={label ?? t.loading}
      data-size={size}
      className={classes}
    />
  );
}
