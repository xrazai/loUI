import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { XIcon } from '../Icon/icons';
import { IconButton } from '../IconButton';
import { messages } from './Drawer.messages';
import styles from './Drawer.module.css';

export type DrawerPlacement = 'start' | 'end';
export type DrawerSize = 'sm' | 'md' | 'lg';
export type DrawerRole = 'complementary' | 'region';

export interface DrawerRenderOptions {
  /** Closes the drawer and returns focus to the trigger. */
  close: () => void;
}

export interface DrawerProps {
  /** Heading of the drawer and its accessible name. */
  title: ReactNode;
  /** Body of the drawer; it scrolls when it is taller than the drawer. A function receives `close`. */
  children?: ReactNode | ((options: DrawerRenderOptions) => ReactNode);
  /** Footer actions, aligned to the end. A function receives `close`. */
  footer?: ReactNode | ((options: DrawerRenderOptions) => ReactNode);
  /** Edge the drawer sits against: `end` (default) or `start`. Both follow the writing direction. */
  placement?: DrawerPlacement;
  /** Width: `sm` 280px, `md` 320px (default), `lg` 400px. It never exceeds its container. */
  size?: DrawerSize;
  /** Pads the body. Turn it off for a table or a full-bleed list. Default `true`. */
  padded?: boolean;
  /** Controlled open state. Pair with `onOpenChange`. */
  isOpen?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the drawer opens or closes through the user (close button or `Escape`). */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Moves focus into the drawer when it opens after the first render. A drawer that is open on
   * first render never takes focus. Default `true`; turn it off for a panel that should stay
   * beside the page without interrupting what the user is doing.
   */
  autoFocus?: boolean;
  /**
   * Landmark role. `complementary` (default) for content that supports the page (filters,
   * inspectors); `region` for a section the user may want to find in the landmark list.
   */
  role?: DrawerRole;
  /** Level of the title heading. Default `2`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
  /** Class name for the drawer panel. */
  className?: string;
  /** Ref to the drawer panel. */
  ref?: Ref<HTMLElement>;
}

function resolve(
  content: ReactNode | ((options: DrawerRenderOptions) => ReactNode),
  options: DrawerRenderOptions,
): ReactNode {
  return typeof content === 'function' ? content(options) : content;
}

/**
 * A non-modal side panel for filters, inspectors and secondary navigation. It sits next to the
 * content in the page flow: there is no scrim, the page stays interactive, focus is not trapped
 * and the page is not made inert. Place it as a sibling of the main content inside a flex or grid
 * container; it renders nothing while closed.
 *
 * Use `Sheet` instead when the panel is a task that must be finished or dismissed first
 * (editing one record): that one is modal.
 *
 * `Escape` closes the drawer while focus is inside it and returns focus to the trigger.
 */
export function Drawer({
  title,
  children,
  footer,
  placement = 'end',
  size = 'md',
  padded = true,
  isOpen: isOpenProp,
  defaultOpen = false,
  onOpenChange,
  autoFocus = true,
  role = 'complementary',
  headingLevel = 2,
  messages: overrides,
  className,
  ref,
}: DrawerProps) {
  const t = useMessages('Drawer', messages, overrides);
  const titleId = useId();
  const [isOpen, setOpen] = useControllableState({
    value: isOpenProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const panel = useRef<HTMLElement | null>(null);
  const setPanel = (node: HTMLElement | null) => {
    panel.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const [opener, setOpener] = useState<Element | null>(null);
  const wasOpen = useRef(isOpen);

  // On a later open, remember what had focus (the effect runs before focus moves) and move
  // focus in. The first render never takes focus.
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setOpener(document.activeElement);
      if (autoFocus) panel.current?.focus({ preventScroll: true });
    }
    wasOpen.current = isOpen;
  }, [isOpen, autoFocus]);

  const close = () => {
    if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    setOpen(false);
  };

  // Native listener: the panel is a landmark, not an interactive element, and it only listens
  // for keys that bubble up from the controls inside it.
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.stopPropagation();
      close();
    }
  });
  useEffect(() => {
    const node = panel.current;
    if (!isOpen || !node) return undefined;
    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const options: DrawerRenderOptions = { close };
  const Heading = `h${headingLevel}` as const;
  return (
    <aside
      ref={setPanel}
      role={role}
      aria-labelledby={titleId}
      tabIndex={-1}
      data-placement={placement}
      data-size={size}
      className={classNames(styles.drawer, className)}
    >
      <header className={classNames(styles.header)}>
        <Heading id={titleId} className={classNames(styles.title)}>
          {title}
        </Heading>
        <IconButton
          className={classNames(styles.close)}
          variant="ghost"
          icon={XIcon}
          label={t.close}
          onPress={close}
        />
      </header>
      <div className={classNames(styles.body)} data-padded={padded || undefined}>
        {resolve(children, options)}
      </div>
      {footer ? (
        <footer className={classNames(styles.footer)}>{resolve(footer, options)}</footer>
      ) : null}
    </aside>
  );
}
