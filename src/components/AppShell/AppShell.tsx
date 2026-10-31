import {
  createContext,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { IconButton } from '../IconButton';
import { MenuIcon, XIcon } from '../Icon';
import { useScrollable } from '../ScrollArea/useScrollable';
import { SkipLink } from '../SkipLink';
import { messages } from './AppShell.messages';
import styles from './AppShell.module.css';

interface AppShellContextValue {
  isNavOpen: boolean;
  setNavOpen: (open: boolean) => void;
  navId: string;
  messages: typeof messages.en;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

/** Fallback when the breakpoint token cannot be read (it always can in a browser with the tokens loaded). */
const FALLBACK_BREAKPOINT = 768;

/**
 * Whether the shell is narrower than `--ds-breakpoint-md`. CSS decides the layout (a container
 * query); this only tells behavior (inert content, Escape, focus) the same thing.
 */
function useIsNarrow(ref: { current: HTMLElement | null }): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => {
      const raw = Number.parseFloat(
        getComputedStyle(element).getPropertyValue('--ds-breakpoint-md'),
      );
      const breakpoint = Number.isFinite(raw) ? raw : FALLBACK_BREAKPOINT;
      setNarrow(element.clientWidth < breakpoint);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref]);
  return narrow;
}

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export interface AppShellProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The app sidebar: a `Sidebar` element. Below the md breakpoint it becomes an off-canvas panel. */
  sidebar?: ReactNode;
  /**
   * The page header: a `TopBar` element. Put an `AppShellNavToggle` in its `children` so narrow
   * screens can open the sidebar.
   */
  topBar?: ReactNode;
  /** The page content. It is rendered inside the one `main` landmark. */
  children?: ReactNode;
  /**
   * Optional detail pane at the inline end, `--ds-app-shell-detail-w` (360px) wide, for the
   * record selected in the main content. It is an `aside` landmark with its own scroll. Below
   * the md breakpoint it moves under the main content.
   */
  detail?: ReactNode;
  /** Accessible name of the detail aside. Default "Details" from the message catalog. */
  detailLabel?: string;
  /** `id` of the `main` element, and the target of the skip link. Default `main`. */
  mainId?: string;
  /** Pads the main content with `--ds-app-shell-main-padding`. Turn it off when the content brings its own padding (a `Container` has a gutter). Default `true`. */
  padded?: boolean;
  /** Renders the skip link as the first focusable element. Default `true`; turn it off only if the app has its own. */
  skipLink?: boolean;
  /** Controlled state of the off-canvas sidebar (narrow screens only). Pair with `onNavOpenChange`. */
  isNavOpen?: boolean;
  /** Initial state of the off-canvas sidebar when uncontrolled. Default `false`. */
  defaultNavOpen?: boolean;
  /** Called when the off-canvas sidebar opens or closes (toggle, `Escape`, scrim, close button). */
  onNavOpenChange?: (isOpen: boolean) => void;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

/**
 * The application layout: a sidebar, and a main column with a top bar above a scrollable
 * content region. The sidebar and the content scroll independently; the page itself does not.
 *
 * Landmarks: the sidebar (`aside`, from `Sidebar`), the top bar (`header`), one `main`
 * (`id="main"`), and the optional detail `aside`. A skip link to `main` comes first.
 *
 * Responsive contract (TOK-010): the shell measures its own width (a container query, so it
 * also works inside a frame). From `--ds-breakpoint-md` (768px) up the sidebar sits in the flow.
 * Below it the sidebar leaves the flow and opens as an off-canvas panel over the content,
 * controlled by `isNavOpen` and `AppShellNavToggle`; while it is open the rest of the page is
 * inert, `Escape` and the scrim close it, and focus returns to the toggle. The shell works from
 * 320px. It fills its parent: give the parent a height, or it takes the viewport height.
 */
