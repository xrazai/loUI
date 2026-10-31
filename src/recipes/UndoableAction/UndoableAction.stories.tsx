import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import { clearToastsAfterStory, expectToast, recipeDecorator } from '../storybook';
import { UndoableAction } from './UndoableAction';

const meta = {
  title: 'Recipes/UndoableAction',
  component: UndoableAction,
  tags: ['autodocs'],
  decorators: [recipeDecorator({ maxWidth: 560, minHeight: 320 })],
  beforeEach: clearToastsAfterStory,
  parameters: {
    visual: { width: 592 },
    docs: { story: { inline: false, iframeHeight: 360 } },
  },
} satisfies Meta<typeof UndoableAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** No confirmation: the order is archived at once and Undo brings it back. */
export const ArchiveAndUndo: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Archive order #1051' }));
    await expectToast(/Order #1051 archived/);
    await expect(canvas.getByText('2 open, 1 archived')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect(await canvas.findByText('3 open, 0 archived')).toBeVisible();
  },
};
