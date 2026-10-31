import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { StarIcon } from '../Icon';
import { Toggle } from '../Toggle';
import { StoryFrame } from '../../test/StoryFrame';
import { ToggleGroup } from './ToggleGroup';

const meta = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Text formatting',
    onChange: fn(),
    children: [
      <Toggle key="bold" id="bold">
        Bold
      </Toggle>,
      <Toggle key="italic" id="italic">
        Italic
      </Toggle>,
      <Toggle key="underline" id="underline">
        Underline
      </Toggle>,
    ],
  },
  argTypes: {
    selectionMode: { control: 'inline-radio', options: ['multiple', 'single'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'inline-radio', options: ['secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('toolbar', { name: 'Text formatting' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
};

export const Preselected: Story = {
  args: { defaultValue: ['bold', 'underline'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(canvas.getByRole('button', { name: 'Italic' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
};

export const Ghost: Story = { args: { variant: 'ghost', defaultValue: ['italic'] } };

export const Small: Story = { args: { size: 'sm', defaultValue: ['italic'] } };

export const Large: Story = { args: { size: 'lg', defaultValue: ['italic'] } };

export const Vertical: Story = {
  args: { orientation: 'vertical', defaultValue: ['bold'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('button', { name: 'Italic' })).toHaveFocus();
  },
};

export const IconOnly: Story = {
  args: {
    'aria-label': 'Row markers',
    variant: 'ghost',
    children: [
      <Toggle key="fav" id="fav" icon={StarIcon} label="Favorite" />,
      <Toggle key="pin" id="pin" icon={StarIcon} label="Pinned" />,
    ],
  },
};

export const SingleSelection: Story = {
  args: {
    selectionMode: 'single',
    'aria-label': 'Density',
    defaultValue: ['comfortable'],
    children: [
      <Toggle key="compact" id="compact">
        Compact
      </Toggle>,
      <Toggle key="comfortable" id="comfortable">
        Comfortable
      </Toggle>,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radiogroup', { name: 'Density' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('radio', { name: 'Compact' }));
    await expect(canvas.getByRole('radio', { name: 'Compact' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Comfortable' })).not.toBeChecked();
  },
};

export const DisabledToggle: Story = {
  args: {
    children: [
      <Toggle key="a" id="a">
        Bold
      </Toggle>,
      <Toggle key="b" id="b" isDisabled>
        Italic
      </Toggle>,
      <Toggle key="c" id="c">
        Underline
      </Toggle>,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Underline' })).toHaveFocus();
  },
};

export const DisabledGroup: Story = {
  args: { isDisabled: true, defaultValue: ['bold'] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Bold' })).toBeDisabled();
  },
};

/** One tab stop. Arrows move focus (and stop at the ends), Space and Enter press. */
export const KeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onChange).toHaveBeenLastCalledWith(['bold']);
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(['bold', 'italic']);
    await userEvent.keyboard('{ArrowLeft} ');
    await expect(args.onChange).toHaveBeenLastCalledWith(['italic']);
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
};

function ControlledExample() {
  const [value, setValue] = useState<string[]>(['italic']);
  return (
    <>
      <ToggleGroup aria-label="Text formatting" value={value} onChange={setValue}>
        <Toggle id="bold">Bold</Toggle>
        <Toggle id="italic">Italic</Toggle>
        <Toggle id="underline">Underline</Toggle>
      </ToggleGroup>
      <p>Pressed: {value.join(', ') || 'none'}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Bold' }));
    await expect(canvas.getByText('Pressed: italic, bold')).toBeInTheDocument();
  },
};

export const Wrapping: Story = {
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={180}>
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
  args: { defaultValue: ['bold'] },
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