export function AppShell({
  sidebar,
  topBar,
  children,
  detail,
  detailLabel,
  mainId = 'main',
  padded = true,
  skipLink = true,
  isNavOpen: isNavOpenProp,
  defaultNavOpen = false,
  onNavOpenChange,
  messages: overrides,
  className,
  ref,
  ...rest
}: AppShellProps) {
  const t = useMessages('AppShell', messages, overrides);
  const navId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [isNavOpen, setNavOpen] = useControllableState<boolean>({
    value: isNavOpenProp,
    defaultValue: defaultNavOpen,
    onChange: onNavOpenChange,
  });
  const narrow = useIsNarrow(rootRef);
  const panelOpen = narrow && isNavOpen;
  const mainScrolls = useScrollable(mainRef);
  const detailScrolls = useScrollable(detailRef);

  // The setter's identity changes with the render; the panel effect below must not re-run for it.
  const setNavOpenRef = useRef(setNavOpen);
  useEffect(() => {
    setNavOpenRef.current = setNavOpen;
  });

  // Move focus into the panel when it opens and give it back when it closes.
  useEffect(() => {
    if (!panelOpen) return undefined;
    const nav = navRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    nav?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    // A native listener: the root is a plain container, not an interactive element.
    const root = rootRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.stopPropagation();
      setNavOpenRef.current(false);
    };
    root?.addEventListener('keydown', onKeyDown);
    return () => {
      root?.removeEventListener('keydown', onKeyDown);
      const active = document.activeElement;
      const lostFocus = active === null || active === document.body || nav?.contains(active);
      if (previous?.isConnected && lostFocus) previous.focus();
    };
  }, [panelOpen]);

  const context: AppShellContextValue = { isNavOpen, setNavOpen, navId, messages: t };

  return (
    <AppShellContext value={context}>
      <div
        {...rest}
        ref={rootRef}
        className={classNames(styles.root, className)}
        data-nav-open={panelOpen ? 'true' : undefined}
      >
        {skipLink ? <SkipLink targetId={mainId} /> : null}
        {sidebar === undefined ? null : (
          <>
            <button
              type="button"
              tabIndex={-1}
              className={styles.scrim}
              aria-hidden="true"
              data-open={isNavOpen ? 'true' : undefined}
              onClick={() => {
                setNavOpen(false);
              }}
            />
            <div
              ref={navRef}
              id={navId}
              className={styles.nav}
              data-open={isNavOpen ? 'true' : undefined}
              {...(narrow && !isNavOpen ? { inert: true } : {})}
            >
              {sidebar}
              <div className={styles.navClose}>
                <IconButton
                  size="sm"
                  icon={XIcon}
                  label={t.navClose}
                  onPress={() => {
                    setNavOpen(false);
                  }}
                />
              </div>
            </div>
          </>
        )}
        <div className={styles.column} {...(panelOpen ? { inert: true } : {})}>
          {topBar}
          <div className={styles.body}>
            <main
              ref={mainRef}
              id={mainId}
              className={styles.main}
              data-padded={padded ? 'true' : undefined}
              {...(mainScrolls ? { tabIndex: 0 } : {})}
            >
              {children}
            </main>
            {detail === undefined ? null : (
              <aside
                ref={detailRef}
                aria-label={detailLabel ?? t.detail}
                className={styles.detail}
                {...(detailScrolls ? { tabIndex: 0 } : {})}
              >
                {detail}
              </aside>
            )}
          </div>
        </div>
      </div>
    </AppShellContext>
  );
}

export interface AppShellNavToggleProps {
  /** Accessible name of the icon button. Default "Menu" from the message catalog. */
  children?: string;
  /** Class name for the wrapper. */
  className?: string;
}

/**
 * The icon button (menu icon) that opens the off-canvas sidebar. Put it in the `TopBar` (as its `children`).
 * It is only visible below the md breakpoint, and reports `aria-expanded`. It must be rendered
 * inside `AppShell`.
 */
export function AppShellNavToggle({ children, className }: AppShellNavToggleProps) {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('AppShellNavToggle must be rendered inside AppShell.');
  }
  return (
    <span className={classNames(styles.navToggle, className)}>
      <IconButton
        variant="ghost"
        size="sm"
        icon={MenuIcon}
        label={children ?? context.messages.navToggle}
        aria-expanded={context.isNavOpen}
        aria-controls={context.navId}
        onPress={() => {
          context.setNavOpen(!context.isNavOpen);
        }}
      />
    </span>
  );
}
