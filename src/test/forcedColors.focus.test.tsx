/**
 * TOK-013: focus stays visible in Windows High Contrast / forced-colors mode.
 *
 * Renders every story with Chromium's forced-colors emulation on, moves keyboard focus to each
 * focusable element and requires an outline in a real (non-transparent) color. Forced colors
 * repaints outlines with system colors but drops box-shadow, so a ring made only of box-shadow
 * would disappear.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  focusableElements,
  focusIndicator,
  setForcedColors,
  useKeyboardModality,
} from './forcedColors';
import { allStories, renderStory } from './stories';
import { isStoryAllowed } from './wcag-allowlist';

beforeAll(async () => {
  await setForcedColors(true);
});
afterAll(async () => {
  await setForcedColors(false);
});

describe('forced colors: focus indicator', () => {
  const unmounts: (() => Promise<void> | void)[] = [];
  afterEach(async () => {
    for (const unmount of unmounts.splice(0)) await unmount();
  });

  for (const entry of allStories()) {
    it(`${entry.id} (${entry.file})`, async () => {
      if (isStoryAllowed('forced-colors-focus', entry.id)) return;
      const rendered = await renderStory(entry);
      unmounts.push(rendered.unmount);
      await useKeyboardModality();
      const failures: string[] = [];
      for (const el of focusableElements(document.body)) {
        el.focus();
        if (document.activeElement !== el) continue;
        const { ok, detail } = focusIndicator(el);
        if (!ok) {
          const name = el.getAttribute('aria-label') ?? el.textContent.trim().slice(0, 24);
          failures.push(
            `<${el.tagName.toLowerCase()} class="${el.className}"> "${name}": ${detail}`,
          );
        }
        el.blur();
      }
      expect(failures, failures.join('\n')).toEqual([]);
    });
  }
});
