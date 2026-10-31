import { useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Whether an element overflows and therefore scrolls. A scrollable region with nothing
 * focusable inside must itself be focusable so keyboard users can scroll it (WCAG 2.1.1;
 * axe `scrollable-region-focusable`). Measured after layout and on resize; `false` on the
 * server.
 */
export function useScrollable<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  isScrollable: boolean;
} {
  const ref = useRef<T | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      setIsScrollable(element.scrollHeight > element.clientHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { ref, isScrollable };
}
