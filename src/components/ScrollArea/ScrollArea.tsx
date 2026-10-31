import { useImperativeHandle, useRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './ScrollArea.module.css';
import { useScrollable } from './useScrollable';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

/** A scroll region needs a name: it becomes a labelled region and a keyboard stop while it scrolls. */
export type ScrollAreaLabelProps =
  | {
      /** Accessible name of the region ("Order history"). */
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      'aria-label'?: string;
      /** Id of the element that names the region. */
      'aria-labelledby': string;
    };

type ScrollAreaBaseProps = Omit<
  ComponentPropsWithRef<'div'>,
  'aria-label' | 'aria-labelledby' | 'tabIndex' | 'role'
> & {
  /** Which axes scroll. Default `vertical`. */
  orientation?: ScrollAreaOrientation;
};

export type ScrollAreaProps = ScrollAreaBaseProps & ScrollAreaLabelProps;

/**
 * A scrolling container with thin, themed scrollbars. It scrolls inside the space its parent
 * gives it: give it a height (or put it in a flex column and let it shrink).
 *
 * While its content overflows it becomes a keyboard stop (`tabindex="0"`) and a labelled
 * `region`, so keyboard users can scroll it with the arrow keys (WCAG 2.1.1). When nothing
 * overflows it is a plain container, with no tab stop and no landmark. A name is therefore
 * always required.
 */
export function ScrollArea({
  orientation = 'vertical',
  className,
  children,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ScrollAreaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const scrollable = useScrollable(rootRef, [contentRef]);
  return (
    <div
      {...rest}
      ref={rootRef}
      {...(scrollable
        ? {
            'aria-label': ariaLabel,
            'aria-labelledby': ariaLabelledBy,
            role: 'region',
            tabIndex: 0,
          }
        : {})}
      className={classNames(styles.root, className)}
      data-orientation={orientation}
      data-scrollable={scrollable ? 'true' : undefined}
    >
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </div>
  );
}
