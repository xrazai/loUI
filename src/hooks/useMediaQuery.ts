import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query. SSR-safe: on the server (and during hydration)
 * it returns `defaultValue` (`false` unless given), then the real value after hydration.
 *
 * Prefer CSS media queries for styling; use this only when behavior (not appearance) depends on the query.
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
}
