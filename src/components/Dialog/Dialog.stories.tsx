import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Input } from '../Input';
import { Sheet } from '../Sheet';
import { Dialog } from './Dialog';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  args: {
    trigger: <Button>Edit customer</Button>,
    title: 'Edit customer',
    description: 'Changes apply to new orders only.',
    children: <Input label="Name" />,
    footer: ({ close }) => (
      <>
        <Button onPress={close}>Cancel</Button>
        <Button variant="primary" onPress={close}>
          Save customer
        </Button>
      </>
    ),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  // Open dialogs cover the page, so the docs page renders each story in its own frame.
  parameters: { docs: { story: { inline: false, iframeHeight: 420 } } },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The keyboard contract: open, focus moves in, Tab stays inside, Escape closes, focus returns. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Edit customer' });
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Edit customer' });
    await expect(dialog).toHaveAccessibleDescription('Changes apply to new orders only.');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    for (let step = 0; step < 6; step += 1) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Open for the visual review. */
export const Open: Story = { args: { defaultOpen: true } };

export const Medium: Story = { args: { defaultOpen: true, size: 'md' } };
export const Large: Story = { args: { defaultOpen: true, size: 'lg' } };

export const WithoutBody: Story = {
  args: { defaultOpen: true, children: undefined, description: 'You can edit it again later.' },
};

export const LongContent: Story = {
  args: {
    defaultOpen: true,
    title: 'Terms of service',
    children: Array.from({ length: 30 }, (_, index) => (
      <p key={index} style={{ margin: 0 }}>
        Paragraph {index + 1}. The body scrolls while the header and the footer stay in view.
      </p>
    )),
  },
};

export const LongTitle: Story = {
  args: {
    defaultOpen: true,
    title:
      'Update the delivery address and the invoicing contact of all the open orders of this customer',
  },
};

/** A Dialog opened from a Sheet. Escape closes the Dialog first and leaves the Sheet open. */
export const InsideSheet: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
  render: () => (
    <Sheet
      defaultOpen
      title="Order"
      meta="ORD-1048"
      footerStart={
        <Dialog
          trigger={<Button variant="danger">Delete order</Button>}
          title="Delete order #1048?"
          description="The order will be removed."
          footer={({ close }) => <Button onPress={close}>Cancel</Button>}
        />
      }
    >
      <p style={{ margin: 0 }}>Order details</p>
    </Sheet>
  ),
  play: async () => {
    const sheet = await screen.findByRole('dialog', { name: 'Order' });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Delete order' }));
    await screen.findByRole('dialog', { name: 'Delete order #1048?' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1));
    await expect(screen.getByRole('dialog', { name: 'Order' })).toBeVisible();
    await waitFor(() =>
      expect(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete order' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};

export const RightToLeft: Story = {
  args: { defaultOpen: true },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
