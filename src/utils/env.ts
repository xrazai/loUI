/**
 * True outside production builds. SSR-safe: never touches `window` or `document`.
 *
 * The literal `process.env.NODE_ENV` expression is kept so that consumer bundlers
 * (Vite, webpack, Next.js) can replace it statically and drop dev-only code.
 * When `process` does not exist (raw ESM in a browser) it falls back to Vite's
 * `import.meta.env.DEV`, and finally to `false`.
 */
export function isDev(): boolean {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    // `process` is not defined here.
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- `env` is undefined outside Vite.
    return import.meta.env?.DEV ?? false;
  } catch {
    return false;
  }
}

/**
 * Reports a programmer error from a pure utility: throws in development so the
 * mistake is impossible to miss, does nothing in production so a bad value can
 * never crash a render (callers then return a documented fallback).
 */
export function reportInvalid(message: string): void {
  if (isDev()) throw new RangeError(`[loui-ds] ${message}`);
}
