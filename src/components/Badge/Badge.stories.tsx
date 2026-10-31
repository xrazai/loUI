import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Draft' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Accent: Story = { args: { tone: 'accent', children: 'In progress' } };
export const Success: Story = { args: { tone: 'success', children: 'Shipped' } };
export const Warning: Story = { args: { tone: 'warning', children: 'Pending' } };
export const Danger: Story = { args: { tone: 'danger', children: 'Failed' } };

export const WithoutDot: Story = { args: { dot: false, tone: 'success', children: 'Paid' } };

export const AllTones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-space-2)', flexWrap: 'wrap' }}>
      <Badge>Draft</Badge>
      <Badge tone="accent">In progress</Badge>
      <Badge tone="success">Shipped</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="danger">Failed</Badge>
    </div>
  ),
};

export const LongText: Story = {
  args: { tone: 'warning', children: 'Waiting for supplier confirmation of the delivery date' },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Badge tone="success">Shipped</Badge>
    </div>
  ),
};
