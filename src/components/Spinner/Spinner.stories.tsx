import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Spinner } from './Spinner';

const row = {
  display: 'flex',
  gap: 'var(--ds-space-4)',
  alignItems: 'center',
} as const;

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  // A moving spinner would make the visual baseline flaky; the harness also disables animations.
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('progressbar', { name: 'Loading' })).toBeVisible();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Spinner {...args} size="sm" />
      <Spinner {...args} size="md" />
      <Spinner {...args} size="lg" />
    </div>
  ),
};

/** Say what is loading when the page has more than one busy area. */
export const WithLabel: Story = {
  args: { label: 'Loading orders' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('progressbar', { name: 'Loading orders' }),
    ).toBeVisible();
  },
};

/** Visible status text next to the spinner; the spinner itself is hidden from assistive technology. */
export const DecorativeWithText: Story = {
  args: { decorative: true, size: 'sm' },
  render: (args) => (
    <p role="status" style={{ ...row, gap: 'var(--ds-space-2)', color: 'var(--ds-text-2)' }}>
      <Spinner {...args} />
      Saving changes
    </p>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('progressbar')).toBeNull();
  },
};

/** Inherits the text color of its container. */
export const InheritsColor: Story = {
  render: (args) => (
    <div style={{ ...row, color: 'var(--ds-accent)' }}>
      <Spinner {...args} />
    </div>
  ),
};
