import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { Combobox } from './Combobox';
import type { ComboboxOption, ComboboxProps } from './Combobox';
import { StoryFrame } from '../../test/StoryFrame';

const customers: ComboboxOption[] = [
  { value: 'cafe', label: 'Café Central', meta: '3 orders' },
  { value: 'halden', label: 'Halden & Co.', meta: '12 orders' },
  { value: 'mira', label: 'Mira Têxtil', description: 'São Paulo' },
  { value: 'nordic', label: 'Nordic Linen', description: 'Oslo', meta: '8 orders' },
  { value: 'sol', label: 'Sol Tecidos' },
];

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  args: { label: 'Customer', options: customers },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={360} minHeight={340}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<WithLabel<ComboboxProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Customer' });
    await userEvent.click(input);
    await userEvent.keyboard('cafe');
    const listbox = await screen.findByRole('listbox');
    await expect(within(listbox).getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(input).toHaveValue('Café Central'));
    await expect(args.onChange).toHaveBeenLastCalledWith('cafe');
  },
};

/** The suggestions open under the field, for the visual review (TEST-020). */
export const Open: Story = {
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Customer' }));
    await userEvent.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
  },
};

export const KeyboardContract: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Customer' });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const listbox = await screen.findByRole('listbox');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(listbox).not.toBeInTheDocument());
    await expect(input).toHaveFocus();
  },
};

export const WithDescriptionAndMeta: Story = {
  args: { description: 'Who the order is for.' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Show options/ }));
    const listbox = await screen.findByRole('listbox');
    await expect(within(listbox).getAllByRole('option')).toHaveLength(5);
  },
};

export const WithSelection: Story = {
  args: { defaultValue: 'mira' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox')).toHaveValue('Mira Têxtil');
  },
};

export const Sections: Story = {
  args: {
    options: [
      { id: 'active', label: 'Active', options: customers.slice(0, 3) },
      { id: 'dormant', label: 'Dormant', options: customers.slice(3) },
    ],
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Show options/ }));
    await screen.findByRole('group', { name: 'Active' });
  },
};

export const DisabledOption: Story = {
  args: {
    options: [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta', isDisabled: true },
      { value: 'c', label: 'Gamma' },
    ],
  },
};

export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    await userEvent.keyboard('zzz');
    const listbox = await screen.findByRole('listbox');
    await expect(listbox).toHaveTextContent('No results');
  },
};

export const CustomValue: Story = {
  args: { allowsCustomValue: true, description: 'Pick a customer or type a new name.' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, 'Brand new');
    await userEvent.tab();
    await expect(input).toHaveValue('Brand new');
  },
};

export const Loading: Story = {
  args: { options: [], filter: false, isLoading: true },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    await userEvent.keyboard('hal');
    const listbox = await screen.findByRole('listbox');
    await expect(listbox).toHaveTextContent('Loading');
  },
};

function AsyncCombobox(args: ComboboxProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState<ComboboxOption[]>([]);
  return (
    <Combobox
      {...args}
      filter={false}
      isLoading={loading}
      options={found}
      onInputChange={(text) => {
        setQuery(text);
        setLoading(true);
        // The server call is simulated: the consumer owns the data and the loading flag.
        setTimeout(() => {
          setFound(customers.filter((c) => c.label.toLowerCase().includes(text.toLowerCase())));
          setLoading(false);
        }, 50);
      }}
      description={`Searched for "${query}".`}
    />
  );
}

export const AsyncFromServer: Story = {
  render: (args) => <AsyncCombobox {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    await userEvent.keyboard('nor');
    const option = await screen.findByRole('option', { name: /Nordic/ });
    await expect(option).toBeVisible();
  },
};

export const Required: Story = {
  args: { isRequired: true },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Choose a customer to continue.' },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'mira' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox')).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 'mira' },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <Combobox {...args} size="sm" label="Small" />
      <Combobox {...args} size="md" label="Medium" />
      <Combobox {...args} size="lg" label="Large" />
    </div>
  ),
};

export const LongText: Story = {
  args: {
    options: [
      {
        value: 'long',
        label: 'A customer with a remarkably long legal name that keeps going and going',
        description: 'And a description that is also rather long so that it has to wrap',
        meta: 'SKU-204',
      },
    ],
  },
};
