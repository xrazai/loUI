import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ColorOption } from './ColorOption';

const colors = [
  { color: '#1f3a93', label: 'Navy' },
  { color: '#c0392b', label: 'Brick red' },
  { color: '#27ae60', label: 'Green' },
  { color: '#f1c40f', label: 'Mustard' },
];

const meta = {
  title: 'Patterns/ColorOption',
  component: ColorOption,
  tags: ['autodocs'],
  args: { color: '#1f3a93', label: 'Navy', onChange: fn() },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ColorOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Navy' });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  },
};

export const Selected: Story = { args: { defaultSelected: true } };

export const WithMark: Story = { args: { mark: '12 left' } };

export const SelectedWithMark: Story = { args: { mark: 'Default', defaultSelected: true } };

export const Disabled: Story = { args: { isDisabled: true } };

export const DisabledSelected: Story = { args: { isDisabled: true, defaultSelected: true } };

export const LongLabel: Story = {
  args: { label: 'Midnight navy blue with a very long marketing name', mark: 'Default' },
};

export const LightColor: Story = { args: { color: '#ffffff', label: 'White' } };

export const DarkColor: Story = { args: { color: '#000000', label: 'Black' } };

function GroupExample() {
  const [selected, setSelected] = useState<string[]>(['Navy']);
  return (
    <div
      role="group"
      aria-label="Available colors"
      style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
    >
      {colors.map(({ color, label }) => (
        <ColorOption
          key={label}
          color={color}
          label={label}
          isSelected={selected.includes(label)}
          onChange={(on) => {
            setSelected((current) =>
              on ? [...current, label] : current.filter((value) => value !== label),
            );
          }}
        />
      ))}
    </div>
  );
}

/** Several options in a named group: each toggles on its own (any number of colors). */
export const InAGroup: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 420 }}>
        <Story />
      </div>
    ),
  ],
  render: () => <GroupExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Green' }));
    await expect(canvas.getByRole('button', { name: 'Green' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(canvas.getByRole('button', { name: 'Navy' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

/** Every option is a tab stop; Space and Enter toggle. */
export const KeyboardToggle: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Navy' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
  },
};

export const RightToLeft: Story = {
  args: { defaultSelected: true },
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ maxInlineSize: 240 }}>
        <Story />
      </div>
    ),
  ],
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
