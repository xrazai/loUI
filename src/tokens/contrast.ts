/**
 * WCAG 2.2 contrast helpers shared by the contrast unit test and the Storybook tokens page.
 * Pure functions over resolved token values (`#RRGGBB` or `rgba(r, g, b, a)`); no DOM.
 */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ContrastPair {
  id: string;
  /** Token name of the foreground (text, icon or border). */
  foreground: string;
  /** Token names of the background layers, bottom first. The first layer must be opaque. */
  background: string[];
  /** Minimum ratio: 4.5 text, 3 for UI boundaries and graphics (WCAG 1.4.3, 1.4.11). */
  min: number;
  usage: string;
}

const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
const RGBA = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$/i;

/** Parse a resolved token color value. */
export function parseColor(value: string): Rgba {
  const hex = HEX.exec(value);
  if (hex) {
    return {
      r: parseInt(hex[1] ?? '0', 16),
      g: parseInt(hex[2] ?? '0', 16),
      b: parseInt(hex[3] ?? '0', 16),
      a: hex[4] === undefined ? 1 : parseInt(hex[4], 16) / 255,
    };
  }
  const rgba = RGBA.exec(value);
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }
  throw new Error(`Unsupported color value: ${value}`);
}

/** Alpha-composite `top` over an opaque `bottom` (sRGB space, as browsers do). */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const mix = (t: number, b: number) => t * top.a + b * (1 - top.a);
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 1 };
}

/** Flatten layers (bottom first) into one opaque color. */
export function flatten(layers: Rgba[]): Rgba {
  const [first, ...rest] = layers;
  if (!first || first.a < 1) throw new Error('The bottom background layer must be opaque.');
  return rest.reduce((below, layer) => composite(layer, below), first);
}

/** WCAG relative luminance of an opaque color. */
export function luminance({ r, g, b }: Rgba): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two opaque colors (1 to 21). */
export function ratio(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Contrast of a foreground over background layers; a translucent foreground is flattened on top. */
export function pairRatio(foreground: string, background: string[], values: Map<string, string>) {
  const value = (name: string) => {
    const v = values.get(name);
    if (v === undefined) throw new Error(`Unknown token in contrast pair: ${name}`);
    return parseColor(v);
  };
  const bg = flatten(background.map(value));
  const fg = composite(value(foreground), bg);
  return ratio(fg, bg);
}
