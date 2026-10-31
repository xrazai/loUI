import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EllipsisIcon, PlusIcon, SearchIcon, XIcon } from '../Icon';
import { IconButton } from './IconButton';

const row = {
  display: 'flex',
  gap: 'var(--ds-space-3)',
  alignItems: 'center',
} as const;

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { label: 'Add order', icon: PlusIcon, onPress: fn() },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Ghost: Story = {
  args: { variant: 'ghost', label: 'More actions', icon: EllipsisIcon },
};

export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <IconButton {...args} variant="secondary" />
      <IconButton {...args} variant="ghost" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
      <IconButton {...args} size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <div style={row}>
      <IconButton {...args} variant="secondary" />
      <IconButton {...args} variant="ghost" />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    for (const button of within(canvasElement).getAllByRole('button')) {
      await userEvent.click(button);
    }
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** Typical toolbar: every button is named, none shows a visible label. */
export const Toolbar: Story = {
  render: (args) => (
    <div role="toolbar" aria-label="Order actions" style={row}>
      <IconButton {...args} variant="ghost" label="Search orders" icon={SearchIcon} />
      <IconButton {...args} variant="ghost" label="Add order" icon={PlusIcon} />
      <IconButton {...args} variant="ghost" label="Close panel" icon={XIcon} />
    </div>
  ),
};

/** The name is the `label`, there is no `title` attribute. */
export const AccessibleName: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Add order' });
    await expect(button).not.toHaveAttribute('title');
    await expect(button).toHaveAttribute('aria-label', 'Add order');
  },
};

/** Keyboard: Tab focuses, Enter and Space press. */
export const KeyboardActivation: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Add order' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};

export const Hovered: Story = {
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};
