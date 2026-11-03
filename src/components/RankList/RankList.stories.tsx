import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { formatCurrency } from '../../utils/currency';
import { Card } from '../Card';
import { RankList } from './RankList';
import type { RankItem, RankListProps } from './RankList';
import { StoryFrame } from '../../test/StoryFrame';

const products: RankItem[] = [
  { id: 'notebook', label: 'Notebook', value: 420000, meta: '12 units · 18%', swatch: '#c9b79c' },
  { id: 'backpack', label: 'Backpack', value: 980000, meta: '30 units · 42%', swatch: '#f4f2ec' },
  { id: 'headphones', label: 'Headphones', value: 150000, meta: '3 units · 6%', swatch: '#8ab4ff' },
  { id: 'lamp', label: 'Lamp', value: 760000, meta: '22 units · 33%', swatch: '#5a5a60' },
];

const money = (value: number) => formatCurrency(value, 'USD', 'en-US');

const meta = {
  title: 'Components/RankList',
  component: RankList,
  tags: ['autodocs'],
  args: { items: products, format: money, 'aria-label': 'Top products' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={420}>
        <Card padding="none" title="Top products">
          <Story />
        </Card>
      </StoryFrame>
    ),
  ],
} satisfies Meta<RankListProps>;

export default meta;
type Story = StoryObj<RankListProps>;

/** Ranked data, largest first. Rows render in the order given: the list never re-sorts or truncates on its own. */
export const Default: Story = {
  args: { items: [...products].sort((a, b) => b.value - a.value) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByRole('listitem');
    await expect(items).toHaveLength(4);
    await expect(items[0]).toHaveTextContent('Backpack');
    await expect(items[3]).toHaveTextContent('Headphones');
  },
};

/** Without `sort`, unsorted data keeps its given order (here: insertion order). */
export const GivenOrder: Story = {
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    await expect(items[0]).toHaveTextContent('Notebook');
  },
};

/** `sort` and `limit` are opt-in: a "top 3" by value. */
export const SortedAndLimited: Story = {
  args: { sort: 'desc', limit: 3 },
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    await expect(items).toHaveLength(3);
    await expect(items[0]).toHaveTextContent('Backpack');
    await expect(items[1]).toHaveTextContent('Lamp');
    await expect(items[2]).toHaveTextContent('Notebook');
  },
};

export const WithoutPositions: Story = { args: { showPosition: false, sort: 'desc' } };

export const WithoutSwatchOrMeta: Story = {
  args: { items: products.map((item) => ({ label: item.label, value: item.value })) },
};

/** Rows with `onAction` are buttons: Tab reaches them, Enter or Space press. */
export const Actionable: Story = {
  args: {
    items: [
      { id: 'ana', label: 'Ana Lima', value: 980000, meta: '30 orders', onAction: fn() },
      { id: 'bruno', label: 'Bruno Costa', value: 420000, meta: '12 orders', onAction: fn() },
      { id: 'casa', label: 'Casa Norte (no profile)', value: 150000, meta: '3 orders' },
    ],
    'aria-label': 'Top customers',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /Ana Lima/ })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.items[0]?.onAction).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(args.items[1]?.onAction).toHaveBeenCalledTimes(1);
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
  },
};

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No data for this period')).toBeInTheDocument();
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      {
        label: 'Wireless noise-cancelling headphones, 40 h battery, matte graphite finish',
        value: 90,
      },
      { label: 'Notebook', value: 45, meta: 'a very long meta text that stays on one line' },
    ],
  },
};

/** Bars of different rows share one column grid, so their lengths can be compared by eye. */
export const BarsAlign: Story = {
  args: {
    items: [
      { label: 'A', value: 100, meta: 'long meta text here' },
      { label: 'B', value: 50, meta: 'short' },
      { label: 'C', value: 50 },
    ],
  },
};

export const PortugueseBrazil: Story = {
  args: {
    items: products,
    format: (value: number) => formatCurrency(value, 'BRL', 'pt-BR'),
    sort: 'desc',
    'aria-label': 'Produtos mais vendidos',
  },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('listitem')[0]).toHaveTextContent('R$');
  },
};
