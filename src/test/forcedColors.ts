/**
 * Helpers for the forced-colors suites (TOK-013).
 *
 * Chromium's forced-colors emulation is switched on through the Chrome DevTools Protocol
 * (`Emulation.setEmulatedMedia`), the same call Playwright's `page.emulateMedia({ forcedColors })`
 * makes. Vitest browser mode runs each worker in its own page, so the emulation is page scoped,
 * but it persists across the test files that page runs afterwards: always switch it off again in
 * `afterAll`.
 */
import { cdp, userEvent } from 'vitest/browser';

export async function setForcedColors(active: boolean): Promise<void> {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'forced-colors', value: active ? 'active' : '' }],
  });
  if (matchMedia('(forced-colors: active)').matches !== active) {
    throw new Error(`Forced-colors emulation did not switch ${active ? 'on' : 'off'}.`);
  }
}

/**
 * Marks the page as keyboard-driven so a scripted `focus()` matches `:focus-visible` and React
 * Aria sets `data-focus-visible`. React Aria ignores modifier-only keys, so this presses Tab.
 * Call it after the story is rendered; it moves focus, so blur afterwards.
 */
export async function useKeyboardModality(): Promise<void> {
  await userEvent.keyboard('{Tab}');
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

const FOCUSABLE = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
  '[role="tab"]',
  '[role="option"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="gridcell"]',
  '[role="slider"]',
  '[role="row"]',
].join(',');

/** Visible, enabled elements that can take focus (roving tabindex members included). */
export function focusableElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    if (el.matches(':disabled, [aria-disabled="true"], [data-live-announcer] *')) return false;
    if (el.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    // Visually hidden controls (RAC DismissButton) have no indicator by design.
    if (
      style.position === 'absolute' &&
      style.clipPath === 'inset(50%)' &&
      el.tagName === 'BUTTON'
    ) {
      return false;
    }
    return true;
  });
}

function alpha(color: string): number {
  if (color === 'transparent') return 0;
  const match = /rgba?\([^)]*?(?:,\s*|\/\s*)([\d.]+)\)$/.exec(color);
  return match?.[1] === undefined ? 1 : Number(match[1]);
}

/** True when the element draws an outline in a non-transparent color. */
export function hasVisibleOutline(el: Element): boolean {
  const style = getComputedStyle(el);
  return (
    style.outlineStyle !== 'none' &&
    style.outlineStyle !== 'hidden' &&
    parseFloat(style.outlineWidth) > 0 &&
    alpha(style.outlineColor) > 0
  );
}

/**
 * Focus must be shown by an outline (the only focus style forced colors keeps, because it drops
 * box-shadow). Checks the focused element, then the component host that carries
 * `data-focus-visible` (React Aria puts it on the wrapper when a hidden input holds focus) and
 * everything inside it.
 */
export function focusIndicator(el: HTMLElement): { ok: boolean; detail: string } {
  if (hasVisibleOutline(el)) return { ok: true, detail: 'outline on the element' };
  const host = el.closest('[data-focus-visible], [data-focused]');
  if (host) {
    if (hasVisibleOutline(host)) return { ok: true, detail: 'outline on the host' };
    for (const inner of Array.from(host.querySelectorAll('*'))) {
      if (hasVisibleOutline(inner)) return { ok: true, detail: 'outline inside the host' };
    }
  }
  const style = getComputedStyle(el);
  return {
    ok: false,
    detail: `outline ${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
  };
}

const SIGNATURE_PROPS = [
  'color',
  'backgroundColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopStyle',
  'borderBottomStyle',
  'borderLeftStyle',
  'borderRightStyle',
  'outlineStyle',
  'outlineWidth',
  'outlineColor',
  'textDecorationLine',
  'textDecorationThickness',
  'fontWeight',
  'opacity',
  'visibility',
  'display',
  'stroke',
  'fill',
] as const;

function describeNode(el: Element): string {
  const style = getComputedStyle(el);
  const parts: string[] = SIGNATURE_PROPS.map((prop) => `${prop}=${style[prop]}`);
  for (const pseudo of ['::before', '::after'] as const) {
    const p = getComputedStyle(el, pseudo);
    if (p.content !== 'none' && p.content !== 'normal') {
      parts.push(
        `${pseudo}:${p.content}|${p.backgroundColor}|${p.borderTopColor}|${p.width}x${p.height}`,
      );
    }
  }
  return parts.join(';');
}

/**
 * A string capturing everything that is painted for an element and its descendants, ignoring text
 * content and geometry noise from other components. Two states are distinguishable in forced
 * colors when their signatures differ.
 */
export function paintSignature(el: Element): string {
  const nodes = [el, ...Array.from(el.querySelectorAll('*'))];
  return nodes
    .filter((node) => getComputedStyle(node).display !== 'none')
    .map((node) => `${node.tagName.toLowerCase()}[${describeNode(node)}]`)
    .join('\n');
}
