import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { clearToastsAfterStory, recipeDecorator, whenVisible } from '../storybook';
import { SheetForm } from './SheetForm';

const meta = {
  title: 'Recipes/SheetForm',
  component: SheetForm,
  tags: ['autodocs'],
  args: { onSave: fn() },
  decorators: [recipeDecorator({ maxWidth: 720, minHeight: 480 })],
  beforeEach: clearToastsAfterStory,
  parameters: {
    visual: { width: 752 },
    docs: { story: { inline: false, iframeHeight: 520 } },
  },
} satisfies Meta<typeof SheetForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

async function openSheet(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'New supplier' }));
  return whenVisible(screen.findByRole('dialog', { name: 'New supplier' }));
}

/** The footer button submits a form it is not inside: the empty form is blocked and the first field takes focus. */
export const ValidationFromFooter: Story = {
  parameters: { visual: { play: true, selector: '[role="dialog"]' } },
  play: async ({ canvasElement }) => {
    const sheet = await openSheet(canvasElement);
    await userEvent.click(within(sheet).getByRole('button', { name: 'Save supplier' }));
    await waitFor(() => expect(within(sheet).getByRole('textbox', { name: /Name/ })).toHaveFocus());
    await expect(within(sheet).getByText("Enter the supplier's name.")).toBeVisible();
  },
};

/** The sheet open and empty, for the visual review. */
export const SheetOpen: Story = {
  parameters: { visual: { play: true, selector: '[role="dialog"]' } },
  play: async ({ canvasElement }) => {
    await openSheet(canvasElement);
  },
};
