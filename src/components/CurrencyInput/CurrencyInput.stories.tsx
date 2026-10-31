import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { DSProvider } from '../../providers/DSProvider';
import { CurrencyInput } from './CurrencyInput';
import type { CurrencyInputProps } from './CurrencyInput';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/CurrencyInput',
  component: CurrencyInput,
  tags: ['autodocs'],
  args: { label: 'Price per unit', currency: 'USD' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={280}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<WithLabel<CurrencyInputProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Price per unit' });
    await userEvent.click(field);
    await userEvent.keyboard('124000');
    await expect(field).toHaveValue('$1,240.00');
    await expect(args.onChange).toHaveBeenLastCalledWith(124000);
    await userEvent.keyboard('{Backspace}');
    await expect(field).toHaveValue('$124.00');
  },
};

export const Filled: Story = {
  args: { defaultValue: 123456 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toHaveValue('$1,234.56');
  },
};

export const WithDescription: Story = {
  args: { description: 'Without taxes.', defaultValue: 4990 },
};

export const Required: Story = {
  args: { isRequired: true },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Enter a price above zero.', defaultValue: 0 },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 4990 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 4990 },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('9');
    await expect(field).toHaveValue('$49.90');
  },
};

export const AllowNegative: Story = {
  args: { allowNegative: true, defaultValue: 1500, label: 'Adjustment' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('-');
    await expect(field).toHaveValue('-$15.00');
    await userEvent.keyboard('-');
    await expect(field).toHaveValue('$15.00');
  },
};

export const MaxDigits: Story = {
  args: { maxDigits: 5, label: 'Discount (up to 999.99)' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('1234567');
    await expect(field).toHaveValue('$123.45');
  },
};

export const Brazilian: Story = {
  args: { currency: 'BRL', label: 'Preço por metro', defaultValue: 124000 },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole<HTMLInputElement>('textbox');
    // The space between the symbol and the number is a no-break space.
    await expect(field.value.replace(/\s/g, ' ')).toBe('R$ 1.240,00');
  },
};

export const ZeroAndThreeDigitCurrencies: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <CurrencyInput {...args} currency="JPY" label="Yen (0 digits)" defaultValue={1240} />
      <CurrencyInput {...args} currency="KWD" label="Dinar (3 digits)" defaultValue={1240500} />
      <DSProvider locale="de-DE">
        <CurrencyInput {...args} currency="EUR" label="Euro in de-DE" defaultValue={124000} />
      </DSProvider>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <CurrencyInput {...args} size="sm" label="Small" defaultValue={100} />
      <CurrencyInput {...args} size="md" label="Medium" defaultValue={100} />
      <CurrencyInput {...args} size="lg" label="Large" defaultValue={100} />
    </div>
  ),
};

function ControlledField(args: CurrencyInputProps) {
  const [value, setValue] = useState<number | null>(250);
  return (
    <>
      <CurrencyInput {...args} value={value} onChange={setValue} />
      <p>
        <output data-testid="mirror">{String(value)}</output>
      </p>
    </>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox'));
    await userEvent.keyboard('1');
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('2501');
    await expect(canvas.getByRole('textbox')).toHaveValue('$25.01');
  },
};
