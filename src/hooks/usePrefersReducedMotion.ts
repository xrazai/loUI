import { useMediaQuery } from './useMediaQuery';

/** True when the user asks the OS for reduced motion (`prefers-reduced-motion: reduce`). */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
