import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { Slider } from './Slider';
import type { SliderProps } from './Slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: { label: 'Discount', defaultValue: 20, minValue: 0, maxValue: 100 },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<WithLabel<SliderProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', { name: 'Discount' });
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    await expect(slider).toHaveValue('20');
    await userEvent.keyboard('{ArrowRight}');
    await expect(slider).toHaveValue('21');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(slider).toHaveValue('19');
  },
};

export const KeyboardContract: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const slider = within(canvasElement).getByRole('slider', { name: 'Discount' });
    await userEvent.tab();
    await userEvent.keyboard('{End}');
    await expect(slider).toHaveValue('100');
    await userEvent.keyboard('{Home}');
    await expect(slider).toHaveValue('0');
    await userEvent.keyboard('{PageUp}');
    await expect(slider).toHaveValue('10');
    await userEvent.keyboard('{PageDown}');
    await expect(slider).toHaveValue('0');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowDown}');
    await expect(slider).toHaveValue('1');
    await expect(args.onChange).toHaveBeenLastCalledWith(1);
  },
};

export const Percent: Story = {
  args: {
    label: 'Opacity',
    defaultValue: 0.5,
    minValue: 0,
    maxValue: 1,
    step: 0.05,
    formatOptions: { style: 'percent' },
  },
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', { name: 'Opacity' });
    await expect(slider).toHaveAttribute('aria-valuetext', '50%');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(slider).toHaveAttribute('aria-valuetext', '55%');
  },
};

export const WithDescription: Story = {
  args: { description: 'Applied to the whole order.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('slider')).toHaveAccessibleDescription(
      'Applied to the whole order.',
    );
  },
};

export const SteppedByTen: Story = {
  args: { step: 10, label: 'Quantity step' },
};

export const WithoutValue: Story = {
  args: { showValue: false },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('slider')).toBeDisabled();
  },
};

export const AriaLabelOnly: Story = {
  render: () => <Slider aria-label="Volume" defaultValue={30} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('slider', { name: 'Volume' })).toBeVisible();
  },
};

function ControlledSlider(args: SliderProps) {
  const [value, setValue] = useState(35);
  return (
    <>
      <Slider {...args} value={value} onChange={setValue} />
      <p>
        <output data-testid="mirror">{value}</output>
      </p>
    </>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledSlider {...args} />,
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(canvasElement).getByTestId('mirror')).toHaveTextContent('36');
    await expect(slider).toHaveValue('36');
  },
};

export const LongLabel: Story = {
  args: {
    label: 'Maximum discount a sales representative may grant without approval from a manager',
  },
};
