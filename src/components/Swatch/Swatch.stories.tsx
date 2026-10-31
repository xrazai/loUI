import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Swatch } from './Swatch';

const meta = {
  title: 'Components/Swatch',
  component: Swatch,
  tags: ['autodocs'],
  args: { color: '#1f3a93', label: 'Navy' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Swatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Navy' })).toBeInTheDocument();
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Swatch color="#1f3a93" label="Small" size="sm" />
      <Swatch color="#1f3a93" label="Medium" />
      <Swatch color="#1f3a93" label="Large" size="lg" />
    </div>
  ),
};

/** Near-black and near-white colors stay visible thanks to the inset ring. */
export const ExtremeColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Swatch color="#000000" label="Black" size="lg" />
      <Swatch color="#ffffff" label="White" size="lg" />
      <Swatch color="#0b0b0c" label="Canvas" size="lg" />
    </div>
  ),
};

/** Next to text that already names the color, the swatch is decorative. */
export const Decorative: Story = {
  render: () => (
    <p style={{ margin: 0, color: 'var(--ds-text)' }}>
      <Swatch color="#c0392b" decorative size="sm" /> Brick red
    </p>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('img')).toBeNull();
  },
};

export const ShortHex: Story = { args: { color: '#f80', label: 'Orange' } };
