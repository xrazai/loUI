import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { Link } from './Link';

const meta = {
  title: 'Components/Link',
  component: Link,
  tags: ['autodocs'],
  args: { href: '#pricing', children: 'Pricing details' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Pricing details' });
    await expect(link).toHaveStyle({ textDecorationLine: 'underline' });
  },
};

/** In running text the underline is part of the design: color alone does not identify a link. */
export const InText: Story = {
  render: (args) => (
    <p style={{ maxInlineSize: 'calc(var(--ds-space-16) * 6)', margin: 0 }}>
      Orders are billed monthly. Read the <Link {...args} /> before you change a plan, or contact
      support.
    </p>
  ),
};

/** No underline at rest. Use it only where the context makes the link obvious. */
export const Standalone: Story = {
  args: { variant: 'standalone', children: 'View all orders' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'View all orders' });
    await expect(link).toHaveStyle({ textDecorationLine: 'none' });
  },
};

/** Opens a new tab: `rel` is set, an icon shows it, and screen readers hear it. */
export const External: Story = {
  args: { href: 'https://example.com/docs', target: '_blank', children: 'Documentation' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /Documentation/ });
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAccessibleName('Documentation (opens in a new tab)');
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link')).toHaveAttribute('aria-disabled', 'true');
  },
};

const navigate = fn();

/** Keyboard: Tab focuses, Enter follows the link through the router set on DSProvider. */
export const KeyboardActivation: Story = {
  args: { onPress: fn(), href: '/pricing' },
  render: (args) => (
    <DSProvider navigate={navigate}>
      <Link {...args} />
    </DSProvider>
  ),
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Pricing details' });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    await expect(navigate).toHaveBeenCalledWith('/pricing', undefined);
  },
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
