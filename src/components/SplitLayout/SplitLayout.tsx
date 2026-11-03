import { useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../../utils/classNames';
import { useScrollable } from '../ScrollArea/useScrollable';
import { spaceVar, withCustomProperties } from '../Stack/spacing';
import type { SpaceValue } from '../Stack/spacing';
import styles from './SplitLayout.module.css';

export type SplitLayoutAsideWidth = 'sm' | 'md' | 'lg';
export type SplitLayoutAsidePosition = 'start' | 'end';
export type SplitLayoutCollapseBelow = 'sm' | 'md' | 'lg' | 'never';

export interface SplitLayoutProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The main content. It takes the free width and can shrink, so long words wrap instead of widening the page. */
  children?: ReactNode;
  /** The side panel: a chat, a filter, a summary. Without it, only the main content renders. */
  aside?: ReactNode;
  /**
   * Accessible name of the side panel. With it the panel is an `aside` landmark; without it, a
   * plain `div`, because a layout primitive must not add unnamed landmarks.
   */
  asideLabel?: string | undefined;
  /** Width of the side panel: `sm` 280px, `md` 360px (default, same as the `AppShell` detail pane), `lg` 480px. */
  asideWidth?: SplitLayoutAsideWidth | undefined;
  /**
   * Side of the side panel in the reading direction: `end` (default) or `start`. It is logical,
   * so it flips in right-to-left text. The DOM order stays main first.
   */
  asidePosition?: SplitLayoutAsidePosition | undefined;
  /** Space between the main content and the aside, as a key of the space scale. Default `6` (24px). */
  gap?: SpaceValue | undefined;
  /**
   * Keeps the aside in view while the main content scrolls (`position: sticky`). The aside is
   * limited to the height of the viewport and scrolls on its own, and becomes a keyboard stop
   * while it scrolls. Sticky only works beside the main content: it is off while collapsed.
   */
  sticky?: boolean | undefined;
  /**
   * Width of the layout (its own width, measured with a container query) under which the aside
   * stacks under the main content: `sm` 480px, `md` 768px (default), `lg` 1024px, or `never`.
   * The widths are the `--ds-breakpoint-*` tokens.
   */
  collapseBelow?: SplitLayoutCollapseBelow | undefined;
}

/**
 * A main column with a fixed-width side panel beside it: an editor with a chat, a list with a
 * summary. The side panel can stay in view while the main content scrolls, and stacks under the
 * main content when the layout is narrow. Use `Grid` for equal columns, and the `AppShell`
 * `detail` prop for the detail pane of a whole screen.
 *
 * The main content comes first in the DOM (reading and Tab order); `asidePosition="start"` only
 * changes where it is drawn.
 */
export function SplitLayout({
  children,
  aside,
  asideLabel,
  asideWidth = 'md',
  asidePosition = 'end',
  gap = 6,
  sticky = false,
  collapseBelow = 'md',
  className,
  style,
  ...rest
}: SplitLayoutProps) {
  const asideRef = useRef<HTMLDivElement>(null);
  const scrolls = useScrollable(asideRef);
  const hasAside = aside !== undefined && aside !== null && aside !== false;
  const AsideTag = asideLabel ? 'aside' : 'div';
  return (
    <div
      {...rest}
      className={classNames(styles.root, className)}
      style={withCustomProperties(style, { '--ds-split-layout-gap': spaceVar(gap) })}
    >
      <div
        className={styles.layout}
        data-aside-width={asideWidth}
        data-aside-position={asidePosition}
        data-collapse={collapseBelow}
        data-sticky={sticky && hasAside ? 'true' : undefined}
        data-has-aside={hasAside ? 'true' : undefined}
      >
        <div className={styles.main}>{children}</div>
        {hasAside ? (
          <AsideTag
            ref={asideRef}
            className={styles.aside}
            {...(asideLabel ? { 'aria-label': asideLabel } : {})}
            {...(sticky && scrolls ? { tabIndex: 0 } : {})}
          >
            {aside}
          </AsideTag>
        ) : null}
      </div>
    </div>
  );
}
