import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AgentCard } from './AgentCard';

const meta = {
  title: 'Patterns/AgentCard',
  component: AgentCard,
  tags: ['autodocs'],
  args: {
    name: 'Marketplace agent',
    area: 'Marketplace',
    icon: ShoppingBag,
    description:
      'Answers buyer questions and reviews of the store. You approve every reply before it is sent.',
    lastActivity: 'Last reply sent at 08:40',
    status: 'active',
    pending: 4,
    onOpen: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['testing', 'active', 'paused', 'soon'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AgentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Marketplace agent' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
  },
};

export const Testing: Story = { args: { status: 'testing' } };

export const Paused: Story = { args: { status: 'paused', pending: 0 } };

export const ComingSoon: Story = {
  args: {
    name: 'Chat agent',
    area: 'Support',
    icon: MessageCircle,
    status: 'soon',
    description: 'Will draft an order from the conversation.',
    lastActivity: undefined,
    pending: 0,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const AsLink: Story = { args: { href: '#marketplace-agent' } };

export const NothingPending: Story = { args: { pending: 0 } };

export const LongText: Story = {
  args: {
    name: 'Marketplace reviews and questions agent with a very long name that wraps',
    area: 'Marketplace and storefront customer service',
    pending: 1240,
    lastActivity: 'Last reply sent yesterday at 18:40 to a buyer in another time zone',
  },
};

export const WithoutIcon: Story = {
  render: (args) => {
    const props = { ...args };
    delete props.icon;
    return <AgentCard {...props} />;
  },
};

export const Grid: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 'none' }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <ul
      style={{
        display: 'grid',
        gap: 16,
        margin: 0,
        padding: 0,
        listStyle: 'none',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      }}
    >
      <li>
        <AgentCard {...args} />
      </li>
      <li>
        <AgentCard
          {...args}
          name="Support agent"
          status="testing"
          icon={MessageCircle}
          pending={0}
        />
      </li>
      <li>
        <AgentCard {...args} name="Chat agent" status="soon" pending={0} lastActivity={undefined} />
      </li>
    </ul>
  ),
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
