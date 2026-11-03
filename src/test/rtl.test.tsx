/**
 * RTL smoke render (AI-016).
 *
 * Every story is rendered twice, once with `dir="ltr"` and once with `dir="rtl"` on the document
 * (logical CSS properties flip and portaled overlays inherit the direction). The test asserts
 * that:
 *
 * 1. rendering in RTL does not throw, and
 * 2. mirroring does not add horizontal overflow to the story frame (the root of the rendered
 *    story): the frame's scroll width in RTL may not exceed the LTR one.
 *
 * The comparison is deliberately relative: some stories are wider than their frame in both
 * directions (tables, fixed-width forms) and `reflow.test.tsx` owns that rule. It is a smoke
 * test, not a review of the mirrored layout. Stories exempt from reflow (`wcag-allowlist.ts`)
 * are skipped here too.
 */
import { clearAllMocks } from 'storybook/test';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { allStories, renderStory } from './stories';
import type { StoryEntry } from './stories';
import { isStoryAllowed } from './wcag-allowlist';

const root = document.documentElement;
let previousDir: string | null;
let previousLang: string | null;

beforeAll(() => {
  previousDir = root.getAttribute('dir');
  previousLang = root.getAttribute('lang');
});

afterAll(() => {
  if (previousDir === null) root.removeAttribute('dir');
  else root.setAttribute('dir', previousDir);
  if (previousLang === null) root.removeAttribute('lang');
  else root.setAttribute('lang', previousLang);
});

/** Horizontal overflow (px) of the story frame when rendered in the given direction. */
async function overflowIn(entry: StoryEntry, dir: 'ltr' | 'rtl'): Promise<number> {
  root.setAttribute('dir', dir);
  root.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');
  // Story spies (args.onSave and the like) are shared; a play function may count calls.
  clearAllMocks();
  const rendered = await renderStory(entry);
  try {
    const { frame } = rendered;
    // The page direction must actually reach the story (RTL stories pin their own direction).
    if (dir === 'rtl') expect(getComputedStyle(frame).direction).toBe('rtl');
    return Math.max(0, frame.scrollWidth - frame.clientWidth);
  } finally {
    await rendered.unmount();
  }
}

describe('RTL smoke render', () => {
  afterEach(() => {
    root.removeAttribute('dir');
  });

  for (const entry of allStories()) {
    if (isStoryAllowed('reflow', entry.id)) continue;
    it(`${entry.id} (${entry.file})`, async () => {
      const ltr = await overflowIn(entry, 'ltr');
      const rtl = await overflowIn(entry, 'rtl');
      // 1 px of tolerance for sub-pixel rounding.
      expect(
        rtl - ltr,
        `RTL adds ${String(rtl - ltr)} px of horizontal overflow (LTR ${String(ltr)} px, RTL ${String(rtl)} px)`,
      ).toBeLessThanOrEqual(1);
    });
  }
});
