import type { Decorator } from '@storybook/react-vite';
import { expect, screen, waitFor } from 'storybook/test';
import { toast } from '../index';
import { StoryFrame } from '../test/StoryFrame';
import type { StoryFrameProps } from '../test/StoryFrame';
import { RecipeHost } from './RecipeHost';

/** Wraps a recipe story with the toast region the recipes rely on, in a frame of the given size. */
export function recipeDecorator(frame: Omit<StoryFrameProps, 'children'> = {}): Decorator {
  return (Story) => (
    <RecipeHost>
      <StoryFrame {...frame}>
        <Story />
      </StoryFrame>
    </RecipeHost>
  );
}

/** Story `beforeEach`: the toast queue is shared by the page, so stories start and end clean. */
export function clearToastsAfterStory() {
  toast.clear();
  return () => {
    toast.clear();
  };
}

/** Waits for a toast with this text to finish fading in. */
export async function expectToast(text: RegExp): Promise<void> {
  const element = await screen.findByText(text);
  await waitFor(() => expect(element).toBeVisible());
}

/** Resolves once the element a query found has finished its enter animation. */
export async function whenVisible(found: Promise<HTMLElement>): Promise<HTMLElement> {
  const element = await found;
  await waitFor(() => expect(element).toBeVisible());
  return element;
}
