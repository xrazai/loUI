import { isDev } from './env';

/** Lifecycle of a component or hook (AGENTS.md section 13); `deprecated` ones are never used in recipes. */
export type ComponentStatus = 'experimental' | 'stable' | 'deprecated';

const warned = new Set<string>();

/**
 * Logs a deprecation warning once per `name`. Development only: a no-op in
 * production builds and on the server-side of production. Call it from the
 * deprecated component's body or module, passing what to use instead.
 *
 * `warnDeprecated('OldButton', 'Use Button with variant="ghost" instead.')`
 */
export function warnDeprecated(name: string, message: string): void {
  if (!isDev() || warned.has(name)) return;
  warned.add(name);
  console.warn(`[loui-ds] ${name} is deprecated. ${message}`);
}

/** Test helper: forgets which deprecations were already reported. Not part of the public API. */
export function resetDeprecationWarnings(): void {
  warned.clear();
}
