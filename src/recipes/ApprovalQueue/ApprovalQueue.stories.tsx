import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import { clearToastsAfterStory, expectToast, recipeDecorator } from '../storybook';
import { ApprovalQueue } from './ApprovalQueue';

const meta = {
  title: 'Recipes/ApprovalQueue',
  component: ApprovalQueue,
  tags: ['autodocs'],
  decorators: [recipeDecorator({ maxWidth: 720, minHeight: 760 })],
  beforeEach: clearToastsAfterStory,
  parameters: { docs: { story: { inline: false, iframeHeight: 800 } } },
} satisfies Meta<typeof ApprovalQueue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Send acts at once and offers Undo; nothing asks to confirm. */
export const SendAndUndo: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('article', { name: /buyer_sp/ });
    await userEvent.click(within(card).getByRole('button', { name: 'Send reply' }));
    await expectToast(/Reply to buyer_sp sent/);
    await expect(canvas.getAllByRole('article')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect(await canvas.findAllByRole('article')).toHaveLength(2);
  },
};

export const EmptyQueue: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const author of ['buyer_sp', 'mara_k']) {
      const card = canvas.getByRole('article', { name: new RegExp(author) });
      await userEvent.click(within(card).getByRole('button', { name: 'Discard reply' }));
    }
    await expect(await canvas.findByRole('heading', { name: 'Nothing to review' })).toBeVisible();
  },
};
