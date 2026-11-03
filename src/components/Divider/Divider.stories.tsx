import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { StoryFrame } from '../../test/StoryFrame';
import { Stack } from '../Stack';
import { Divider } from './Divider';

const meta = {
  title: 'Layout/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'inline-radio', options: ['subtle', 'default', 'strong', 'dashed'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame width={320}>
        <Stack gap={3}>
          <p style={{ margin: 0, color: 'var(--ds-text)' }}>Above the line</p>
          <Story />
          <p style={{ margin: 0, color: 'var(--ds-text)' }}>Below the line</p>
        </Stack>
      </StoryFrame>
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

/** The total-row rule: dashed, for the line above a total (AGENTS.md section 7). */
export const Dashed: Story = { args: { variant: 'dashed' } };

/** The dashed rule inside the paper scope. */
export const DashedOnPaper: Story = {
  args: { variant: 'dashed' },
  decorators: [
    (Story) => (
      <StoryFrame width={320} theme="paper" padding={4}>
        <Story />
      </StoryFrame>
    ),
  ],
};

/** A vertical divider stretches to the height of a row. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 'var(--ds-space-3)',
          blockSize: 'var(--ds-control-h-md)',
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
    <StoryFrame width={320}>
      <Stack gap={4}>
        <Divider variant="subtle" />
        <Divider variant="default" />
        <Divider variant="strong" />
        <Divider variant="dashed" />
      </Stack>
    </StoryFrame>
  ),
  decorators: [],
};
