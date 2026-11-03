import { useId } from 'react';
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { Button as AriaButton, Link as AriaLink } from 'react-aria-components';
import type { PressEvent } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './CardLink.messages';
import styles from './CardLink.module.css';

export type CardLinkHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface CardLinkBaseProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'title' | 'children' | 'onClick' | 'onPointerDown' | 'role' | 'tabIndex'
> {
  /**
   * Title of the card. It is the accessible name of the link or button, and a real heading
   * (see `headingLevel`). Keep it to a few words ("Billing").
   */
  title: string;
  /**
   * Supporting text. It is the accessible description (`aria-describedby`), not part of the
   * name. Plain text only: the whole card is one interactive element, so never put links,
   * buttons or form controls here.
   */
  description?: ReactNode;
  /** Small mono detail under the text ("3 members", "ORD-1048"). Same rule as `description`: no interactive content. */
  meta?: ReactNode;
  /** Icon or avatar before the text. Decorative: the title names the card. */
  leading?: ReactNode;
  /** Heading level of the title (`h1` to `h6`). Pick the level that fits the page outline. Default `3`. */
  headingLevel?: CardLinkHeadingLevel;
  /** Disables the card: it is dimmed, skipped by `Tab` and ignores presses. */
  isDisabled?: boolean;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

interface CardLinkAsLinkProps extends CardLinkBaseProps {
  /** Destination. Renders a real `<a>`; uses the router set on `DSProvider` for client-side navigation. */
  href: string;
  /** Link target. `_blank` adds `rel="noopener noreferrer"` and a hidden "opens in a new tab" note. */
  target?: string;
  /** Link relationship, merged with `noopener noreferrer` for `_blank`. */
  rel?: string;
  /** Fired when the link is pressed, before navigation. */
  onPress?: (event: PressEvent) => void;
}

interface CardLinkAsButtonProps extends CardLinkBaseProps {
  href?: undefined;
  target?: undefined;
  rel?: undefined;
  /** Action run when the card is pressed. Renders a real `<button type="button">`. */
  onPress: (event: PressEvent) => void;
}

/** Pass `href` (a link) or `onPress` (a button). */
export type CardLinkProps = CardLinkAsLinkProps | CardLinkAsButtonProps;

function externalRel(rel: string | undefined): string {
  const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  tokens.add('noopener');
  tokens.add('noreferrer');
  return [...tokens].join(' ');
}

/**
 * A card whose whole surface is one link or button. The title is the real interactive
 * element (an `<a>` with `href`, a `<button>` with `onPress`) inside a heading, and a
 * stretched `::after` makes the full card its hit area. The title is the accessible name; the
 * description and meta are the accessible description.
 *
 * Use it for navigation tiles (a settings category grid). A card that needs inner buttons is a
 * `Card` with a `Button` (ADR-0011).
 */
export function CardLink(props: CardLinkProps) {
  const {
    title,
    description,
    meta,
    leading,
    headingLevel = 3,
    isDisabled = false,
    className,
    href,
    target,
    rel,
    onPress,
    messages: overrides,
    ...rest
  } = props;
  const t = useMessages('CardLink', messages, overrides);
  const descriptionId = useId();
  const metaId = useId();
  const Heading = `h${String(headingLevel)}` as ElementType;
  const hasDescription = description !== undefined && description !== null && description !== '';
  const hasMeta = meta !== undefined && meta !== null && meta !== '';
  const describedBy =
    [hasDescription ? descriptionId : null, hasMeta ? metaId : null].filter(Boolean).join(' ') ||
    undefined;
  const opensNewTab = href !== undefined && target === '_blank';
  const label = (
    <>
      {title}
      {opensNewTab ? <VisuallyHidden> {t.opensInNewTab}</VisuallyHidden> : null}
    </>
  );
  return (
    <div
      {...rest}
      className={classNames(styles.root, className)}
      data-disabled={isDisabled || undefined}
    >
      {leading ? <span className={styles.leading}>{leading}</span> : null}
      <div className={styles.text}>
        <Heading className={styles.heading}>
          {href !== undefined ? (
            <AriaLink
              href={href}
              isDisabled={isDisabled}
              {...(onPress ? { onPress } : {})}
              {...(target === undefined ? {} : { target })}
              {...(opensNewTab ? { rel: externalRel(rel) } : rel === undefined ? {} : { rel })}
              {...(describedBy === undefined ? {} : { 'aria-describedby': describedBy })}
              className={classNames(styles.action)}
            >
              {label}
            </AriaLink>
          ) : (
            <AriaButton
              isDisabled={isDisabled}
              onPress={onPress}
              {...(describedBy === undefined ? {} : { 'aria-describedby': describedBy })}
              className={classNames(styles.action)}
            >
              {label}
            </AriaButton>
          )}
        </Heading>
        {hasDescription ? (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}
        {hasMeta ? (
          <p id={metaId} className={styles.meta}>
            {meta}
          </p>
        ) : null}
      </div>
    </div>
  );
}
