import { reportInvalid } from './env';

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Parses `#rgb` or `#rrggbb` (the `#` is optional) into 0-255 channels. */
function parseHex(hex: string): [number, number, number] | undefined {
  const match = HEX.exec(hex.trim());
  const digits = match?.[1];
  if (!digits) return undefined;
  const full = digits.length === 3 ? digits.replace(/./g, '$&$&') : digits;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

/** sRGB channel (0-255) to linear light, as defined by WCAG 2.x. */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * WCAG 2.x relative luminance of a hex color: `0` (black) to `1` (white).
 * Accepts `#rgb` and `#rrggbb`. Invalid colors throw in development and count as black in production.
 */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) {
    reportInvalid(`relativeLuminance expects #rgb or #rrggbb, received "${hex}".`);
    return 0;
  }
  const [r, g, b] = rgb;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** WCAG contrast ratio between two hex colors, from `1` (identical) to `21` (black on white). Order does not matter. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Which text color is more readable on a background color: `'light'` (white-ish
 * text, for dark backgrounds) or `'dark'`. Picks whichever of white or black has
 * the higher WCAG contrast, replacing the handoff's 0.299/0.587/0.114 shortcut.
 */
export function readableTextOn(backgroundHex: string): 'light' | 'dark' {
  const luminance = relativeLuminance(backgroundHex);
  const againstWhite = 1.05 / (luminance + 0.05);
  const againstBlack = (luminance + 0.05) / 0.05;
  return againstWhite > againstBlack ? 'light' : 'dark';
}
