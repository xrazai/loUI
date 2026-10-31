import { cloneElement } from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';
import { Dialog, DialogTrigger, OverlayArrow, Popover as AriaPopover } from 'react-aria-components';
import type { PopoverProps as AriaPopoverProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import styles from './Popover.module.css';

export type PopoverPlacement = NonNullable<AriaPopoverProps['placement']>;

export interface PopoverProps {
  /**
   * The element that opens the popover: a `Button`, `IconButton` or any React Aria pressable.
   * It receives `aria-expanded` and `aria-haspopup="dialog"`.
   */
  trigger: ReactElement;
  /**
   * Accessible name of the popover (for example "Filters"). The popover is a `dialog`, so it
   * needs a name; a visible heading inside it can be linked with `aria-labelledby` instead.
   */
  label: string;
  /** Interactive content. A function receives `close` to dismiss the popover from inside. */
  children: ReactNode | ((options: { close: () => void }) => ReactNode);
  /** Side and alignment relative to the trigger. Default `bottom start`. Flips on collision. */
  placement?: PopoverPlacement;
  /** Draws an arrow that points at the trigger. */
  showArrow?: boolean;
  /**
   * Keeps the page outside the popover available to assistive technology and does not hide it.
   * Leave it off unless the popover is a long-lived tool the user returns to; React Aria's
   * guidance is that most popovers should stay modal for screen readers.
   */
  isNonModal?: boolean;
  /** Controlled open state. Pair with `onOpenChange`. */
  isOpen?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the popover opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Class name for the popover surface. */
  className?: string;
  /** Ref to the popover surface. */
  ref?: Ref<HTMLElement>;
}

/**
 * A floating surface for interactive content (filters, a small form, a color picker), built on
 * React Aria `DialogTrigger`, `Popover` and `Dialog`.
 *
 * It is not for lists of commands (use `Menu`), for choosing one option (use `Select`) or for
 * plain hints (use `Tooltip`). `Escape` and an outside press close it and focus returns to the
 * trigger; when the content has focusable elements, `Tab` stays inside until it is closed.
 */
export function Popover({
  trigger,
  label,
  children,
  placement = 'bottom start',
  showArrow = false,
  isNonModal = false,
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  ref,
}: PopoverProps) {
  return (
    <DialogTrigger
      {...(isOpen === undefined ? {} : { isOpen })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      {cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        'aria-haspopup': 'dialog',
      })}
      {/* RAC writes an inline z-index; the style prop is the only way to use the popover layer. */}
      <AriaPopover
        {...(ref ? { ref } : {})}
        placement={placement}
        offset={0}
        isNonModal={isNonModal}
        data-arrow={showArrow || undefined}
        className={classNames(styles.root, className)}
        style={{ zIndex: 'var(--ds-z-popover)' }}
      >
        {showArrow ? (
          <OverlayArrow className={classNames(styles.arrow)}>
            <svg viewBox="0 0 8 4" aria-hidden="true" focusable="false">
              <path d="M0 0 L4 4 L8 0" />
            </svg>
          </OverlayArrow>
        ) : null}
        <Dialog aria-label={label} className={classNames(styles.dialog)}>
          {children}
        </Dialog>
      </AriaPopover>
    </DialogTrigger>
  );
}
