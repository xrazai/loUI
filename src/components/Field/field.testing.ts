/**
 * Test helpers shared by the form-field suites (Input, Textarea, Select, Checkbox, RadioGroup,
 * Switch). Browser mode only: they use canvas and `getComputedStyle`. Not part of the public API.
 */
import { contrastRatio } from '../../utils/color';

/** Converts any CSS color (including `color-mix()` results) to `#rrggbb`, ignoring alpha. */
export function cssColorToHex(color: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('2D canvas is not available.');
  context.fillStyle = '#000000';
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

/** Resolves a `--ds-*` token to `#rrggbb` as the browser sees it. */
export function tokenColor(name: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return cssColorToHex(value);
}

/**
 * WCAG 1.4.11 contrast of an element's border against the page background behind the field.
 * Pass the element that draws the border (not the field root).
 */
export function borderContrast(element: Element): number {
  const border = cssColorToHex(getComputedStyle(element).borderTopColor);
  const page = cssColorToHex(getComputedStyle(document.body).backgroundColor);
  return contrastRatio(border, page);
}

/** Contrast of the given CSS color against the page background. */
export function colorContrastOnPage(color: string): number {
  const page = cssColorToHex(getComputedStyle(document.body).backgroundColor);
  return contrastRatio(cssColorToHex(color), page);
}
