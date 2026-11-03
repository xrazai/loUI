import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Button as AriaButton, Link as AriaLink } from 'react-aria-components';
import type { PressEvent } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { Icon, PlusIcon } from '../Icon';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './AddCard.messages';
import styles from './AddCard.module.css';

interface AddCardBaseProps {
  /** Label: a short verb plus object in sentence case ("Create agent"). It is the accessible name. */
  children: ReactNode;
  /** Disables the tile: it is dimmed, skipped by `Tab` and ignores presses. */
  isDisabled?: boolean;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
  className?: string;
}

interface AddCardAsLinkProps extends AddCardBaseProps {
  /** Destination of the create flow. Renders a real `<a>`. */
  href: string;
  /** Link target. `_blank` adds `rel="noopener noreferrer"` and a hidden "opens in a new tab" note. */
  target?: string;
  /** Link relationship, merged with `noopener noreferrer` for `_blank`. */
  rel?: string;
  /** Fired when the link is pressed, before navigation. */
  onPress?: (event: PressEvent) => void;
  /** Ref to the underlying `<a>` element. */
  ref?: ComponentPropsWithRef<'a'>['ref'];
}

interface AddCardAsButtonProps extends AddCardBaseProps {
  href?: undefined;
  target?: undefined;
  rel?: undefined;
  /** Action run when the tile is pressed (usually opens a dialog). Renders a real `<button type="button">`. */
  onPress: (event: PressEvent) => void;
  /** Ref to the underlying `<button>` element. */
  ref?: ComponentPropsWithRef<'button'>['ref'];
}

/** Pass `href` (a link) or `onPress` (a button). */
export type AddCardProps = AddCardAsLinkProps | AddCardAsButtonProps;

function externalRel(rel: string | undefined): string {
  const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  tokens.add('noopener');
  tokens.add('noreferrer');
  return [...tokens].join(' ');
}

/**
 * A dashed "create new" tile that sits in a grid next to cards. The whole tile is one link
 * (`href`) or button (`onPress`) with a centred plus icon and a verb-plus-object label. It
 * stretches to the height of its row.
 */
export function AddCard(props: AddCardProps) {
  const { children, isDisabled = false, className, messages: overrides } = props;
  const t = useMessages('AddCard', messages, overrides);
  const content = (
    <>
      <Icon icon={PlusIcon} size="md" />
      <span className={styles.label}>{children}</span>
    </>
  );
  if (props.href !== undefined) {
    const { href, target, rel, onPress, ref } = props;
    const opensNewTab = target === '_blank';
    return (
      <AriaLink
        ref={ref}
        href={href}
        isDisabled={isDisabled}
        {...(onPress ? { onPress } : {})}
        {...(target === undefined ? {} : { target })}
        {...(opensNewTab ? { rel: externalRel(rel) } : rel === undefined ? {} : { rel })}
        className={classNames(styles.root, className)}
      >
        {content}
        {opensNewTab ? <VisuallyHidden> {t.opensInNewTab}</VisuallyHidden> : null}
      </AriaLink>
    );
  }
  const { onPress: buttonPress, ref: buttonRef } = props;
  return (
    <AriaButton
      ref={buttonRef}
      isDisabled={isDisabled}
      onPress={buttonPress}
      className={classNames(styles.root, className)}
    >
      {content}
    </AriaButton>
  );
}
