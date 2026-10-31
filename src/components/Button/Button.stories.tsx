import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Icon, PlusIcon } from '../Icon';
import { Button } from './Button';

const row = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--ds-space-3)',
  alignItems: 'center',
} as const;

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Create order', onPress: fn() },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'danger-solid'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Use one `primary` button per screen, at the top right of the view. */
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'View all' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete order' } };
/** The confirm button of a destructive dialog. */
export const DangerSolid: Story = { args: { variant: 'danger-solid', children: 'Delete order' } };

export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
      <Button {...args} variant="danger-solid">
        Danger solid
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  args: { leading: <Icon icon={PlusIcon} size="sm" /> },
};

export const WithTrailingShortcut: Story = {
  args: {
    children: 'Search',
    trailing: <span className="ds-mono">⌘K</span>,
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true, variant: 'primary' },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args}>Secondary</Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const buttons = within(canvasElement).getAllByRole('button');
    for (const button of buttons) await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** The button keeps its width and stays focusable while pending; presses are ignored. */
export const Pending: Story = {
  args: { isPending: true, variant: 'primary', children: 'Save changes' },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

export const PendingVariants: Story = {
  args: { isPending: true },
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Save changes
      </Button>
      <Button {...args}>Save draft</Button>
      <Button {...args} variant="ghost">
        Refresh
      </Button>
      <Button {...args} variant="danger-solid">
        Delete order
      </Button>
    </div>
  ),
};

/** Long labels wrap instead of overflowing their container. */
export const LongText: Story = {
  args: {
    children: 'Create order and send the confirmation to the customer and the warehouse',
  },
  render: (args) => (
    <div style={{ inlineSize: 'calc(var(--ds-space-16) * 4)' }}>
      <Button {...args} />
    </div>
  ),
};

/** Right-to-left layout: icons and labels swap sides through logical properties. */
export const Rtl: Story = {
  args: { leading: <Icon icon={PlusIcon} size="sm" />, children: 'Create order' },
  render: (args) => (
    <div dir="rtl">
      <Button {...args} />
    </div>
  ),
};

/** Keyboard: Tab focuses, Enter and Space press. */
export const KeyboardActivation: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Create order' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

/** Focus state shown through a play function. */
export const Focused: Story = {
  args: { variant: 'primary' },
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};

export const Hovered: Story = {
  args: { variant: 'primary' },
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};
