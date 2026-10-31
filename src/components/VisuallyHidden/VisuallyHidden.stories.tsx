import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisuallyHidden } from './VisuallyHidden';

const meta = {
  title: 'Primitives/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <button type="button">
      <span aria-hidden="true">x</span>
      <VisuallyHidden {...args}>Close dialog</VisuallyHidden>
    </button>
  ),
};

export const AsHeading: Story = {
  args: { as: 'h2', children: 'Section heading for screen readers' },
};
