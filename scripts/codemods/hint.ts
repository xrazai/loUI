/**
 * Migration hints (`@deprecated Use X instead`) in a form codemods can act on.
 *
 * The manifest stores the text after `@deprecated` on every deprecated prop
 * (`ManifestProp.deprecated`). A hint is machine-applicable only when it names exactly one
 * replacement identifier: `Use variant.`, ``Use `variant` instead.``, `Renamed to variant.`.
 * Anything else ("Use tone together with variant", "Removed") needs a human and is reported by
 * the codemod instead of being guessed.
 */

export interface RenameHint {
  kind: 'rename';
  to: string;
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const PATTERNS: RegExp[] = [
  /^use\s+`?([^\s`.,;]+)`?(?:\s+instead(?:\s+of\s+`?[^\s`.,;]+`?)?)?\s*[.]?$/i,
  /^(?:renamed|replaced)\s+(?:to|by|with)\s+`?([^\s`.,;]+)`?\s*[.]?$/i,
];

/** The rename a hint asks for, or null when it is not a plain single-identifier rename. */
export function parseMigrationHint(hint: string): RenameHint | null {
  const text = hint.trim();
  for (const pattern of PATTERNS) {
    const to = pattern.exec(text)?.[1];
    if (to !== undefined && IDENTIFIER.test(to)) return { kind: 'rename', to };
  }
  return null;
}
