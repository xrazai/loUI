import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../../utils/classNames';
import { Breadcrumb } from '../Breadcrumb';
import type { BreadcrumbItem } from '../Breadcrumb';
import styles from './TopBar.module.css';

export type TopBarHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface TopBarProps extends Omit<ComponentPropsWithRef<'header'>, 'title' | 'children'> {
  /**
   * The title of the page or section. Rendered as a heading (see `headingLevel`). Ignored
   * when `breadcrumb` is set: the trail then names the page and the page supplies its own `h1`.
   */
  title?: ReactNode;
  /** One short line under the title (a count, a date, an environment). Not used with `breadcrumb`. */
  subtitle?: ReactNode;
  /** Heading level of the title, `1` by default (one `h1` per page). */
  headingLevel?: TopBarHeadingLevel;
  /** A breadcrumb trail shown instead of the title. */
  breadcrumb?: readonly BreadcrumbItem[];
  /** Free content next to the title, for example a `Badge` or a `SegmentedControl`. */
  children?: ReactNode;
  /**
   * Actions at the end of the bar. Put the single primary action of the screen last, as a
   * `Button variant="primary"` with its shortcut as a `Kbd` in `trailing`.
   */
  actions?: ReactNode;
}

/**
 * The page header: a title with an optional subtitle, or a breadcrumb trail, and an actions
 * slot. It is a `header` element, `--ds-topbar-h` (64px) high, with a bottom divider. It does
 * not stick by itself; position it in your layout.
 */
export function TopBar({
  title,
  subtitle,
  headingLevel = 1,
  breadcrumb,
  children,
  actions,
  className,
  ...rest
}: TopBarProps) {
  const Heading = `h${String(headingLevel)}` as 'h1';
  return (
    <header {...rest} className={classNames(styles.root, className)}>
      <div className={styles.start}>
        {breadcrumb ? (
          <Breadcrumb items={breadcrumb} />
        ) : title === undefined ? null : (
          <div className={styles.heading}>
            <Heading className={styles.title}>{title}</Heading>
            {subtitle === undefined ? null : <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
