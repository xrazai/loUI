import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Reports whether an element's content overflows it, so a scroll container can become
 * keyboard focusable only when it actually scrolls (WCAG 2.1.1). It watches the element and the
 * elements in `observe` for size changes. SSR-safe: `false` on the server and before mount.
 */
export function useScrollable(
  ref: RefObject<HTMLElement | null>,
  observe: readonly RefObject<HTMLElement | null>[] = [],
): boolean {
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => {
      setScrollable(
        element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth,
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const other of observe) {
      if (other.current) observer.observe(other.current);
    }
    return () => {
      observer.disconnect();
    };
    // `observe` holds stable refs; the effect should only re-run when the element changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
  return scrollable;
}
