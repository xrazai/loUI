const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** True for `#rgb` and `#rrggbb` (the `#` is required). */
export function isHexColor(value: string): boolean {
  return HEX.test(value);
}
