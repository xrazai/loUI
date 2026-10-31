import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { messages } from './SkipLink.messages';
import styles from './SkipLink.module.css';

export interface SkipLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'href' | 'children'> {
  /**
   * Id of the element to jump to, without the `#`. Default `main`. The element should be the
   * page's `<main>` (or its first heading); it does not need a `tabindex`.
   */
  targetId?: string;
  /** Link text. Defaults to "Skip to main content" from the message catalog. */
  children?: ReactNode;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

/**
 * A link that is invisible until a keyboard user focuses it, then jumps past the repeated
 * navigation to the main content (WCAG 2.4.1 Bypass Blocks). Put it as the very first
 * focusable element of the page, before the sidebar and the top bar.
 *
 * It moves focus itself instead of relying on the hash navigation, so it also works with hash
 * based routers and with a target that is not focusable by default.
 */
export function SkipLink({
  targetId = 'main',
  children,
  messages: overrides,
  className,
  onClick,
  ...rest
}: SkipLinkProps) {
  const t = useMessages('SkipLink', messages, overrides);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener(
        'blur',
        () => {
          target.removeAttribute('tabindex');
        },
        { once: true },
      );
    }
    target.focus();
  };

  return (
    <a
      {...rest}
      href={`#${targetId}`}
      onClick={handleClick}
      className={classNames(styles.root, className)}
    >
      {children ?? t.label}
    </a>
  );
}
