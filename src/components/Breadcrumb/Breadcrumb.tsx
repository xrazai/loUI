import type { ComponentPropsWithRef } from 'react';
import { Breadcrumb as AriaBreadcrumb, Breadcrumbs, Link } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { ChevronRightIcon, Icon } from '../Icon';
import { messages } from './Breadcrumb.messages';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  /** Text of the item: the name of the page or section. */
  label: string;
  /**
   * Destination of an ancestor page. Goes through the router set on `DSProvider`. The last
   * item is the current page and is never a link, so its `href` is ignored.
   */
  href?: string;
}

export interface BreadcrumbProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  /**
   * The trail from the root to the current page. The last item is the current page: it gets
   * `aria-current="page"` and is not a link.
   */
  items: readonly BreadcrumbItem[];
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

/**
 * The path to the current page as an ordered list of links inside a `nav` landmark. The
 * separators are decorative (`aria-hidden`), so a screen reader hears a list of N items. Long
 * labels are truncated with an ellipsis (the current page keeps the most room); collapsing the
 * middle of a long trail into a menu is not supported yet.
 */
export function Breadcrumb({
  items,
  messages: overrides,
  className,
  'aria-label': ariaLabel,
  ...rest
}: BreadcrumbProps) {
  const t = useMessages('Breadcrumb', messages, overrides);
  return (
    <nav {...rest} aria-label={ariaLabel ?? t.label} className={classNames(styles.root, className)}>
      <Breadcrumbs className={classNames(styles.list)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <AriaBreadcrumb
              key={`${String(index)}-${item.label}`}
              className={classNames(styles.item)}
            >
              {isLast ? (
                <span aria-current="page" className={styles.current}>
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    className={classNames(styles.link)}
                    {...(item.href === undefined ? {} : { href: item.href })}
                  >
                    {item.label}
                  </Link>
                  <Icon
                    icon={ChevronRightIcon}
                    size="xs"
                    directional
                    className={styles.separator}
                  />
                </>
              )}
            </AriaBreadcrumb>
          );
        })}
      </Breadcrumbs>
    </nav>
  );
}
