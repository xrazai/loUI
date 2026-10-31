import type { ReactNode, Ref } from 'react';
import { Link as AriaLink } from 'react-aria-components';
import type { LinkProps as AriaLinkProps } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { Icon, ExternalLinkIcon } from '../Icon';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './Link.messages';
import styles from './Link.module.css';

export type LinkVariant = 'inline' | 'standalone';

export interface LinkProps extends Omit<AriaLinkProps, 'className' | 'style' | 'children'> {
  /**
   * - `inline` (default): underlined, for links inside running text. Color alone does not
   *   identify a link (WCAG 1.4.1), so the underline is part of the design.
   * - `standalone`: no underline at rest (underlined on hover and focus). Only where the context
   *   makes it obvious that it is a link: a navigation list, a "View all" line under a heading.
   */
  variant?: LinkVariant;
  /** Link text. Describe the destination or action ("Pricing details"), never "click here". */
  children?: ReactNode;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
  className?: string;
  /** Ref to the underlying `<a>` element. */
  ref?: Ref<HTMLAnchorElement>;
}

/** Adds `noopener noreferrer` to whatever `rel` the consumer passed. */
function externalRel(rel: string | undefined): string {
  const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  tokens.add('noopener');
  tokens.add('noreferrer');
  return [...tokens].join(' ');
}

/**
 * A link built on React Aria's `Link`. With `href` it renders a real `<a>` and uses the router
 * set on `DSProvider` for client-side navigation. Links that open a new tab (`target="_blank"`)
 * get `rel="noopener noreferrer"`, an external-link icon and a hidden note for screen readers.
 */
export function Link({
  variant = 'inline',
  children,
  messages: overrides,
  className,
  target,
  rel,
  ...rest
}: LinkProps) {
  const t = useMessages('Link', messages, overrides);
  const opensNewTab = target === '_blank';
  return (
    <AriaLink
      {...rest}
      {...(target === undefined ? {} : { target })}
      {...(opensNewTab ? { rel: externalRel(rel) } : rel === undefined ? {} : { rel })}
      data-variant={variant}
      className={classNames(styles.root, className)}
    >
      {children}
      {opensNewTab ? (
        <>
          <Icon icon={ExternalLinkIcon} size="xs" className={styles.external} />
          <VisuallyHidden> {t.opensInNewTab}</VisuallyHidden>
        </>
      ) : null}
    </AriaLink>
  );
}
