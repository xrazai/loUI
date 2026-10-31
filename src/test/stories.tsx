/**
 * Shared story discovery for the cross-cutting accessibility suites (TOK-013, TEST-014).
 *
 * Same approach as the visual harness (tests/visual/stories.visual.test.tsx): every
 * `src/**\/*.stories.tsx` is composed with the project annotations, so a story added later is
 * covered without editing the suites. Stories with `parameters.visual.disable` are skipped
 * (animated, random or time dependent); `parameters.visual.play` stories run their play function
 * first so open/focus states are measured too.
 */
import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { render } from 'vitest-browser-react';
import * as previewAnnotations from '../../.storybook/preview';
import { toast } from '../components/Toast';
import { DSProvider } from '../providers/DSProvider';

setProjectAnnotations([previewAnnotations]);

interface VisualParameters {
  disable?: boolean;
  play?: boolean;
  width?: number;
}

interface ComposedStory {
  (): ReactElement | null;
  id: string;
  parameters: Record<string, unknown>;
  play?: (context: { canvasElement: HTMLElement }) => Promise<void>;
}

export interface StoryEntry {
  /** Path relative to `src/`, for example `components/Button/Button.stories.tsx`. */
  file: string;
  exportName: string;
  /** Storybook id, for example `components-button--primary`. */
  id: string;
  Story: ComposedStory;
  visual: VisualParameters;
}

const compose = composeStories as unknown as (
  module: Record<string, unknown>,
) => Record<string, ComposedStory>;
const modules = import.meta.glob<Record<string, unknown>>('../**/*.stories.tsx', { eager: true });

/** Every enabled story in the repository, sorted by file then export. */
export function allStories(): StoryEntry[] {
  const entries: StoryEntry[] = [];
  for (const [path, module] of Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))) {
    const file = path.replace('../', '');
    for (const [exportName, Story] of Object.entries(compose(module))) {
      const visual = (Story.parameters['visual'] ?? {}) as VisualParameters;
      if (visual.disable) continue;
      entries.push({ file, exportName, id: Story.id, Story, visual });
    }
  }
  return entries;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

/** Resolves once fonts have loaded, layout has settled and finite animations are done. */
export async function settle(): Promise<void> {
  await document.fonts.ready;
  await nextFrame();
  const finite = document
    .getAnimations()
    .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);
  await Promise.race([
    Promise.allSettled(finite.map((animation) => animation.finished)),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
  await nextFrame();
}

export interface RenderedStory {
  /** The frame element that wraps the story. */
  frame: HTMLElement;
  unmount: () => Promise<void> | void;
}

/**
 * Renders one story in a frame of the given width (default: the story's visual width or 384)
 * inside `DSProvider`, runs its play function when it opts in, and settles.
 */
export async function renderStory(
  entry: StoryEntry,
  { width }: { width?: number | string } = {},
): Promise<RenderedStory> {
  toast.clear();
  const { Story } = entry;
  const screen = await render(
    <div
      data-story-frame
      style={{
        boxSizing: 'border-box',
        inlineSize: width ?? entry.visual.width ?? 384,
        maxInlineSize: '100%',
        padding: 16,
        background: 'var(--ds-bg)',
        color: 'var(--ds-text)',
      }}
    >
      <DSProvider>
        <Story />
      </DSProvider>
    </div>,
  );
  const frame = screen.container.querySelector<HTMLElement>('[data-story-frame]');
  if (!frame) throw new Error('Story frame did not render.');
  await settle();
  if (entry.visual.play) {
    await Story.play?.({ canvasElement: frame });
    await settle();
  }
  return {
    frame,
    unmount: async () => {
      toast.clear();
      await screen.unmount();
    },
  };
}
