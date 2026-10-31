import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { NumberField } from './NumberField';
import type { NumberFieldProps } from './NumberField';

const meta = {
  title: 'Components/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  args: { label: 'Quantity', defaultValue: 5, minValue: 0, maxValue: 10 },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<WithLabel<NumberFieldProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Quantity' });
    await userEvent.click(canvas.getByRole('button', { name: /Increase/ }));
    await expect(field).toHaveValue('6');
    await expect(args.onChange).toHaveBeenLastCalledWith(6);
    await userEvent.click(canvas.getByRole('button', { name: /Decrease/ }));
    await expect(field).toHaveValue('5');
  },
};

export const KeyboardContract: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Quantity' });
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(field).toHaveValue('7');
    await userEvent.keyboard('{ArrowDown}');
    await expect(field).toHaveValue('6');
    await userEvent.keyboard('{End}');
    await expect(field).toHaveValue('10');
    await userEvent.keyboard('{Home}');
    await expect(field).toHaveValue('0');
  },
};

export const TypingClampsToLimits: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Quantity' });
    await userEvent.clear(field);
    await userEvent.type(field, '42{Enter}');
    await expect(field).toHaveValue('10');
  },
};

export const WithSuffix: Story = {
  args: { label: 'Length', suffix: 'm', step: 0.5, defaultValue: 2.5, minValue: 0, maxValue: 100 },
};

export const FormattedUnit: Story = {
  args: {
    label: 'Weight',
    defaultValue: 12,
    minValue: 0,
    maxValue: 100,
    formatOptions: { style: 'unit', unit: 'kilogram' },
  },
};

export const WithDescription: Story = {
  args: { description: 'Pieces per roll.' },
};

export const Required: Story = {
  args: { isRequired: true },
  render: (args) => <NumberField {...args} />,
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Enter a quantity between 0 and 10.', defaultValue: 12 },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /Increase/ })).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await expect(field).toHaveValue('5');
  },
};

export const AtLimit: Story = {
  args: { defaultValue: 10 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: /Increase/ })).toBeDisabled();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <NumberField {...args} size="sm" label="Small" />
      <NumberField {...args} size="md" label="Medium" />
      <NumberField {...args} size="lg" label="Large" />
    </div>
  ),
};

function ControlledField(args: NumberFieldProps) {
  const [value, setValue] = useState(3);
  return (
    <>
      <NumberField {...args} value={value} onChange={setValue} />
      <p>
        <output data-testid="mirror">{value}</output>
      </p>
    </>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Increase/ }));
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('4');
    await expect(canvas.getByRole('textbox')).toHaveValue('4');
  },
};
