/**
 * WCAG 1.4.12 Text Spacing, level AA (TEST-014).
 *
 * Users may override line height (1.5), paragraph spacing (2), letter spacing (0.12) and word
 * spacing (0.16) without losing content or functionality. Each story is measured twice, plain and
 * with that override applied (the exact values of the success criterion, as `!important`), and
 * the test fails for any element that clips its text only under the override: a fixed-height box
 * that now cuts off a line, or a label that is silently cut off at the side. Deliberate
 * `text-overflow: ellipsis` truncation is not counted (policy, see the report of TEST-014).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { allStories, renderStory, settle } from './stories';
import { isStoryAllowed } from './wcag-allowlist';

const OVERRIDE = `
  *, *::before, *::after {
    line-height: 1.5 !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  p { margin-block-end: 2em !important; }
`;

function name(el: Element): string {
  const text = el.textContent.trim().slice(0, 28);
  return `<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}"> "${text}"`;
}

function hasOwnText(el: Element): boolean {
  return (
    el.textContent.trim().length > 0 ||
    (el instanceof HTMLInputElement && el.value.length > 0) ||
    (el instanceof HTMLTextAreaElement && el.value.length > 0)
  );
}

/** Elements whose text is cut off, keyed so before and after can be compared. */
export function clippedText(root: ParentNode): Map<string, string> {
  const clipped = new Map<string, string>();
  const all = Array.from(root.querySelectorAll('*'));
  all.forEach((el, index) => {
    if (el.closest('[data-live-announcer], [hidden], [aria-hidden="true"]')) return;
    const style = getComputedStyle(el);
    if (style.display === 'none') return;
    if (style.position === 'absolute' && style.clipPath === 'inset(50%)') return; // visually hidden
    if (!hasOwnText(el)) return;
    const clipsY = ['hidden', 'clip'].includes(style.overflowY);
    const clipsX = ['hidden', 'clip'].includes(style.overflowX);
    const key = `${String(index)}:${el.tagName}`;
    if (clipsY && el.scrollHeight > el.clientHeight + 1 && el.clientHeight > 0) {
      clipped.set(
        key,
        `${name(el)} cuts off text (${String(el.scrollHeight)} > ${String(el.clientHeight)} px tall)`,
      );
    } else if (
      clipsX &&
      // Deliberate single-line truncation (`text-overflow: ellipsis`) is the system's documented
      // overflow behavior and shows that text was cut; only silent clipping is a failure here.
      style.textOverflow !== 'ellipsis' &&
      el.scrollWidth > el.clientWidth + 1 &&
      el.clientWidth > 0
    ) {
      clipped.set(
        key,
        `${name(el)} truncates text (${String(el.scrollWidth)} > ${String(el.clientWidth)} px wide)`,
      );
    }
  });
  return clipped;
}

describe('WCAG 1.4.12 text spacing', () => {
  const unmounts: (() => Promise<void> | void)[] = [];
  afterEach(async () => {
    document.getElementById('wcag-text-spacing')?.remove();
    for (const unmount of unmounts.splice(0)) await unmount();
  });

  it('control: the detector flags clipped text', () => {
    const host = document.createElement('div');
    host.innerHTML =
      '<p style="overflow:hidden;height:20px;margin:0;line-height:20px">One line of text that wraps over several lines when it is long enough to wrap.</p>';
    document.body.append(host);
    expect(clippedText(host).size).toBeGreaterThan(0); // clipped even before: a sanity check of the detector
    host.remove();
  });

  for (const entry of allStories()) {
    if (isStoryAllowed('text-spacing', entry.id)) continue;
    it(`${entry.id} (${entry.file})`, async () => {
      const rendered = await renderStory(entry);
      unmounts.push(rendered.unmount);
      const before = clippedText(document.body);
      const style = document.createElement('style');
      style.id = 'wcag-text-spacing';
      style.textContent = OVERRIDE;
      document.head.append(style);
      await settle();
      const after = clippedText(document.body);
      const added = [...after].filter(([key]) => !before.has(key)).map(([, message]) => message);
      expect(added, added.join('\n')).toEqual([]);
    });
  }
});
