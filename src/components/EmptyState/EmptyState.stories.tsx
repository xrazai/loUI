import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { Icon, SearchIcon } from '../Icon';
import { EmptyState } from './EmptyState';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No orders found',
    description: 'Try another filter or search term.',
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    title: 'No orders yet',
    description: 'Orders created here or in the store appear in this list.',
    action: <Button variant="primary">Create order</Button>,
    secondaryAction: <Button>Import CSV</Button>,
  },
};

export const Compact: Story = {
  args: {
    compact: true,
    title: 'No comments',
    description: 'Write the first comment to start the conversation.',
    action: <Button size="sm">Add comment</Button>,
  },
};

export const WithoutBorder: Story = { args: { bordered: false } };

export const WithIcon: Story = { args: { icon: <Icon icon={SearchIcon} size="lg" /> } };

export const TitleOnly: Story = { args: { description: undefined } };

export const LongText: Story = {
  args: {
    title: 'No orders match the filters you selected for the last thirty days in this warehouse',
    description:
      'Remove one of the filters, widen the date range, or search by customer name, order number or tracking code instead.',
    action: <Button>Clear all filters</Button>,
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  args: { action: <Button>Clear filters</Button> },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
