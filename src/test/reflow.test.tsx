/**
 * WCAG 1.4.10 Reflow, level AA (TEST-014).
 *
 * Content must fit a 320 CSS px wide viewport without horizontal scrolling. Each story is rendered
 * in a frame whose content box is exactly 320 px wide and must not overflow it. Two-dimensional
 * content (data tables, matrices) is exempt by the success criterion and is listed in
 * `wcag-allowlist.ts`.
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { allStories, renderStory } from './stories';
import { allowedFor, isStoryAllowed } from './wcag-allowlist';

/**
 * `StoryFrame` pins some stories to a fixed width (a form at 400 px). That is story scaffolding,
 * not a property of the component, so the reflow run lets those frames shrink to the viewport.
 */
beforeAll(() => {
  const style = document.createElement('style');
  style.textContent =
    '[data-story-width] { inline-size: auto !important; max-inline-size: 100% !important; }';
  document.head.append(style);
});

/** Content width of the viewport the criterion names. */
const VIEWPORT = 320;
/** The story frame has 16 px of padding on each side. */
const FRAME = VIEWPORT + 32;

function label(el: Element): string {
  const text = el.textContent.trim().slice(0, 24);
  return `<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}"> "${text}"`;
}

/** Elements that stick out past the right (or, in RTL, left) edge of the frame's content box. */
export function overflowing(frame: HTMLElement, ignoreSelectors: string[] = []): string[] {
  const box = frame.getBoundingClientRect();
  const limitRight = box.right - 16 + 0.5;
  const limitLeft = box.left + 16 - 0.5;
  const found: string[] = [];
  for (const el of Array.from(frame.querySelectorAll('*'))) {
    if (el.closest('[data-live-announcer], [hidden], [aria-hidden="true"]')) continue;
    if (ignoreSelectors.some((selector) => el.closest(selector))) continue;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.position === 'fixed') continue;
    // Visually hidden helpers (clipped, 1 px) never overflow visibly.
    if (style.position === 'absolute' && style.clipPath === 'inset(50%)') continue;
    // Content inside its own clipping or scrolling container cannot widen the page.
    let clipped = false;
    for (let parent = el.parentElement; parent && parent !== frame; parent = parent.parentElement) {
      const overflow = getComputedStyle(parent).overflowX;
      if (
        overflow === 'auto' ||
        overflow === 'scroll' ||
        overflow === 'hidden' ||
        overflow === 'clip'
      ) {
        clipped = true;
        break;
      }
    }
    if (clipped) continue;
    // A rotating element (spinner) has a bounding box that swings past its layout box.
    if (el.getAnimations().length > 0) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (rect.right > limitRight || rect.left < limitLeft) {
      found.push(
        `${label(el)} spans ${rect.left.toFixed(0)}..${rect.right.toFixed(0)} (content box ${limitLeft.toFixed(0)}..${limitRight.toFixed(0)})`,
      );
    }
  }
  return found;
}

describe('WCAG 1.4.10 reflow at 320 CSS px', () => {
  const unmounts: (() => Promise<void> | void)[] = [];
  afterEach(async () => {
    for (const unmount of unmounts.splice(0)) await unmount();
  });

  for (const entry of allStories()) {
    if (isStoryAllowed('reflow', entry.id)) continue;
    it(`${entry.id} (${entry.file})`, async () => {
      const rendered = await renderStory(entry, { width: FRAME });
      unmounts.push(rendered.unmount);
      const ignore = allowedFor('reflow', entry.id).flatMap((a) =>
        a.selector ? [a.selector] : [],
      );
      const found = overflowing(rendered.frame, ignore);
      // Report only the outermost offenders: children of an overflowing element overflow too.
      expect(found.slice(0, 6), found.slice(0, 6).join('\n')).toEqual([]);
    });
  }
});
