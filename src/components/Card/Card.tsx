import { useId } from 'react';
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'raised';
export type CardHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface CardProps extends Omit<ComponentPropsWithRef<'section'>, 'title'> {
  /**
   * Title shown as an uppercase mono caption. It is a real heading (see `headingLevel`) and
   * names the card region through `aria-labelledby`.
   */
  title?: ReactNode;
  /** Heading level of the title (`h1` to `h6`). Pick the level that fits the page outline. Default `2`. */
  headingLevel?: CardHeadingLevel;
  /** Controls placed at the end of the header, next to the title (buttons, a menu). */
  actions?: ReactNode;
  /**
   * `default` is a flat surface with a border. `raised` uses the raised surface, a stronger
   * border and the overlay shadow: use it only for a card that floats above the page (a
   * pinned panel, a detail popover shell), never for cards that sit in the normal flow.
   */
  variant?: CardVariant;
  /** `md` applies the card padding token; `none` removes it (for full-bleed content such as a table). Default `md`. */
  padding?: 'md' | 'none';
}

/**
 * A bordered surface that groups related content. With a `title` it is a labelled region
 * (`section` named by its heading).
 */
export function Card({
  title,
  headingLevel = 2,
  actions,
  variant = 'default',
  padding = 'md',
  className,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: CardProps) {
  const headingId = useId();
  const Heading = `h${String(headingLevel)}` as ElementType;
  const hasTitle = title !== undefined && title !== null && title !== false && title !== '';
  const labelledBy = ariaLabelledBy ?? (hasTitle && !ariaLabel ? headingId : undefined);
  return (
    <section
      {...rest}
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      className={classNames(styles.root, className)}
      data-variant={variant}
      data-padding={padding}
    >
      {hasTitle || actions ? (
        <header className={styles.header}>
          {hasTitle ? (
            <Heading id={headingId} className={styles.title}>
              {title}
            </Heading>
          ) : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
