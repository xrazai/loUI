import type { ComponentPropsWithoutRef } from 'react';
import { useScrollable } from './useScrollable';

/**
 * The scrolling body of a Dialog or Sheet. It becomes a tab stop only while its content
 * overflows, so keyboard users can scroll it with the arrow keys; otherwise it is inert to Tab.
 * Internal: not exported from the package.
 */
export function ScrollBody(props: ComponentPropsWithoutRef<'div'>) {
  const { ref, isScrollable } = useScrollable<HTMLDivElement>();
  return <div {...props} ref={ref} {...(isScrollable ? { tabIndex: 0 } : {})} />;
}
