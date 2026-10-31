import type { CSSProperties } from 'react';

/**
 * Keys of the space scale (`--ds-space-<key>`: 4, 8, 12, 16, 20, 24, 32, 48, 64 px). Layout
 * components take these keys, never pixel values, so every gap stays on the 4px grid.
 */
export type SpaceKey = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12 | 16;

/** The CSS value of a space key: `var(--ds-space-4)`. */
export function spaceVar(key: SpaceKey): string {
  return `var(--ds-space-${String(key)})`;
}

/**
 * Adds custom properties to a consumer `style` (ADR-0002 amendment: dynamic values only travel
 * as custom properties). Entries with an `undefined` value are skipped.
 */
export function withCustomProperties(
  style: CSSProperties | undefined,
  properties: Record<string, string | undefined>,
): CSSProperties {
  const defined = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
  return { ...style, ...defined };
}

/** Elements the layout components may render as. */
export type LayoutElement =
  | 'div'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'nav'
  | 'aside'
  | 'main'
  | 'ul'
  | 'ol'
  | 'li'
  | 'form';
