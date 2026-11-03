import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { ConfirmDialog } from './ConfirmDialog';

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  args: {
    trigger: <Button variant="danger">Delete order</Button>,
    title: 'Delete order #1048?',
    description: "The order and its 14 lines will be removed. This can't be undone.",
    confirmLabel: 'Delete order',
    onConfirm: fn(),
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['danger', 'neutral'] },
    initialFocus: { control: 'inline-radio', options: ['cancel', 'confirm'] },
  },
  // Open dialogs cover the page, so the docs page renders each story in its own frame.
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Initial focus is on Cancel, so Enter right after opening cancels instead of deleting. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Delete order' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete order #1048?' });
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ConfirmByKeyboard: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Delete order' }));
    const dialog = await screen.findByRole('alertdialog');
    await userEvent.tab();
    await expect(within(dialog).getByRole('button', { name: 'Delete order' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  },
};

export const EscapeCancels: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Delete order' });
    await userEvent.click(trigger);
    await screen.findByRole('alertdialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/**
 * The whole destructive flow with a pointer: opening lands focus on Cancel (not on the red
 * button), and the focus ring is part of the visual baseline. TEST-012.
 */
export const ConfirmFlow: Story = {
  parameters: { visual: { play: true, selector: '[role="alertdialog"]' } },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Delete order' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete order #1048?' });
    await waitFor(() => expect(dialog).toBeVisible());
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus(),
    );
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

/** Open for the visual review. */
export const Open: Story = {
  parameters: { visual: { selector: '[role="alertdialog"]' } },
  args: { defaultOpen: true },
};

/** A non-destructive confirmation: primary button, focus on the action. */
export const Neutral: Story = {
  parameters: { visual: { selector: '[role="alertdialog"]' } },
  args: {
    defaultOpen: true,
    tone: 'neutral',
    initialFocus: 'confirm',
    title: 'Send invoice?',
    description: 'The customer receives it by email.',
    confirmLabel: 'Send invoice',
  },
};

export const Pending: Story = {
  parameters: { visual: { selector: '[role="alertdialog"]' } },
  args: { defaultOpen: true, isPending: true, closeOnConfirm: false },
};

export const WithDetails: Story = {
  parameters: { visual: { selector: '[role="alertdialog"]' } },
  args: {
    defaultOpen: true,
    children: (
      <ul style={{ margin: 0, paddingInlineStart: 'var(--ds-space-5)' }}>
        <li>14 order lines</li>
        <li>2 attached documents</li>
      </ul>
    ),
  },
};
