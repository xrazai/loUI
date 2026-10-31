import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { CalendarIcon, CircleCheckIcon, StarIcon } from '../Icon';
import { NavItem } from './NavItem';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/NavItem',
  component: NavItem,
  tags: ['autodocs'],
  args: { children: 'Orders', href: '#orders', icon: StarIcon },
  decorators: [
    (Story) => (
      <StoryFrame width={240}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Orders' });
    await expect(link.tagName).toBe('A');
    await expect(link).not.toHaveAttribute('aria-current');
  },
};

export const Active: Story = {
  args: { isActive: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Orders' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

/** Without an href the item is a button that runs onPress. */
const onButtonPress = fn();

export const AsButton: Story = {
  render: () => (
    <NavItem icon={StarIcon} onPress={onButtonPress}>
      Orders
    </NavItem>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Orders' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(onButtonPress).toHaveBeenCalledTimes(2);
  },
};

export const WithoutIcon: Story = {
  render: () => <NavItem href="#orders">Orders</NavItem>,
};

export const WithCount: Story = {
  args: { count: 3, countLabel: '3 pending', countTone: 'warning' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Orders 3 pending' }),
    ).toBeInTheDocument();
  },
};

export const CountTones: Story = {
  render: () => (
    <nav aria-label="Examples">
      <NavItem href="#a" icon={StarIcon} count={4} countLabel="4 in total">
        Neutral
      </NavItem>
      <NavItem href="#b" icon={CalendarIcon} count={2} countLabel="2 open" countTone="accent">
        Accent
      </NavItem>
      <NavItem
        href="#c"
        icon={CircleCheckIcon}
        count={18}
        countLabel="18 shipped"
        countTone="success"
      >
        Success
      </NavItem>
      <NavItem href="#d" icon={StarIcon} count={3} countLabel="3 pending" countTone="warning">
        Warning
      </NavItem>
      <NavItem href="#e" icon={StarIcon} count={1} countLabel="1 late" countTone="danger">
        Danger
      </NavItem>
    </nav>
  ),
};

/** A count of 0 shows no pill. */
export const ZeroCountHidden: Story = {
  args: { count: 0, countLabel: '0 pending' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Orders' })).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link')).toHaveAttribute('aria-disabled', 'true');
  },
};

export const LongLabel: Story = {
  args: {
    children: 'Purchase orders awaiting supplier confirmation and payment approval',
    count: 12,
    countLabel: '12 pending',
  },
};

const navigate = fn();

/** With DSProvider routing, pressing the link calls navigate instead of reloading the page. */
export const RouterNavigation: Story = {
  args: { href: '/orders' },
  render: (args) => (
    <DSProvider navigate={navigate}>
      <NavItem {...args} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('link', { name: 'Orders' }));
    await expect(navigate).toHaveBeenCalledWith('/orders', undefined);
  },
};

export const PortugueseCount: Story = {
  args: { children: 'Pedidos', count: 1248, countLabel: '1.248 pendentes' },
  render: (args) => (
    <DSProvider locale="pt-BR">
      <NavItem {...args} />
    </DSProvider>
  ),
};

export const RightToLeft: Story = {
  args: { isActive: true, count: 3, countLabel: '3 pending' },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const Focused: Story = {
  args: { isActive: true },
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
