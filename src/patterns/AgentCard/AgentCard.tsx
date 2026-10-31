import { useId } from 'react';
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { Button as AriaButton, Link as AriaLink } from 'react-aria-components';
import { Badge } from '../../components/Badge';
import type { BadgeTone } from '../../components/Badge';
import { Icon } from '../../components/Icon';
import type { IconComponent } from '../../components/Icon';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { messages } from './AgentCard.messages';
import styles from './AgentCard.module.css';

export type AgentCardStatus = 'testing' | 'active' | 'paused' | 'soon';

export interface AgentCardProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'title'> {
  /** Name of the agent. It is the accessible name of the card's single link or button. */
  name: string;
  /** Short caption under the name (the area the agent works in). */
  area?: string | undefined;
  /** Icon of the agent: any icon of the curated set (for example `SearchIcon`) or another Lucide icon. Decorative. */
  icon?: IconComponent | undefined;
  /** One or two sentences about what the agent does. Part of the accessible description. */
  description?: ReactNode | undefined;
  /**
   * Lifecycle of the agent. `testing`, `active` and `paused` are available. `soon` is not
   * interactive: dashed border, no link, no pending count. Default `active`.
   */
  status?: AgentCardStatus;
  /** Number of items waiting for approval. Shown (accent number plus text) only when above zero and the agent is available. */
  pending?: number;
  /** Text about the last activity ("Last reply sent at 08:40"). Shown in the footer. */
  lastActivity?: ReactNode | undefined;
  /** Destination of the card. Renders a real link (router-aware through `DSProvider`). */
  href?: string;
  /** Called when the card is activated. Without `href` it renders a real button. */
  onOpen?: () => void;
  /** Heading level of the agent name (`h1` to `h6`). Default `3`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

const STATUS_TONE: Record<AgentCardStatus, BadgeTone> = {
  testing: 'accent',
  active: 'success',
  paused: 'warning',
  soon: 'neutral',
};

/**
 * A card for one agent: icon, name, status, description and a footer with the last activity
 * and the number of items waiting for approval.
 *
 * The whole card is clickable through the "stretched link" pattern: the agent name inside the
 * heading is the only link (or button), and a pseudo-element extends its hit area over the
 * card. The accessible name is just the agent name; status, description and footer are the
 * description. There is no nested interactive element and no `role="button"` on a `div`.
 */
export function AgentCard({
  name,
  area,
  icon,
  description,
  status = 'active',
  pending = 0,
  lastActivity,
  href,
  onOpen,
  headingLevel = 3,
  messages: overrides,
  className,
  ...rest
}: AgentCardProps) {
  const t = useMessages('AgentCard', messages, overrides);
  const locale = useDSLocale();
  const ids = useId();
  const descriptionId = `${ids}-description`;
  const statusId = `${ids}-status`;
  const footerId = `${ids}-footer`;
  const Heading = `h${String(headingLevel)}` as ElementType;
  const available = status !== 'soon';
  const interactive = available && (href !== undefined || onOpen !== undefined);
  const showPending = available && pending > 0;
  const footerText = lastActivity ?? (available ? null : t.notConfigured);
  const hasDescription = description !== undefined && description !== null && description !== '';
  const hasFooter = footerText !== null || showPending;
  const statusLabel = {
    testing: t.statusTesting,
    active: t.statusActive,
    paused: t.statusPaused,
    soon: t.statusSoon,
  }[status];
  const describedBy = [
    statusId,
    hasDescription ? descriptionId : undefined,
    hasFooter ? footerId : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  let nameNode: ReactNode = name;
  if (interactive) {
    nameNode =
      href === undefined ? (
        <AriaButton
          className={classNames(styles.action)}
          aria-describedby={describedBy}
          {...(onOpen ? { onPress: onOpen } : {})}
        >
          {name}
        </AriaButton>
      ) : (
        <AriaLink
          className={classNames(styles.action)}
          href={href}
          aria-describedby={describedBy}
          {...(onOpen ? { onPress: onOpen } : {})}
        >
          {name}
        </AriaLink>
      );
  }

  return (
    <div
      {...rest}
      className={classNames(styles.root, className)}
      data-status={status}
      data-interactive={interactive || undefined}
    >
      <div className={styles.header}>
        <span className={styles.iconBox} aria-hidden="true">
          {icon ? <Icon icon={icon} size="lg" /> : null}
        </span>
        <div className={styles.titles}>
          <Heading className={styles.name}>{nameNode}</Heading>
          {area ? <span className={styles.area}>{area}</span> : null}
        </div>
        <Badge id={statusId} tone={STATUS_TONE[status]}>
          {statusLabel}
        </Badge>
      </div>
      {hasDescription ? (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      ) : null}
      {hasFooter ? (
        <div id={footerId} className={styles.footer}>
          <span className={styles.last}>{footerText}</span>
          {showPending ? (
            <span className={styles.pending}>
              <span className={styles.count}>{formatNumber(pending, locale)}</span>{' '}
              <span className={styles.pendingText}>{t.pending(pending)}</span>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
