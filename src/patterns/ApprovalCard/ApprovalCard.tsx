import { useId } from 'react';
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { TriangleAlertIcon } from '../../components/Icon/icons';
import { Rating } from '../../components/Rating';
import { Swatch } from '../../components/Swatch';
import { Textarea } from '../../components/Textarea';
import { VisuallyHidden } from '../../components/VisuallyHidden';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { messages } from './ApprovalCard.messages';
import styles from './ApprovalCard.module.css';

export type ApprovalCardKind = 'question' | 'review';

export interface ApprovalCardProps extends Omit<
  ComponentPropsWithRef<'article'>,
  'children' | 'title' | 'aria-label' | 'aria-labelledby'
> {
  /** What is being answered: a `question` or a `review`. Shown as a text badge. Default `question`. */
  kind?: ApprovalCardKind;
  /** Who wrote it (a username or code). Shown in mono and part of the card's accessible name. */
  author?: string | undefined;
  /** Reference to the item the message is about (a product or order name). */
  itemName?: string | undefined;
  /** Hex color (`#rgb` or `#rrggbb`) shown as a dot before `itemName`. Decorative: `itemName` must name it. */
  itemColor?: string | undefined;
  /** When it was written, as display text ("today, 10:40"). */
  when?: ReactNode | undefined;
  /** Machine-readable date for `when` (an ISO string). Renders a `<time>`. */
  whenDateTime?: string;
  /** Star rating of a `review` (0 to 5, halves allowed). Shown only for reviews. */
  rating?: number;
  /** The original message the draft answers. Plain text or nodes. */
  message: ReactNode;
  /** Controlled value of the draft reply. */
  draft?: string | undefined;
  /** Initial value of the draft when uncontrolled. */
  defaultDraft?: string | undefined;
  /** Called with the new text whenever the draft is edited. */
  onDraftChange?: (draft: string) => void;
  /**
   * Warning shown above the actions (for example "2-star review: read it carefully before
   * sending"). Linked to the card as its description. Reviews of 1 to 3 stars should always have one.
   */
  flag?: ReactNode;
  /** Called when the send button is pressed. Do it now and offer Undo with a toast; do not ask to confirm. */
  onSend?: () => void;
  /** Called when the discard button is pressed. Do it now and offer Undo with a toast. */
  onDiscard?: () => void;
  /** Heading level of the card heading (`h1` to `h6`). Default `3`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

/**
 * A reply waiting for approval: the original message, an editable draft written by an agent
 * and two actions, send and discard.
 *
 * It is an `article` named by its heading ("Review buyer_sp"). Send and discard are secondary
 * and ghost buttons on purpose: a screen has many of these cards and only one primary action.
 * They act immediately; the consumer shows an Undo toast instead of asking for confirmation.
 */
export function ApprovalCard({
  kind = 'question',
  author,
  itemName,
  itemColor,
  when,
  whenDateTime,
  rating,
  message,
  draft,
  defaultDraft,
  onDraftChange,
  flag,
  onSend,
  onDiscard,
  headingLevel = 3,
  messages: overrides,
  className,
  ...rest
}: ApprovalCardProps) {
  const t = useMessages('ApprovalCard', messages, overrides);
  const headingId = useId();
  const flagId = useId();
  const Heading = `h${String(headingLevel)}` as ElementType;
  const isReview = kind === 'review';
  const hasFlag = flag !== undefined && flag !== null && flag !== false && flag !== '';
  const kindLabel = isReview ? t.kindReview : t.kindQuestion;
  const describedBy = [hasFlag ? flagId : undefined, rest['aria-describedby']]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      {...rest}
      aria-labelledby={headingId}
      {...(describedBy ? { 'aria-describedby': describedBy } : {})}
      className={classNames(styles.root, className)}
      data-kind={kind}
    >
      <header className={styles.header}>
        <Heading id={headingId} className={styles.heading}>
          <Badge tone={isReview ? 'neutral' : 'accent'} dot={false}>
            {kindLabel}
          </Badge>
          {author ? (
            <>
              {' '}
              <span className={styles.author}>{author}</span>
            </>
          ) : null}
        </Heading>
        {isReview && rating !== undefined ? <Rating value={rating} /> : null}
        {itemName ? (
          <span className={styles.item}>
            {itemColor ? <Swatch color={itemColor} size="sm" decorative /> : null}
            <span className={styles.itemName}>{itemName}</span>
          </span>
        ) : null}
        {when ? (
          <span className={styles.when}>
            {whenDateTime ? <time dateTime={whenDateTime}>{when}</time> : when}
          </span>
        ) : null}
      </header>
      <div className={styles.body}>
        <div className={styles.message}>
          <VisuallyHidden>{t.messageLabel}: </VisuallyHidden>
          {message}
        </div>
        <Textarea
          label={t.draftLabel}
          aside={t.draftHint}
          {...(draft === undefined ? {} : { value: draft })}
          {...(defaultDraft === undefined ? {} : { defaultValue: defaultDraft })}
          {...(onDraftChange ? { onChange: onDraftChange } : {})}
        />
        {hasFlag ? (
          <p id={flagId} className={styles.flag}>
            <Icon icon={TriangleAlertIcon} size="sm" />
            <span>{flag}</span>
          </p>
        ) : null}
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="ghost"
            aria-describedby={headingId}
            {...(onDiscard ? { onPress: onDiscard } : {})}
          >
            {t.discard}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={classNames(styles.send)}
            aria-describedby={headingId}
            {...(onSend ? { onPress: onSend } : {})}
          >
            {t.send}
          </Button>
        </div>
      </div>
    </article>
  );
}
