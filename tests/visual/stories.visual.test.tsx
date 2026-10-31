/**
 * Visual regression over every story (TEST-005, ADR-0010).
 *
 * Discovery is automatic: `import.meta.glob` finds every `src/**\/*.stories.tsx`, so a story
 * added by anyone later gets a baseline on the next `pnpm test:visual:update`, with no change
 * to this file. See tests/visual/README.md for the workflow and the story opt-out/opt-in
 * parameters.
 */
import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { render } from 'vitest-browser-react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import * as previewAnnotations from '../../.storybook/preview';
import { DSProvider } from '../../src/providers/DSProvider';

setProjectAnnotations([previewAnnotations]);

/** Per-story switches, set under `parameters.visual` in a story or its meta. */
interface VisualParameters {
  /** Skip this story (for example because it is animated, random or time dependent). */
  disable?: boolean;
  /** Run the story's `play` function before the screenshot (focus, hover, open states). */
  play?: boolean;
  /** Width of the capture frame in CSS px (never wider than the test viewport). Default 384. */
  width?: number;
  /** CSS selector of the element to capture instead of the frame (for portaled overlays). */
  selector?: string;
  /** Minimum height of the capture frame in CSS px, to leave room for a popover that opens below the trigger. */
  height?: number;
}

const DEFAULT_WIDTH = 384;

/** Freezes animation and transitions and hides carets so captures are deterministic. */
const STABILITY_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
  }
  [data-visual-frame] {
    box-sizing: border-box;
    max-inline-size: 100%;
    padding: var(--ds-space-4);
    background: var(--ds-bg);
    color: var(--ds-text);
  }
`;

const stylesheet = document.createElement('style');
stylesheet.textContent = STABILITY_CSS;
document.head.append(stylesheet);

type StoryModule = Record<string, unknown>;

/** The part of a composed story this file relies on. */
interface ComposedStory {
  (): ReactElement | null;
  id: string;
  parameters: Record<string, unknown>;
  play?: (context: { canvasElement: HTMLElement }) => Promise<void>;
}

// composeStories is typed per story module; here the module shape is only known at runtime.
const compose = composeStories as unknown as (module: StoryModule) => Record<string, ComposedStory>;
const modules = import.meta.glob<StoryModule>('../../src/**/*.stories.tsx', { eager: true });

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

/** Resolves once fonts requested by the rendered text have loaded and layout has settled. */
async function settle(): Promise<void> {
  await document.fonts.ready;
  await nextFrame();
  await document.fonts.ready;
}

for (const [path, module] of Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))) {
  const file = path.replace('../../src/', '');
  // Composing can throw for a story file that is mid-edit; surface it as a failing test.
  let stories: Record<string, ComposedStory>;
  try {
    stories = compose(module);
  } catch (error) {
    describe(file, () => {
      it('composes its stories', () => {
        throw error;
      });
    });
    continue;
  }

  describe(file, () => {
    for (const [exportName, Story] of Object.entries(stories)) {
      const visual = (Story.parameters['visual'] ?? {}) as VisualParameters;
      if (visual.disable) continue;

      it(`${Story.id} (${exportName})`, async () => {
        const screen = await render(
          <div
            data-visual-frame
            style={{
              inlineSize: visual.width ?? DEFAULT_WIDTH,
              ...(visual.height === undefined ? {} : { minBlockSize: visual.height }),
            }}
          >
            <DSProvider>
              <Story />
            </DSProvider>
          </div>,
        );
        const frame = screen.container.querySelector<HTMLElement>('[data-visual-frame]');
        if (!frame) throw new Error('Visual frame did not render.');

        await settle();
        if (visual.play) {
          await Story.play?.({ canvasElement: frame });
          await settle();
        }

        const target = visual.selector
          ? page.elementLocator(
              document.querySelector(visual.selector) ??
                (() => {
                  throw new Error(`No element matches visual.selector "${visual.selector}".`);
                })(),
            )
          : page.elementLocator(frame);
        await expect.element(target).toMatchScreenshot(Story.id, {
          comparatorName: 'pixelmatch',
          comparatorOptions: { threshold: 0.2, allowedMismatchedPixelRatio: 0.002 },
        });

        // Leave no hover or focus behind for the next story.
        await userEvent.unhover(frame);
      });
    }
  });
}
