import { useId } from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { ScrollBody } from './ScrollBody';
import { useRetainedWhileClosing } from './useRetainedWhileClosing';
import styles from './Dialog.module.css';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogRenderOptions {
  /** Closes the dialog. */
  close: () => void;
}

export interface DialogProps {
  /**
   * Heading of the dialog and its accessible name. A question for a confirmation ("Delete
   * order #1048?"), otherwise a noun phrase or a verb plus object ("Edit customer").
   */
  title: ReactNode;
  /**
   * One or two sentences under the title. It is linked to the dialog with `aria-describedby`,
   * so screen readers read it right after the title.
   */
  description?: ReactNode;
  /** Body of the dialog. A function receives `close`. */
  children?: ReactNode | ((options: DialogRenderOptions) => ReactNode);
  /**
   * Actions, aligned to the end of the footer. Cancel (secondary) before the confirming action;
   * one primary action at most. A function receives `close`.
   */
  footer?: ReactNode | ((options: DialogRenderOptions) => ReactNode);
  /** Maximum width: `sm` 420px (default), `md` 540px, `lg` 680px. Narrower on small screens. */
  size?: DialogSize;
  /**
   * `dialog` (default), or `alertdialog` for a message that needs an answer before the user
   * continues, such as a destructive confirmation. `ConfirmDialog` uses `alertdialog`.
   */
  role?: 'dialog' | 'alertdialog';
  /**
   * The element that opens the dialog (a `Button`). Optional: omit it and control the dialog
   * with `isOpen`. Focus returns to the element that was focused when the dialog opened.
   */
  trigger?: ReactElement;
  /** Controlled open state. Pair with `onOpenChange`. */
  isOpen?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the dialog opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether pressing the overlay closes the dialog. Default `true`; `ConfirmDialog` sets `false`. */
  isDismissable?: boolean;
  /** Disables closing with `Escape`. Use it only while a request is running. */
  isKeyboardDismissDisabled?: boolean;
  /** Class name for the dialog panel. */
  className?: string;
  /** Ref to the dialog panel. */
  ref?: Ref<HTMLElement>;
}

function resolve(
  content: ReactNode | ((options: DialogRenderOptions) => ReactNode),
  options: DialogRenderOptions,
): ReactNode {
  return typeof content === 'function' ? content(options) : content;
}

/**
 * A modal dialog built on React Aria `DialogTrigger`, `ModalOverlay`, `Modal` and `Dialog`.
 *
 * React Aria traps focus, restores it to the trigger on close, locks page scroll, hides the
 * rest of the page from assistive technology and closes only the top-most layer on `Escape`
 * (a Dialog opened from a Sheet closes first). Initial focus goes to the dialog itself unless
 * a child has `autoFocus`; for destructive confirmations use `ConfirmDialog`, which focuses
 * Cancel.
 */
export function Dialog({
  title,
  description,
  children,
  footer,
  size = 'sm',
  role = 'dialog',
  trigger,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDismissable = true,
  isKeyboardDismissDisabled,
  className,
  ref,
}: DialogProps) {
  return (
    <DialogTrigger
      {...(isOpen === undefined ? {} : { isOpen })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      {trigger}
      {/* RAC writes an inline z-index; the style prop is the only way to use the dialog layer. */}
      <ModalOverlay
        isDismissable={isDismissable}
        {...(isKeyboardDismissDisabled === undefined ? {} : { isKeyboardDismissDisabled })}
        className={classNames(styles.overlay)}
        style={{ zIndex: 'var(--ds-z-dialog)' }}
      >
        <DialogPanel
          title={title}
          description={description}
          footer={footer}
          size={size}
          role={role}
          className={className}
          panelRef={ref}
        >
          {children}
        </DialogPanel>
      </ModalOverlay>
    </DialogTrigger>
  );
}

/** Content props of `Dialog`, each one allowed to be `undefined` (a mapped type drops the `?`). */
type DialogContentProps = {
  [K in 'title' | 'description' | 'children' | 'footer' | 'className']: DialogProps[K];
};

interface DialogPanelProps extends DialogContentProps {
  size: DialogSize;
  role: 'dialog' | 'alertdialog';
  panelRef: Ref<HTMLElement> | undefined;
}

/**
 * The part of the dialog that lives inside the overlay. While the dialog animates out it renders
 * the props of its last open render, so clearing the state that feeds the content in the same
 * update that closes the dialog does not blank the panel (GAP-036).
 */
function DialogPanel(props: DialogPanelProps) {
  const { title, description, children, footer, size, role, className, panelRef } =
    useRetainedWhileClosing(props);
  const descriptionId = useId();
  return (
    <Modal className={classNames(styles.modal)} data-size={size}>
      <AriaDialog
        {...(panelRef ? { ref: panelRef } : {})}
        role={role}
        {...(description ? { 'aria-describedby': descriptionId } : {})}
        className={classNames(styles.dialog, className)}
      >
        {(options) => (
          <>
            <header className={classNames(styles.header)}>
              <Heading slot="title" level={2} className={classNames(styles.title)}>
                {title}
              </Heading>
              {description ? (
                <p id={descriptionId} className={classNames(styles.description)}>
                  {description}
                </p>
              ) : null}
            </header>
            {children ? (
              <ScrollBody className={classNames(styles.body)}>
                {resolve(children, options)}
              </ScrollBody>
            ) : null}
            {footer ? (
              <footer
                className={classNames(styles.footer)}
                data-divided={children ? '' : undefined}
              >
                {resolve(footer, options)}
              </footer>
            ) : null}
          </>
        )}
      </AriaDialog>
    </Modal>
  );
}
