import { useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { CopyIcon, RefreshIcon, ThumbsDownIcon, ThumbsUpIcon } from '../../components/Icon/icons';
import { Toggle } from '../../components/Toggle';
import { VisuallyHidden } from '../../components/VisuallyHidden';
import { useControllableState } from '../../hooks/useControllableState';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { messages } from './ResponseFeedback.messages';
import styles from './ResponseFeedback.module.css';

export type ResponseRating = 'positive' | 'negative';

export interface ResponseFeedbackProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'role' | 'aria-label'
> {
  /** Controlled rating. `null` means no rating. */
  value?: ResponseRating | null;
  /** Initial rating when uncontrolled. */
  defaultValue?: ResponseRating | null;
  /** Called with the new rating, or `null` when the person takes their rating back. */
  onChange?: (value: ResponseRating | null) => void;
  /** Called when Copy is pressed. Without it there is no Copy button. Confirm with a toast ("Copied"). */
  onCopy?: () => void;
  /** Called when Regenerate is pressed. Without it there is no Regenerate button. */
  onRegenerate?: () => void;
  /** Disables Regenerate while a new response is being generated. */
  isRegenerating?: boolean;
  /** Disables every button. */
  isDisabled?: boolean;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

/**
 * Feedback and follow-up actions under an assistant response: two toggle buttons (good and bad
 * response, `aria-pressed`), then optional Copy and Regenerate.
 *
 * Choosing a rating is reversible, so nothing asks to confirm: pressing the active rating again
 * removes it. A polite live region says "Feedback sent" or "Feedback removed" after the change.
 * The first render never announces anything. The buttons show text only for now: thumbs, copy
 * and refresh icons are not part of the curated icon set yet.
 */
export function ResponseFeedback({
  value,
  defaultValue = null,
  onChange,
  onCopy,
  onRegenerate,
  isRegenerating = false,
  isDisabled = false,
  messages: overrides,
  className,
  ...rest
}: ResponseFeedbackProps) {
  const t = useMessages('ResponseFeedback', messages, overrides);
  const [rating, setRating] = useControllableState<ResponseRating | null>({
    value,
    defaultValue,
    onChange,
  });
  const [announcement, setAnnouncement] = useState('');

  function choose(next: ResponseRating, selected: boolean) {
    const nextRating = selected ? next : null;
    setRating(nextRating);
    setAnnouncement(nextRating === null ? t.removed : t.sent);
  }

  return (
    <div {...rest} className={classNames(styles.root, className)}>
      <div role="group" aria-label={t.groupLabel} className={styles.group}>
        <Toggle
          size="sm"
          variant="ghost"
          isDisabled={isDisabled}
          isSelected={rating === 'positive'}
          leading={<Icon icon={ThumbsUpIcon} size="sm" />}
          onChange={(selected) => {
            choose('positive', selected);
          }}
        >
          {t.positive}
        </Toggle>
        <Toggle
          size="sm"
          variant="ghost"
          isDisabled={isDisabled}
          isSelected={rating === 'negative'}
          leading={<Icon icon={ThumbsDownIcon} size="sm" />}
          onChange={(selected) => {
            choose('negative', selected);
          }}
        >
          {t.negative}
        </Toggle>
      </div>
      {onCopy ? (
        <Button
          size="sm"
          variant="ghost"
          isDisabled={isDisabled}
          onPress={onCopy}
          leading={<Icon icon={CopyIcon} size="sm" />}
        >
          {t.copy}
        </Button>
      ) : null}
      {onRegenerate ? (
        <Button
          size="sm"
          variant="ghost"
          isDisabled={isDisabled || isRegenerating}
          onPress={onRegenerate}
          leading={<Icon icon={RefreshIcon} size="sm" />}
        >
          {t.regenerate}
        </Button>
      ) : null}
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
