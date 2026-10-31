import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { clearToastsAfterStory, recipeDecorator, whenVisible } from '../storybook';
import { DetailSheet } from './DetailSheet';

const meta = {
  title: 'Recipes/DetailSheet',
  component: DetailSheet,
  tags: ['autodocs'],
  decorators: [recipeDecorator({ maxWidth: 720, minHeight: 480 })],
  beforeEach: clearToastsAfterStory,
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
} satisfies Meta<typeof DetailSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A row opens its details; Escape closes the sheet and returns focus to the row. */
export const OpenAndEscape: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('rowheader', { name: 'Contoso' }));
    await whenVisible(screen.findByRole('dialog', { name: 'Order' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};

/** Delete asks first. Escape closes only the confirmation; the sheet stays. */
export const DeleteConfirmation: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('rowheader', { name: 'Contoso' }));
    const sheet = await screen.findByRole('dialog', { name: 'Order' });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Delete order' }));
    await whenVisible(screen.findByRole('alertdialog', { name: 'Delete order ORD-1048?' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog', { name: /Delete/ })).toBeNull());
    await expect(screen.getByRole('dialog', { name: 'Order' })).toBeVisible();
  },
};
