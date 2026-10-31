import { useCallback } from 'react';
import type { ReactNode, Ref } from 'react';
import { Button as AriaButton, Link as AriaLink } from 'react-aria-components';
import type { LinkProps as AriaLinkProps } from 'react-aria-components';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { Icon } from '../Icon';
import type { IconComponent } from '../Icon';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './NavItem.messages';
import styles from './NavItem.module.css';

const LINK_ONLY_PROPS = [
  'target',
  'rel',
  'download',
  'ping',
  'referrerPolicy',
  'hrefLang',
  'routerOptions',
] as readonly string[];

export type NavItemTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface NavItemProps extends Omit<
  AriaLinkProps,
  'className' | 'style' | 'children' | 'elementType' | 'aria-current'
> {
  /** Label: a noun in sentence case ("Orders"). Truncated with an ellipsis when it does not fit. */
  children: ReactNode;
  /**
   * Destination. With `href` the item is a real link (`<a>`) and navigates through the router
   * set on `DSProvider`. Without it the item is a `<button>` that runs `onPress`.
   */
  href?: string;
  /** Icon from the curated set, drawn at 18px before the label. Decorative. */
  icon?: IconComponent;
  /**
   * Marks the item for the page or view being shown: sets `aria-current="page"`, the raised
   * background and the 2px ink bar. Exactly one item of a navigation should be active.
   */
  isActive?: boolean;
  /**
   * A count shown in a pill at the end of the item. `0` shows no pill. Numbers are formatted
   * for the active locale.
   */
  count?: number | string;
  /**
   * The text a screen reader hears instead of the bare number, with what is being counted
   * ("3 pending", "12 unread"). Always set it together with `count`; without it a generic
   * "Count: 3" from the message catalog is used.
   */
  countLabel?: string;
  /**
   * Tone of the count pill. Color never carries the meaning alone: `countLabel` does.
   * Default `neutral`.
   */
  countTone?: NavItemTone;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
  className?: string;
  /** Ref to the underlying `<a>` (with `href`) or `<button>` element. */
  ref?: Ref<HTMLElement>;
}

/**
 * One entry of a navigation list. A real link when it has an `href`, a button when it only has
 * `onPress`. The active item is marked with `aria-current="page"`, a raised background and a
 * 2px ink bar at the start edge.
 */
export function NavItem({
  children,
  href,
  icon,
  isActive = false,
  count,
  countLabel,
  countTone = 'neutral',
  messages: overrides,
  className,
  ref,
  ...rest
}: NavItemProps) {
  const locale = useDSLocale();
  const t = useMessages('NavItem', messages, overrides);
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  const showCount = count !== undefined && count !== '' && count !== 0;
  const visibleCount = typeof count === 'number' ? formatNumber(count, locale) : count;
  const classes = classNames(styles.root, className);
  const current = isActive ? ({ 'aria-current': 'page' } as const) : {};

  const content = (
    <>
      {icon ? <Icon icon={icon} size="md" className={styles.icon} /> : null}
      <span className={styles.label}>{children}</span>
      {showCount ? (
        <span className={styles.count} data-tone={countTone}>
          <span aria-hidden="true">{visibleCount}</span>
          <VisuallyHidden> {countLabel ?? t.count(String(visibleCount))}</VisuallyHidden>
        </span>
      ) : null}
    </>
  );

  if (href === undefined) {
    // Link-only props mean nothing on a button.
    const buttonProps = Object.fromEntries(
      Object.entries(rest).filter(([key]) => !LINK_ONLY_PROPS.includes(key)),
    );
    return (
      <AriaButton
        {...buttonProps}
        ref={setRef}
        {...current}
        data-active={isActive || undefined}
        className={classes}
      >
        {content}
      </AriaButton>
    );
  }

  return (
    <AriaLink
      {...rest}
      ref={setRef}
      href={href}
      {...current}
      data-active={isActive || undefined}
      className={classes}
    >
      {content}
    </AriaLink>
  );
}
