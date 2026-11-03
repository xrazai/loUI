import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { SearchInput } from './SearchInput';
import type { SearchInputProps } from './SearchInput';
import { Button } from '../Button';
import { Inline } from '../Inline';
import { StoryFrame } from '../../test/StoryFrame';

type NamedByAriaLabel = Extract<SearchInputProps, { 'aria-label': string }>;

const products = [
  { label: 'Caderno liso', meta: 'SKU-204' },
  { label: 'Lâmpada de mesa', meta: 'SKU-118' },
  'Fone sem fio',
  'Caderno pautado',
];

const meta = {
  title: 'Components/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  args: { 'aria-label': 'Search products' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={360} minHeight={280}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<NamedByAriaLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onChange: fn(), onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const field = within(canvasElement).getByRole('searchbox', { name: 'Search products' });
    await userEvent.click(field);
    await userEvent.keyboard('fone{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledWith('fone');
    await userEvent.keyboard('{Escape}');
    await expect(field).toHaveValue('');
  },
};

export const ClearButton: Story = {
  args: { defaultValue: 'caderno' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(canvas.getByRole('searchbox')).toHaveValue('');
    await expect(canvas.getByRole('searchbox')).toHaveFocus();
  },
};

export const WithShortcutHint: Story = {
  args: { shortcut: ['Mod', 'K'] },
};

export const Landmark: Story = {
  args: { landmark: true, 'aria-label': 'Site search' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('search', { name: 'Site search' })).toBeVisible();
  },
};

export const WithSuggestions: Story = {
  args: { suggestions: products, onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const field = within(canvasElement).getByRole('combobox');
    await userEvent.click(field);
    await userEvent.keyboard('CADERNO');
    const listbox = await screen.findByRole('listbox');
    await expect(within(listbox).getAllByRole('option')).toHaveLength(2);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(field).toHaveValue('Caderno liso'));
    await expect(args.onSelect).toHaveBeenCalled();
  },
};

export const AccentInsensitiveHighlight: Story = {
  args: { suggestions: products },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    await userEvent.keyboard('lampada');
    await screen.findByRole('listbox');
    await expect(document.querySelector('mark')).toHaveTextContent('Lâmpada');
  },
};

export const NoSuggestions: Story = {
  args: { suggestions: products },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    await userEvent.keyboard('zzz');
    await expect(await screen.findByRole('listbox')).toHaveTextContent('No results');
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('searchbox')).toBeDisabled();
  },
};

export const VisibleLabel: Story = {
  render: () => <SearchInput label="Find a product" />,
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <SearchInput {...args} size="sm" aria-label="Small" />
      <SearchInput {...args} size="md" aria-label="Medium" />
      <SearchInput {...args} size="lg" aria-label="Large" />
    </div>
  ),
};

/** In an `Inline` row the field takes the free space next to the button. */
export const FullWidthInRow: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <Inline gap={2} align="end" wrap={false}>
      <SearchInput {...args} />
      <Button variant="primary">Apply</Button>
    </Inline>
  ),
};
