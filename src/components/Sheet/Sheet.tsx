import { useId } from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { XIcon } from '../Icon/icons';
import { ScrollBody } from '../Dialog/ScrollBody';
import { IconButton } from '../IconButton';
import { useRetainedWhileClosing } from '../Dialog/useRetainedWhileClosing';
import { messages } from './Sheet.messages';
import styles from './Sheet.module.css';

export type SheetSize = 'sm' | 'md' | 'lg';

export interface SheetRenderOptions {
  /** Closes the sheet. */
  close: () => void;
}

export interface SheetProps {
  /** Heading of the sheet and its accessible name. One line; it is truncated with an ellipsis. */
  title: ReactNode;
  /** Short mono text after the title, such as a record code ("ORD-1048"). */
  meta?: ReactNode;
  /** Extra header content after the meta, usually a `Badge` with the status. */
  headerExtra?: ReactNode;
  /** Optional description linked to the sheet with `aria-describedby`. */
  description?: ReactNode;
  /** Body of the sheet; it scrolls when it is taller than the viewport. A function receives `close`. */
  children?: ReactNode | ((options: SheetRenderOptions) => ReactNode);
  /**
   * Footer actions, aligned to the end: Cancel (secondary) then the primary action. A function
   * receives `close`. The footer stays at the bottom while the body scrolls.
   */
  footer?: ReactNode | ((options: SheetRenderOptions) => ReactNode);
  /** Footer content aligned to the start, for the destructive action ("Delete order"). */
  footerStart?: ReactNode | ((options: SheetRenderOptions) => ReactNode);
  /** Width: `sm` 440px (default), `md` 460px, `lg` 480px. Full width on small screens. */
  size?: SheetSize;
  /** Pads the body (24px, 18px between children). Turn off for a table or a full-bleed list. Default `true`. */
  padded?: boolean;
  /** The element that opens the sheet. Optional: omit it and control the sheet with `isOpen`. */
  trigger?: ReactElement;
  /** Controlled open state. Pair with `onOpenChange`. */
  isOpen?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the sheet opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether pressing the scrim closes the sheet. Default `true`. */
  isDismissable?: boolean;
  /** Disables closing with `Escape`. Use it only while a request is running. */
  isKeyboardDismissDisabled?: boolean;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
  /** Class name for the sheet panel. */
  className?: string;
  /** Ref to the sheet panel. */
  ref?: Ref<HTMLElement>;
}

function resolve(
  content: ReactNode | ((options: SheetRenderOptions) => ReactNode),
  options: SheetRenderOptions,
): ReactNode {
  return typeof content === 'function' ? content(options) : content;
}

/**
 * A side panel that slides in from the inline-end edge, for viewing or editing one record
 * without leaving the list. Built on React Aria `Modal` and `Dialog`: focus is trapped and
 * restored, the page is inert and does not scroll, and `Escape` closes only the top-most layer
 * (a `Dialog` opened from a sheet closes first).
 *
 * The header (title, mono meta, extra content, close button) is `--ds-topbar-h` tall; the body
 * scrolls; the footer stays at the bottom.
 */
export function Sheet({
  title,
  meta,
  headerExtra,
  description,
  children,
  footer,
  footerStart,
  size = 'sm',
  padded = true,
  trigger,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDismissable = true,
  isKeyboardDismissDisabled,
  messages: overrides,
  className,
  ref,
}: SheetProps) {
  const t = useMessages('Sheet', messages, overrides);
  return (
    <DialogTrigger
      {...(isOpen === undefined ? {} : { isOpen })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      {trigger}
      {/* RAC writes an inline z-index; the style prop is the only way to use the sheet layer. The panel is inside the overlay, so it stacks above the scrim. */}
      <ModalOverlay
        isDismissable={isDismissable}
        {...(isKeyboardDismissDisabled === undefined ? {} : { isKeyboardDismissDisabled })}
        className={classNames(styles.overlay)}
        style={{ zIndex: 'var(--ds-z-sheet)' }}
      >
        <SheetPanel
          title={title}
          meta={meta}
          headerExtra={headerExtra}
          description={description}
          footer={footer}
          footerStart={footerStart}
          size={size}
          padded={padded}
          closeLabel={t.close}
          className={className}
          panelRef={ref}
        >
          {children}
        </SheetPanel>
      </ModalOverlay>
    </DialogTrigger>
  );
}

/** Content props of `Sheet`, each one allowed to be `undefined` (a mapped type drops the `?`). */
type SheetContentProps = {
  [
    K in
      | 'title'
      | 'meta'
      | 'headerExtra'
      | 'description'
      | 'children'
      | 'footer'
      | 'footerStart'
      | 'className'
  ]: SheetProps[K];
};

interface SheetPanelProps extends SheetContentProps {
  size: SheetSize;
  padded: boolean;
  closeLabel: string;
  panelRef: Ref<HTMLElement> | undefined;
}

/**
 * The part of the sheet that lives inside the overlay. While the sheet animates out it renders
 * the props of its last open render, so clearing the state that feeds the content in the same
 * update that closes the sheet does not blank the panel (GAP-036).
 */
function SheetPanel(props: SheetPanelProps) {
  const {
    title,
    meta,
    headerExtra,
    description,
    children,
    footer,
    footerStart,
    size,
    padded,
    closeLabel,
    className,
    panelRef,
  } = useRetainedWhileClosing(props);
  const descriptionId = useId();
  return (
    <Modal className={classNames(styles.modal)} data-size={size}>
      <AriaDialog
        {...(panelRef ? { ref: panelRef } : {})}
        {...(description ? { 'aria-describedby': descriptionId } : {})}
        className={classNames(styles.sheet, className)}
      >
        {(options) => (
          <>
            <header className={classNames(styles.header)}>
              <Heading slot="title" level={2} className={classNames(styles.title)}>
                {title}
              </Heading>
              {meta ? <span className={classNames(styles.meta)}>{meta}</span> : null}
              {headerExtra}
              <IconButton
                className={classNames(styles.close)}
                variant="ghost"
                icon={XIcon}
                label={closeLabel}
                onPress={options.close}
              />
            </header>
            {description ? (
              <p id={descriptionId} className={classNames(styles.description)}>
                {description}
              </p>
            ) : null}
            <ScrollBody className={classNames(styles.body)} data-padded={padded || undefined}>
              {resolve(children, options)}
            </ScrollBody>
            {footer || footerStart ? (
              <footer className={classNames(styles.footer)}>
                <div className={classNames(styles.footerStart)}>
                  {resolve(footerStart, options)}
                </div>
                <div className={classNames(styles.footerEnd)}>{resolve(footer, options)}</div>
              </footer>
            ) : null}
          </>
        )}
      </AriaDialog>
    </Modal>
  );
}
