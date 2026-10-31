import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * Meaning of the badge: `accent` open or in progress, `success` done, `warning` pending,
   * `danger` failed, `neutral` everything else (default).
   */
  tone?: BadgeTone;
  /** Shows the small decorative dot before the text. It is hidden from assistive technology. Default `true`. */
  dot?: boolean;
  /** The status text. Required: color and the dot never carry the meaning alone. */
  children: ReactNode;
}

/**
 * A pill with a short status label. The text always states the status; the tone and the
 * dot only reinforce it.
 */
export function Badge({ tone = 'neutral', dot = true, className, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={classNames(styles.root, className)} data-tone={tone}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
