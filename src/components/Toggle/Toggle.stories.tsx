import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { Icon, StarIcon } from '../Icon';
import { StoryFrame } from '../../test/StoryFrame';
import { Toggle } from './Toggle';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  args: { children: 'Show archived', onChange: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Show archived' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
};

export const Pressed: Story = {
  args: { defaultSelected: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Show archived' }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Ghost: Story = { args: { variant: 'ghost' } };

export const GhostPressed: Story = { args: { variant: 'ghost', defaultSelected: true } };

export const Small: Story = { args: { size: 'sm' } };

export const Large: Story = { args: { size: 'lg' } };

export const WithLeadingIcon: Story = {
  args: { leading: <Icon icon={StarIcon} size="sm" />, children: 'Starred' },
};

export const IconOnly: Story = {
  args: { icon: StarIcon, label: 'Favorite', children: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Favorite' })).toBeVisible();
  },
};

export const IconOnlyWithTooltip: Story = {
  args: { icon: StarIcon, label: 'Favorite', tooltip: { shortcut: 'F' }, children: undefined },
  decorators: [
    (Story) => (
      <StoryFrame padding={12}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Show archived' }),
    ).toBeDisabled();
  },
};

export const DisabledPressed: Story = { args: { isDisabled: true, defaultSelected: true } };

/** `Space` and `Enter` toggle the focused button. */
export const KeyboardToggle: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Show archived' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
  },
};

function ControlledExample() {
  const [on, setOn] = useState(true);
  return (
    <>
      <Toggle isSelected={on} onChange={setOn}>
        Show archived
      </Toggle>
      <p>Archived: {on ? 'shown' : 'hidden'}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show archived' }));
    await expect(canvas.getByText('Archived: hidden')).toBeInTheDocument();
  },
};

export const LongLabel: Story = {
  args: { children: 'Show orders awaiting supplier confirmation from the previous quarter' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={220}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <DSProvider locale="ar">
        <div dir="rtl">
          <Story />
        </div>
      </DSProvider>
    ),
  ],
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
