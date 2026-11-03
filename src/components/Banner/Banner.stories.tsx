import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { Banner } from './Banner';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/Banner',
  component: Banner,
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
      <StoryFrame maxWidth={720}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = {
  args: {
    tone: 'success',
    title: 'Import finished',
    children: 'All 240 rows were added.',
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Trial ends in 3 days',
    children: 'Choose a plan to keep your data.',
    action: <Button size="sm">Choose plan</Button>,
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

/** Urgent banners use `role="alert"` and interrupt screen readers. Use them only when they appear while the user is working. */
export const Urgent: Story = {
  args: {
    tone: 'danger',
    urgent: true,
    title: 'Connection lost',
    children: 'Changes are not being saved.',
  },
};

/** A banner added after the page loaded is a polite live region. */
export const Announced: Story = {
  args: { announce: true, tone: 'success', title: 'Back online', children: undefined },
};

export const TitleOnly: Story = { args: { children: undefined } };

export const TextOnly: Story = { args: { title: undefined } };

function DismissibleBanner() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Banner
      title="New version available"
      onDismiss={() => {
        setOpen(false);
      }}
    >
      Reload the page to update.
    </Banner>
  ) : (
    <p>Banner dismissed.</p>
  );
}

/** Tab to the dismiss button, press Enter. */
export const Dismissible: Story = {
  render: () => <DismissibleBanner />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Dismiss banner' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Banner dismissed.')).toBeVisible();
  },
};

export const LongText: Story = {
  args: {
    tone: 'danger',
    title:
      'The import stopped because the file contains rows that could not be matched to a product',
    children:
      'Row 128 has the code REF-1048-REF-1048-REF-1048-REF-1048-REF-1048-REF-1048 which is not in the catalog. Fix the file and import it again.',
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
      <Banner title="Information">Neutral message.</Banner>
      <Banner tone="success" title="Success">
        Something went well.
      </Banner>
      <Banner tone="warning" title="Warning">
        Check this before continuing.
      </Banner>
      <Banner tone="danger" title="Error">
        Something failed. Try again.
      </Banner>
    </div>
  ),
};

export const RightToLeft: Story = {
  args: { onDismiss: () => undefined, action: <Button size="sm">Details</Button> },
  decorators: [
    (Story) => (
      <StoryFrame dir="rtl" maxWidth={720}>
        <Story />
      </StoryFrame>
    ),
  ],
};
