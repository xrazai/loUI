import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Rating } from './Rating';

const meta = {
  title: 'Components/Rating',
  component: Rating,
  tags: ['autodocs'],
  args: { value: 4 },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'number', min: 0, max: 5, step: 0.5 } },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('img', { name: '4 out of 5 stars' }),
    ).toBeVisible();
  },
};

export const HalfStar: Story = { args: { value: 3.5 } };

export const Empty: Story = { args: { value: 0 } };

export const Full: Story = { args: { value: 5 } };

export const WithValue: Story = { args: { value: 3.5, showValue: true } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-3)', justifyItems: 'start' }}>
      <Rating {...args} size="sm" />
      <Rating {...args} size="md" />
      <Rating {...args} size="lg" />
    </div>
  ),
};

export const CustomScale: Story = { args: { value: 7, max: 10, showValue: true } };

export const OutOfRange: Story = { args: { value: 12 } };

export const RightToLeft: Story = {
  args: { value: 3.5, showValue: true },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
