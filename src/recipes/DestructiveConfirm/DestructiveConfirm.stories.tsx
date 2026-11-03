import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { clearToastsAfterStory, expectToast, recipeDecorator, whenVisible } from '../storybook';
import { DestructiveConfirm } from './DestructiveConfirm';

const meta = {
  title: 'Recipes/DestructiveConfirm',
  component: DestructiveConfirm,
  tags: ['autodocs'],
  decorators: [recipeDecorator({ maxWidth: 720, minHeight: 420 })],
  beforeEach: clearToastsAfterStory,
  parameters: {
    visual: { width: 752 },
    docs: { story: { inline: false, iframeHeight: 480 } },
  },
} satisfies Meta<typeof DestructiveConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

async function openConfirm(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'More actions for order #1048' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete order' }));
  return whenVisible(screen.findByRole('alertdialog', { name: 'Delete order #1048?' }));
}

/** Deleting asks first. Focus starts on Cancel, so Enter right away keeps the order. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openConfirm(canvasElement);
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(within(canvasElement).getByRole('rowheader', { name: 'Contoso' })).toBeVisible();
  },
};

/** After confirming, the row leaves at once and a toast offers Undo. */
export const DeleteAndUndo: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openConfirm(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete order #1048' }));
    await expectToast(/Order #1048 deleted/);
    await expect(within(canvasElement).queryByRole('rowheader', { name: 'Contoso' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect(
      await within(canvasElement).findByRole('rowheader', { name: 'Contoso' }),
    ).toBeVisible();
  },
};

/** The state after confirming: the row is gone and the Undo toast is showing. TEST-012. */
export const DeletedToast: Story = {
  parameters: {
    visual: { play: true, selector: '[role="region"][aria-label="Toast notifications"]' },
  },
  play: async ({ canvasElement }) => {
    const dialog = await openConfirm(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete order #1048' }));
    await expectToast(/Order #1048 deleted/);
    await expect(screen.getByRole('button', { name: 'Undo' })).toBeVisible();
  },
};

/** The confirmation open, for the visual review. */
export const ConfirmationOpen: Story = {
  parameters: { visual: { play: true, selector: '[role="alertdialog"]' } },
  play: async ({ canvasElement }) => {
    await openConfirm(canvasElement);
  },
};
