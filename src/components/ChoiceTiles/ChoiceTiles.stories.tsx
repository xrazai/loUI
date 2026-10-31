import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { ChoiceTiles } from './ChoiceTiles';
import type { ChoiceTilesProps } from './ChoiceTiles';
import { StoryFrame } from '../../test/StoryFrame';

const options = [
  { value: 'pickup', label: 'Pick up', meta: 'Free' },
  { value: 'standard', label: 'Standard', meta: '3-5 days' },
  { value: 'express', label: 'Express', meta: '1 day' },
  { value: 'freight', label: 'Freight', meta: 'Quote' },
];

const meta = {
  title: 'Components/ChoiceTiles',
  component: ChoiceTiles,
  tags: ['autodocs'],
  args: { label: 'Delivery', options, onChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'lg'] },
    columns: { control: { type: 'number', min: 1, max: 6 } },
  },
} satisfies Meta<WithLabel<ChoiceTilesProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radiogroup', { name: 'Delivery' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('radio')).toHaveLength(4);
  },
};

export const Selected: Story = { args: { defaultValue: 'express' } };

export const Medium: Story = { args: { size: 'md', defaultValue: 'standard' } };

export const ThreeColumns: Story = {
  args: { columns: 3, options: options.slice(0, 3), defaultValue: 'pickup' },
};

export const WithoutMeta: Story = {
  args: {
    label: 'Size',
    options: [
      { value: 's', label: 'Small' },
      { value: 'm', label: 'Medium' },
      { value: 'l', label: 'Large' },
      { value: 'xl', label: 'Extra large' },
    ],
    columns: 4,
  },
};

export const DisabledTile: Story = {
  args: {
    defaultValue: 'pickup',
    options: options.map((option) =>
      option.value === 'express' ? { ...option, isDisabled: true } : option,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: /Freight/ })).toBeChecked();
  },
};

export const DisabledGroup: Story = { args: { isDisabled: true, defaultValue: 'pickup' } };

export const WithDescription: Story = { args: { description: 'You can change this later.' } };

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Choose a delivery method.' },
};

export const Required: Story = { args: { isRequired: true } };

export const LongText: Story = {
  args: {
    options: [
      {
        value: 'a',
        label: 'Awaiting supplier confirmation and quality review',
        meta: 'SUP-2048-LONG-CODE',
      },
      { value: 'b', label: 'Ready to ship' },
    ],
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={300}>
        <Story />
      </StoryFrame>
    ),
  ],
};

/** Below roughly two minimum tile widths the grid collapses to one column. */
export const NarrowContainer: Story = {
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={200}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  args: { defaultValue: 'pickup' },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

/** One tab stop. Arrows move focus and select, wrapping at the ends. */
export const KeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: /Pick up/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: /Standard/ })).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith('standard');
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: /Express/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(canvas.getByRole('radio', { name: /Pick up/ })).toBeChecked();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('radio', { name: /Freight/ })).toBeChecked();
  },
};

function ControlledExample() {
  const [value, setValue] = useState('standard');
  return (
    <>
      <ChoiceTiles label="Delivery" options={options} value={value} onChange={setValue} />
      <p style={{ margin: 0 }}>Value: {value}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Express'));
    await expect(canvas.getByText('Value: express')).toBeInTheDocument();
  },
};

export const Focused: Story = {
  args: { defaultValue: 'standard' },
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
