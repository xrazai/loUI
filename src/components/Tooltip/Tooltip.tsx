import type { ReactElement, ReactNode, Ref } from 'react';
import { Tooltip as AriaTooltip, TooltipTrigger } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import styles from './Tooltip.module.css';

export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';

/** Default time in milliseconds the pointer must rest on the trigger before the tooltip opens. */
export const TOOLTIP_DELAY = 500;

export interface TooltipProps {
  /**
   * The element the tooltip describes. It must be focusable and built on React Aria, such as
   * `Button`, `IconButton` or `Link`, so the tooltip opens on keyboard focus as well as hover.
   */
  children: ReactElement;
  /**
   * Short text, a few words. It is linked to the trigger with `aria-describedby`, so it must
   * add detail only: never put the only copy of essential information in a tooltip, because
   * touch users cannot hover and the text is not shown until the trigger is focused.
   */
  content: ReactNode;
  /** Keyboard shortcut shown after the text in mono type ("⌘K"). Pair it with `aria-keyshortcuts` on the trigger. */
  shortcut?: string;
  /** Side of the trigger, `top` by default. `start` and `end` follow the writing direction. */
  placement?: TooltipPlacement;
  /** Milliseconds before opening on hover. Default 500. Focus opens it immediately. */
  delay?: number;
  /** Milliseconds before closing after the pointer leaves. Default 0. */
  closeDelay?: number;
  /** Never opens when `true`, for example while the trigger is disabled. */
  isDisabled?: boolean;
  /** Controlled open state. Pair with `onOpenChange`. */
  isOpen?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the tooltip opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Class name for the tooltip bubble. */
  className?: string;
  /** Ref to the tooltip bubble. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * An ink-style hint for a control, built on React Aria `TooltipTrigger` and `Tooltip`.
 *
 * It opens on hover (after a delay) and on keyboard focus, closes with `Escape` (WCAG 1.4.13),
 * stays open while the pointer is over it, and describes the trigger through `aria-describedby`.
 * A tooltip is a supplement: the trigger must already have its own accessible name.
 */
export function Tooltip({
  children,
  content,
  shortcut,
  placement = 'top',
  delay = TOOLTIP_DELAY,
  closeDelay = 0,
  isDisabled,
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  ref,
}: TooltipProps) {
  return (
    <TooltipTrigger
      delay={delay}
      closeDelay={closeDelay}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isOpen === undefined ? {} : { isOpen })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      {children}
      {/* RAC writes an inline z-index; the style prop is the only way to use the tooltip layer. */}
      <AriaTooltip
        {...(ref ? { ref } : {})}
        placement={placement}
        offset={0}
        className={classNames(styles.root, className)}
        style={{ zIndex: 'var(--ds-z-tooltip)' }}
      >
        <span className={classNames(styles.content)}>{content}</span>
        {shortcut ? <span className={classNames(styles.shortcut)}>{shortcut}</span> : null}
      </AriaTooltip>
    </TooltipTrigger>
  );
}
