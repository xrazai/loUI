import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { InlineConfirm } from './InlineConfirm';

const meta = {
  title: 'Components/InlineConfirm',
  component: InlineConfirm,
  tags: ['autodocs'],
  args: {
    label: 'Delete line',
    prompt: "Remove this line? This can't be undone.",
    onConfirm: fn(),
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['danger', 'neutral'] },
    initialFocus: { control: 'inline-radio', options: ['cancel', 'confirm'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof InlineConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Enter on the trigger opens the prompt with focus on Cancel; Enter again cancels, it never confirms. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Cancel' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Delete line' })).toHaveFocus());
  },
};

export const Asking: Story = { args: { defaultOpen: true } };

export const EscapeCancels: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete line' }));
    await expect(canvas.getByRole('group')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('group')).toBeNull());
    await expect(canvas.getByRole('button', { name: 'Delete line' })).toHaveFocus();
  },
};

export const ConfirmByKeyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete line' }));
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledTimes(1));
  },
};

export const FocusOnConfirm: Story = {
  args: { defaultOpen: true, initialFocus: 'confirm', tone: 'neutral', label: 'Send invoice' },
};

export const Neutral: Story = {
  args: { tone: 'neutral', label: 'Send invoice', prompt: 'Send it to the customer?' },
};

export const Small: Story = { args: { size: 'sm', defaultOpen: true } };

export const DefaultPrompt: Story = { args: { prompt: undefined, defaultOpen: true } };

export const Disabled: Story = { args: { isDisabled: true } };
