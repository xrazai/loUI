import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { DSProvider } from '../../providers/DSProvider';
import { CurrencyInput } from './CurrencyInput';
import type { CurrencyInputProps } from './CurrencyInput';
import { StoryFrame } from '../../test/StoryFrame';
import { Button } from '../Button';
import { Inline } from '../Inline';

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

function ReconcileExample() {
  const [paid, setPaid] = useState<number | null>(9500);
  const due = 10000;
  const diff = (paid ?? 0) - due;
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const message =
    diff === 0
      ? 'Matches'
      : diff > 0
        ? `Over by ${money.format(diff / 100)}`
        : `Short by ${money.format(-diff / 100)}`;
  return (
    <CurrencyInput
      label="Amount received"
      currency="USD"
      value={paid}
      onChange={setPaid}
      description={message}
      descriptionTone={diff === 0 ? 'success' : diff > 0 ? 'warning' : 'danger'}
    />
  );
}

/** A live check under the field: the tone follows the difference, the words say what it is. */
export const ToneMessage: Story = {
  render: () => <ReconcileExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Short by $5.00')).toHaveAttribute('data-tone', 'danger');
    const input = canvas.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, '10000');
    await expect(canvas.getByText('Matches')).toHaveAttribute('data-tone', 'success');
    await expect(input).toHaveAccessibleDescription('Matches');
  },
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

/** The placeholder shows while the value is `null`, also when focused, until a digit is typed. */
export const WithPlaceholder: Story = {
  args: { placeholder: '$49.90' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await expect(field).toHaveValue('');
    await expect(field).toHaveAttribute('placeholder', '$49.90');
  },
};

/** In an `Inline` row the field takes the free space next to the button. */
export const FullWidthInRow: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <Inline gap={2} align="end" wrap={false}>
      <CurrencyInput {...args} />
      <Button variant="primary">Apply</Button>
    </Inline>
  ),
};

/** Amount mode types whole units: `200` is 200.00 and the decimal mark starts the fraction. */
export const AmountMode: Story = {
  args: { entryMode: 'amount', label: 'Price', placeholder: '$0.00' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('200.5');
    await expect(field).toHaveValue('200.5');
    await userEvent.tab();
    await expect(field).toHaveValue('$200.50');
  },
};

export const AmountModeBrazilian: Story = {
  args: { entryMode: 'amount', currency: 'BRL', label: 'Preço por metro', defaultValue: 124000 },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('1234,5');
    await expect(field).toHaveValue('1234,5');
  },
};

export const AmountModeYen: Story = {
  args: { entryMode: 'amount', currency: 'JPY', label: 'Yen (0 digits)', placeholder: '¥0' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('1500.');
    await expect(field).toHaveValue('1500');
  },
};
