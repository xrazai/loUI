import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { clearToastsAfterStory, expectToast, recipeDecorator } from '../storybook';
import { SettingsPage } from './SettingsPage';

const meta = {
  title: 'Recipes/SettingsPage',
  component: SettingsPage,
  tags: ['autodocs'],
  args: { onSave: fn() },
  // The shell fills its parent, so the frame gives it a height.
  decorators: [recipeDecorator({ height: 640 })],
  beforeEach: clearToastsAfterStory,
  parameters: {
    visual: { width: 1000 },
    layout: 'fullscreen',
    docs: { story: { inline: false, iframeHeight: 680 } },
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Change a setting and save with the button; the toast confirms. */
export const SaveWithButton: Story = {
  parameters: {
    visual: { play: true, selector: '[role="region"][aria-label="Toast notifications"]' },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByRole('switch', { name: /Weekly summary/ }).closest('label');
    if (label) await userEvent.click(label);
    await userEvent.click(canvas.getByRole('button', { name: /Save settings/ }));
    await expectToast(/Settings saved/);
    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ weeklySummary: true }),
    );
  },
};

/** The primary action also answers to its shortcut. */
export const SaveWithShortcut: Story = {
  play: async ({ canvasElement, args }) => {
    within(canvasElement)
      .getByRole('switch', { name: /Order shipped/ })
      .focus();
    await userEvent.keyboard('{Control>}s{/Control}');
    await expect(args.onSave).toHaveBeenCalledTimes(1);
  },
};
