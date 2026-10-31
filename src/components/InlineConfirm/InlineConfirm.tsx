import { useEffect, useId, useRef, useState } from 'react';
import type { Ref } from 'react';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { Button } from '../Button';
import type { ButtonProps, ButtonSize } from '../Button';
import { messages } from './InlineConfirm.messages';
import styles from './InlineConfirm.module.css';

export interface InlineConfirmProps {
  /** Label of the trigger button: verb plus object ("Delete order"). */
  label: string;
  /**
   * The question, ideally with the consequence ("Remove this line? This can't be undone.").
   * Default from messages: "Are you sure?".
   */
  prompt?: string | undefined;
  /** Label of the confirming button. Defaults to `label`, which already names the action. */
  confirmLabel?: string;
  /** Called when the user confirms. The prompt closes afterwards. */
  onConfirm: () => void;
  /** `danger` (default): destructive styling. `neutral`: secondary trigger, primary confirm. */
  tone?: 'danger' | 'neutral';
  /**
   * Which button gets the focus when the prompt opens. `cancel` (default) is the safe choice
   * and the product principle for destructive actions.
   */
  initialFocus?: 'cancel' | 'confirm';
  /** Button size, `md` by default. */
  size?: ButtonSize;
  /** Controlled state: whether the prompt is showing. Pair with `onOpenChange`. */
  isOpen?: boolean;
  /** Initial state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the prompt opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Disables the trigger. */
  isDisabled?: boolean;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
  className?: string;
  /** Ref to the root element. */
  ref?: Ref<HTMLSpanElement>;
}

/**
 * A two-step confirmation without a dialog: the trigger button turns into a question with
 * Cancel and a confirm button, in place. For a destructive action in a dense row or toolbar
 * where a `ConfirmDialog` would be heavy.
 *
 * Focus moves to **Cancel** when the prompt opens (configurable), so Enter right after the
 * click cannot confirm. `Escape` cancels, but only while focus is inside the prompt (it is not a
 * window listener, so it does not close a surrounding `Dialog` first). When the prompt closes,
 * focus returns to the trigger.
 */
export function InlineConfirm({
  label,
  prompt,
  confirmLabel,
  onConfirm,
  tone = 'danger',
  initialFocus = 'cancel',
  size = 'md',
  isOpen,
  defaultOpen = false,
  onOpenChange,
  isDisabled,
  messages: overrides,
  className,
  ref,
}: InlineConfirmProps) {
  const t = useMessages('InlineConfirm', messages, overrides);
  const promptId = useId();
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const asking = isOpen ?? innerOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  const setAsking = (next: boolean) => {
    if (isOpen === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const close = () => {
    restoreFocus.current = true;
    setAsking(false);
  };

  // The trigger is mounted again when the prompt closes; put focus back on it.
  useEffect(() => {
    if (!asking && restoreFocus.current) {
      restoreFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [asking]);

  // On the buttons, not on the group: React Aria stops propagation of the keys it handles, so
  // Escape cancels the prompt without reaching an enclosing Dialog or Sheet. Other keys continue.
  const onKeyDown: NonNullable<ButtonProps['onKeyDown']> = (event) => {
    if (event.key === 'Escape') {
      close();
    } else {
      event.continuePropagation();
    }
  };

  if (!asking) {
    return (
      <span {...(ref ? { ref } : {})} className={classNames(styles.root, className)}>
        <Button
          ref={triggerRef}
          size={size}
          variant={tone === 'danger' ? 'danger' : 'secondary'}
          {...(isDisabled === undefined ? {} : { isDisabled })}
          onPress={() => {
            setAsking(true);
          }}
        >
          {label}
        </Button>
      </span>
    );
  }

  return (
    <span
      {...(ref ? { ref } : {})}
      role="group"
      aria-labelledby={promptId}
      className={classNames(styles.root, className)}
    >
      <span id={promptId} className={classNames(styles.prompt)}>
        {prompt ?? t.prompt}
      </span>
      <Button
        size={size}
        variant="ghost"
        autoFocus={initialFocus === 'cancel'}
        onKeyDown={onKeyDown}
        onPress={close}
      >
        {t.cancel}
      </Button>
      <Button
        size={size}
        variant={tone === 'danger' ? 'danger-solid' : 'primary'}
        autoFocus={initialFocus === 'confirm'}
        onKeyDown={onKeyDown}
        onPress={() => {
          onConfirm();
          close();
        }}
      >
        {confirmLabel ?? label}
      </Button>
    </span>
  );
}
