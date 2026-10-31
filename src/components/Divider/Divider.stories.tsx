import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Divider } from './Divider';

const meta = {
  title: 'Layout/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'inline-radio', options: ['subtle', 'default', 'strong'] },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 320, color: 'var(--ds-text)' }}>
        <p style={{ margin: '0 0 12px' }}>Above the line</p>
        <Story />
        <p style={{ margin: '12px 0 0' }}>Below the line</p>
      </div>
    ),
  ],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('separator')).toBeInTheDocument();
  },
};

export const Subtle: Story = { args: { variant: 'subtle' } };

export const Strong: Story = { args: { variant: 'strong' } };

/** A vertical divider stretches to the height of a row. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 12,
          blockSize: 40,
          color: 'var(--ds-text)',
        }}
      >
        <span>Orders</span>
        <Story />
        <span>Customers</span>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  },
};

/** All three weights together, to compare. */
export const Weights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, inlineSize: 320 }}>
      <Divider variant="subtle" />
      <Divider variant="default" />
      <Divider variant="strong" />
    </div>
  ),
  decorators: [],
};
