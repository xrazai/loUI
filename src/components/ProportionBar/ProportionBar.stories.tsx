import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { formatCurrency } from '../../utils/currency';
import { ProportionBar } from './ProportionBar';
import type { ProportionBarProps, ProportionSegment } from './ProportionBar';
import { StoryFrame } from '../../test/StoryFrame';

const payments: ProportionSegment[] = [
  { label: 'Pix', value: 1693000 },
  { label: 'Cash', value: 573400 },
  { label: 'Debit', value: 538800 },
  { label: 'Credit', value: 359600 },
];

const meta = {
  title: 'Components/ProportionBar',
  component: ProportionBar,
  tags: ['autodocs'],
  args: { segments: payments, label: 'Payment methods' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={420}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<ProportionBarProps>;

export default meta;
type Story = StoryObj<ProportionBarProps>;

/** The bar is an image named by a text summary, so the percentages are never only visual. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('img', {
        name: 'Payment methods: Pix 53%, Cash 18%, Debit 17%, and Credit 11%',
      }),
    ).toBeInTheDocument();
  },
};

export const WithLegend: Story = {
  args: {
    legend: true,
    format: (value: number) => formatCurrency(value, 'USD', 'en-US'),
  },
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    await expect(items).toHaveLength(4);
    await expect(items[0]).toHaveTextContent('Pix');
    await expect(items[0]).toHaveTextContent('53%');
    await expect(items[0]).toHaveTextContent('$16,930.00');
  },
};

/** Beyond four parts the neutral ramp repeats with a hatch, so no two parts look alike (up to eight). */
export const EightParts: Story = {
  args: {
    legend: true,
    label: 'Sales by region',
    segments: ['North', 'South', 'East', 'West', 'Center', 'Coast', 'Islands', 'Abroad'].map(
      (label, index) => ({ label, value: 40 - index * 4 }),
    ),
  },
};

/** Explicit colors are for when the neutral ramp is not enough; the legend still names every part. */
export const ExplicitColors: Story = {
  args: {
    label: 'Invoices',
    legend: true,
    segments: [
      { label: 'Paid', value: 62, color: 'var(--ds-success)' },
      { label: 'Pending', value: 25, color: 'var(--ds-warning)' },
      { label: 'Overdue', value: 13, color: 'var(--ds-danger)' },
    ],
  },
};

export const ZeroPart: Story = {
  args: {
    legend: true,
    segments: [
      { label: 'Cash', value: 50 },
      { label: 'Card', value: 0 },
      { label: 'Pix', value: 50 },
    ],
  },
};

export const AllZero: Story = {
  args: {
    legend: true,
    segments: [
      { label: 'Cash', value: 0 },
      { label: 'Card', value: 0 },
    ],
  },
};

export const OneDecimalPercent: Story = {
  args: { legend: true, percentDigits: 1 },
};

export const LongLabels: Story = {
  args: {
    legend: true,
    segments: [
      { label: 'Credit card in twelve installments with interest', value: 10 },
      { label: 'Bank transfer', value: 5 },
    ],
  },
};

/** Percentages, numbers and the list in the summary follow the provider locale. */
export const PortugueseBrazil: Story = {
  args: {
    label: 'Formas de pagamento',
    legend: true,
    segments: [
      { label: 'Pix', value: 1693000 },
      { label: 'Dinheiro', value: 573400 },
      { label: 'Débito', value: 538800 },
    ],
    format: (value: number) => formatCurrency(value, 'BRL', 'pt-BR'),
  },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('img', {
        name: 'Formas de pagamento: Pix 60%, Dinheiro 20% e Débito 19%',
      }),
    ).toBeInTheDocument();
  },
};

/** Share, value and count columns, in the order given. Each legend item shares its `id` with the bar segment. */
export const LegendColumns: Story = {
  args: {
    legend: true,
    legendColumns: ['value', 'share', 'count'],
    format: (value: number) => formatCurrency(value, 'USD', 'en-US'),
    segments: [
      { id: 'pix', label: 'Pix', value: 1693000, count: 124 },
      { id: 'cash', label: 'Cash', value: 573400, count: 48 },
      { id: 'debit', label: 'Debit', value: 538800, count: 37 },
    ],
  },
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    await expect(items[0]).toHaveTextContent('124');
  },
};

/** One segment plus `total`: "Paid 1,240 of 2,000". The rest is an unlabelled track named "Remaining" for assistive technology. */
export const PartOfWhole: Story = {
  args: {
    label: 'Invoice',
    total: 2000,
    legend: true,
    segments: [{ id: 'paid', label: 'Paid', value: 1240 }],
    format: (value: number) => formatCurrency(value * 100, 'USD', 'en-US'),
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('img', { name: 'Invoice: Paid 62% and Remaining 38%' }),
    ).toBeInTheDocument();
  },
};
