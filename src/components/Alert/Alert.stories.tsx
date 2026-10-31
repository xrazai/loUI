import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { Alert } from './Alert';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: {
    title: 'Scheduled maintenance',
    children: 'Sunday, 02:00 to 03:00 UTC. Saving is unavailable during this time.',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={520}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = {
  args: {
    tone: 'success',
    title: 'Order shipped',
    children: 'The customer received the tracking code.',
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Low stock',
    children: '3 rolls of linen are left. Reorder to avoid delays.',
  },
};

export const Danger: Story = {
  args: {
    tone: 'danger',
    title: 'Payment declined',
    children: 'The card ending in 4242 was declined. Use another card.',
    action: <a href="#card">Update card</a>,
  },
};

/** Urgent alerts use `role="alert"` and interrupt screen readers. Reserve them for failures that need attention now. */
export const Urgent: Story = {
  args: {
    tone: 'danger',
    urgent: true,
    title: 'Connection lost',
    children: 'Changes are not being saved. Check your connection.',
  },
};

/** A static notice that is part of the page from the start has no live region role. */
export const StaticNotice: Story = {
  args: { announce: false },
};

export const TitleOnly: Story = {
  args: { children: undefined, title: 'Changes saved', tone: 'success' },
};

export const TextOnly: Story = { args: { title: undefined } };

export const WithAction: Story = {
  args: {
    tone: 'warning',
    title: 'Trial ends in 3 days',
    children: 'Choose a plan to keep your orders and reports.',
    action: <Button size="sm">Choose plan</Button>,
  },
};

function DismissibleAlert() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert
      tone="success"
      title="Export ready"
      onDismiss={() => {
        setOpen(false);
      }}
    >
      Your file is in the downloads list.
    </Alert>
  ) : (
    <p style={{ margin: 0 }}>Alert dismissed.</p>
  );
}

/** Tab to the dismiss button, press Enter. */
export const Dismissible: Story = {
  render: () => <DismissibleAlert />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Dismiss alert' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Alert dismissed.')).toBeVisible();
  },
};

export const LongText: Story = {
  args: {
    tone: 'danger',
    title:
      'The import stopped because the file contains rows that could not be matched to a product',
    children:
      'Row 128 has the code ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048 which is not in the catalog. Fix the file and import it again.',
    action: <Button size="sm">Download report</Button>,
    onDismiss: () => undefined,
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={360}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const AllTones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
      <Alert title="Information">Neutral message.</Alert>
      <Alert tone="success" title="Success">
        Something went well.
      </Alert>
      <Alert tone="warning" title="Warning">
        Check this before continuing.
      </Alert>
      <Alert tone="danger" title="Error">
        Something failed. Try again.
      </Alert>
    </div>
  ),
};

export const RightToLeft: Story = {
  args: { onDismiss: () => undefined, action: <Button size="sm">Details</Button> },
  decorators: [
    (Story) => (
      <StoryFrame dir="rtl" maxWidth={520}>
        <Story />
      </StoryFrame>
    ),
  ],
};
