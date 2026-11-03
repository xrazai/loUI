const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * True for `#rgb` and `#rrggbb` (the `#` is required). Accepts model data typed
 * `string | null | undefined`; `null`, `undefined`, `transparent`, a CSS name and an empty string are
 * false. Deliberately a plain boolean, not a type predicate: a string that fails the check is still a
 * string.
 */
export function isHexColor(value: string | null | undefined): boolean {
  return typeof value === 'string' && HEX.test(value);
}
