import type { ReactNode } from 'react';
import { useMessages } from '../../i18n';
import { Button } from '../Button';
import { Dialog } from './Dialog';
import type { DialogProps } from './Dialog';
import { messages } from './Dialog.messages';

export interface ConfirmDialogProps extends Omit<
  DialogProps,
  'footer' | 'role' | 'description' | 'children'
> {
  /**
   * The question, naming the object: "Delete order #1048?". Not "Are you sure?" and not
   * "Confirm".
   */
  title: ReactNode;
  /**
   * The consequence, in one sentence: "The order and its 14 lines will be removed. This can't
   * be undone." Required, because a confirmation without a consequence is only a speed bump.
   */
  description: ReactNode;
  /** Optional extra content between the description and the buttons (for example a list of affected items). */
  children?: ReactNode;
  /**
   * Label of the confirming button. Names the action, verb plus object: "Delete order". Never
   * "OK", "Yes" or "Confirm".
   */
  confirmLabel: string;
  /** Called when the user confirms. The dialog closes afterwards unless `closeOnConfirm` is `false`. */
  onConfirm: () => void;
  /** `danger` (default): red `danger-solid` button for a destructive action. `neutral`: the `primary` button. */
  tone?: 'danger' | 'neutral';
  /**
   * Which button gets the initial focus. `cancel` (default) is the safe choice and the
   * product principle for destructive actions; `confirm` is for non-destructive confirmations.
   */
  initialFocus?: 'cancel' | 'confirm';
  /** Keep the dialog open after `onConfirm`, for example while an async request runs. Default `true` closes it. */
  closeOnConfirm?: boolean;
  /** Shows a spinner on the confirm button and ignores presses while a request runs. */
  isPending?: boolean;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

/**
 * A destructive-action confirmation: an `alertdialog` with the question as the title, the
 * consequence in one sentence, a Cancel button and a confirm button that names the action.
 *
 * Initial focus is on **Cancel**, so pressing Enter or Space right after the dialog opens never
 * confirms. Outside presses do not dismiss it (`Escape` and Cancel do), because the user has to
 * answer. Follow a confirmed delete with a `Toast` that offers Undo when the data can come back.
 */
export function ConfirmDialog({
  title,
  description,
  children,
  confirmLabel,
  onConfirm,
  tone = 'danger',
  initialFocus = 'cancel',
  closeOnConfirm = true,
  isPending = false,
  messages: overrides,
  isDismissable = false,
  ...rest
}: ConfirmDialogProps) {
  const t = useMessages('Dialog', messages, overrides);
  return (
    <Dialog
      {...rest}
      role="alertdialog"
      title={title}
      description={description}
      isDismissable={isDismissable}
      footer={({ close }) => (
        <>
          <Button autoFocus={initialFocus === 'cancel'} onPress={close}>
            {t.cancel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger-solid' : 'primary'}
            autoFocus={initialFocus === 'confirm'}
            isPending={isPending}
            onPress={() => {
              onConfirm();
              if (closeOnConfirm) close();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      )}
    >
      {children}
    </Dialog>
  );
}
