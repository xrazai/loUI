import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './EmptyState.module.css';

export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /**
   * What happened, in one short sentence: "No orders found". Rendered as a heading
   * (see `headingLevel`).
   */
  title: ReactNode;
  /** Heading level of the title (`h1` to `h6`). Pick the level that fits the page outline. Default `2`. */
  headingLevel?: EmptyStateHeadingLevel;
  /** What the user can do about it: "Try another filter or search term." */
  description?: ReactNode;
  /** Optional icon above the title. Decorative: it is hidden from assistive technology. No illustrations. */
  icon?: ReactNode;
  /** The primary action, usually a `Button`. Rendered after the secondary action. */
  action?: ReactNode;
  /** A second, lower-emphasis action. */
  secondaryAction?: ReactNode;
  /** Less padding and a smaller title, for use inside a card, a panel or a table. */
  compact?: boolean;
  /** Dashed border. Set to `false` when the empty state already sits inside a bordered container. Default `true`. */
  bordered?: boolean;
}

/**
 * Tells the user that there is nothing to show, why, and what to do next. The copy follows
 * "what happened + what to do".
 */
export function EmptyState({
  title,
  headingLevel = 2,
  description,
  icon,
  action,
  secondaryAction,
  compact = false,
  bordered = true,
  className,
  ...rest
}: EmptyStateProps) {
  const Heading = `h${String(headingLevel)}` as ElementType;
  return (
    <div
      {...rest}
      className={classNames(styles.root, className)}
      data-compact={compact || undefined}
      data-bordered={bordered || undefined}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <Heading className={styles.title}>{title}</Heading>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action || secondaryAction ? (
        <div className={styles.actions}>
          {secondaryAction}
          {action}
        </div>
      ) : null}
    </div>
  );
}
