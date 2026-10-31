/**
 * WCAG 2.5.8 Target Size (Minimum), level AA (TEST-014).
 *
 * Every focusable or clickable element of every story must be at least 24 x 24 CSS px, or pass
 * the spacing exception: a 24 px circle centered on the undersized target touches no other
 * target. Inline links inside a sentence are exempt by the success criterion itself.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { allowedFor } from './wcag-allowlist';
import { allStories, renderStory } from './stories';

const MIN = 24;

const TARGET_SELECTOR = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  'label:has(input, select, textarea)',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="combobox"]',
  '[role="gridcell"][tabindex]',
  '[role="row"][tabindex]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface Box {
  el: Element;
  rect: DOMRect;
}

function isVisible(el: Element): boolean {
  const style = getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  if (el.closest('[hidden], [inert], [aria-hidden="true"], [data-live-announcer]')) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/** Visually hidden form inputs (clip to 1 px) are represented by their label or wrapper. */
function isVisuallyHidden(el: Element, rect: DOMRect): boolean {
  // React Aria's VisuallyHidden (DismissButton, hidden inputs) clips a wrapper span instead of
  // using display or size, so look at the element and its closest ancestors.
  let node: Element | null = el;
  for (let depth = 0; node && depth < 3; depth += 1, node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.position !== 'absolute') continue;
    if (
      style.clipPath === 'inset(50%)' ||
      style.getPropertyValue('clip') === 'rect(0px, 0px, 0px, 0px)'
    ) {
      return true;
    }
  }
  return rect.width <= 1 && rect.height <= 1;
}

/** An inline link that sits inside running text is exempt (2.5.8 "Inline"). */
function isInlineText(el: Element): boolean {
  if (el.tagName !== 'A') return false;
  if (getComputedStyle(el).display !== 'inline') return false;
  const parent = el.parentElement;
  if (!parent) return false;
  const own = Array.from(parent.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0,
  );
  return own;
}

function circleTouchesRect(cx: number, cy: number, r: number, rect: DOMRect): boolean {
  const nx = Math.max(rect.left, Math.min(cx, rect.right));
  const ny = Math.max(rect.top, Math.min(cy, rect.bottom));
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
}

function describeEl(el: Element): string {
  const label = el.getAttribute('aria-label') ?? el.textContent.trim().slice(0, 24);
  const cls = el.getAttribute('class')?.split(' ')[0] ?? '';
  return `<${el.tagName.toLowerCase()}${el.getAttribute('role') ? ` role=${el.getAttribute('role') ?? ''}` : ''}${cls ? ` .${cls}` : ''}> "${label}"`;
}

/** Targets that fail 2.5.8 inside `root`, with the measured size. */
export function findTargetSizeFailures(root: ParentNode, ignoreSelectors: string[] = []): string[] {
  const boxes: Box[] = [];
  for (const el of Array.from(root.querySelectorAll(TARGET_SELECTOR))) {
    if (!isVisible(el)) continue;
    const rect = el.getBoundingClientRect();
    if (isVisuallyHidden(el, rect)) continue;
    // A control whose own box is clipped away but whose label is the target is covered by the label.
    if (el.matches(':disabled, [aria-disabled="true"]')) continue;
    boxes.push({ el, rect });
  }
  // Nested targets (for example a checkbox input inside its label) count once, at the outer box.
  const outer = boxes.filter(({ el }) => !boxes.some((o) => o.el !== el && o.el.contains(el)));
  const failures: string[] = [];
  for (const { el, rect } of outer) {
    if (rect.width >= MIN - 0.01 && rect.height >= MIN - 0.01) continue;
    if (isInlineText(el)) continue;
    if (ignoreSelectors.some((selector) => el.matches(selector))) continue;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const crowded = outer.some(
      (other) =>
        other.el !== el &&
        !other.el.contains(el) &&
        !el.contains(other.el) &&
        circleTouchesRect(cx, cy, MIN / 2, other.rect),
    );
    if (!crowded) continue;
    failures.push(
      `${describeEl(el)} is ${rect.width.toFixed(1)}x${rect.height.toFixed(1)} and another target is within 24 px`,
    );
  }
  return failures;
}

describe('target size checker', () => {
  function mount(html: string): HTMLElement {
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.append(host);
    return host;
  }

  it('flags two small adjacent targets', () => {
    const host = mount(
      '<button style="width:16px;height:16px;padding:0">a</button><button style="width:16px;height:16px;padding:0">b</button>',
    );
    expect(findTargetSizeFailures(host)).toHaveLength(2);
    host.remove();
  });

  it('accepts a small target with enough free space around it', () => {
    const host = mount('<button style="width:16px;height:16px;padding:0;margin:20px">a</button>');
    expect(findTargetSizeFailures(host)).toEqual([]);
    host.remove();
  });

  it('accepts targets of at least 24x24 next to each other', () => {
    const host = mount(
      '<button style="width:24px;height:24px;padding:0">a</button><button style="width:24px;height:24px;padding:0">b</button>',
    );
    expect(findTargetSizeFailures(host)).toEqual([]);
    host.remove();
  });

  it('exempts inline links inside a sentence', () => {
    const host = mount('<p>Read the <a href="#a">terms</a> and the <a href="#b">policy</a>.</p>');
    expect(findTargetSizeFailures(host)).toEqual([]);
    host.remove();
  });
});

describe('WCAG 2.5.8 target size (minimum 24x24 or spacing)', () => {
  const unmounts: (() => Promise<void> | void)[] = [];
  afterEach(async () => {
    for (const unmount of unmounts.splice(0)) await unmount();
  });

  for (const entry of allStories()) {
    const allowed = allowedFor('target-size', entry.id);
    if (allowed.some((a) => a.selector === undefined)) continue;
    it(`${entry.id} (${entry.file})`, async () => {
      const rendered = await renderStory(entry);
      unmounts.push(rendered.unmount);
      // Portaled overlays (menus, dialogs) render outside the frame, so measure the document.
      const failures = findTargetSizeFailures(
        document.body,
        allowed.flatMap((a) => (a.selector ? [a.selector] : [])),
      );
      expect(failures, failures.join('\n')).toEqual([]);
    });
  }
});
