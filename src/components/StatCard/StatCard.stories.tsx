import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { formatCurrency } from '../../utils/currency';
import { ProportionBar } from '../ProportionBar';
import { StatCard } from './StatCard';
import type { StatCardProps } from './StatCard';
import { StoryFrame } from '../../test/StoryFrame';

type Props = Extract<StatCardProps, { tone?: 'neutral' }>;

const meta = {
  title: 'Components/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  args: {
    label: 'Sold',
    value: formatCurrency(3765530, 'USD', 'en-US'),
    note: '3 sales · average ticket $120.00',
  },
  decorators: [
    (Story, { name }) =>
      name === 'Grid' ? (
        <Story />
      ) : (
        <StoryFrame maxWidth={280}>
          <Story />
        </StoryFrame>
      ),
  ],
} satisfies Meta<Props>;

export default meta;
type Story = StoryObj<Props>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Sold')).toBeInTheDocument();
    await expect(canvas.getByText('$37,655.30')).toBeInTheDocument();
    await expect(canvasElement.querySelector('dl')).not.toBeNull();
  },
};

export const Large: Story = { args: { size: 'lg' } };

export const WithAside: Story = { args: { label: 'Collected', aside: '42%' } };

/** A colored value is always explained in words: the note says why. */
export const WarningTone: Story = {
  render: () => (
    <StatCard
      label="Due this week"
      value="$1,240.00"
      tone="warning"
      note="2 invoices due in 3 days"
    />
  ),
};

export const DangerTone: Story = {
  render: () => (
    <StatCard label="Overdue" value="$96.40" tone="danger" note="Water bill since Oct 28" />
  ),
};

export const SuccessTone: Story = {
  render: () => (
    <StatCard label="Open balance" value="$0.00" tone="success" note="Everything is paid" />
  ),
};

/** The trend is written as text ("Up 12%"); the arrow and the color only reinforce it. */
export const TrendUp: Story = {
  args: {
    note: undefined,
    trend: { direction: 'up', value: 0.12, comparedTo: 'vs previous 30 days' },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Up 12%/)).toBeInTheDocument();
  },
};

/** When up is bad (costs, returns), flip the trend tone. */
export const TrendUpIsBad: Story = {
  args: {
    label: 'Returns',
    value: '48',
    note: undefined,
    trend: { direction: 'up', value: 0.35, tone: 'danger', comparedTo: 'vs last month' },
  },
};

export const TrendDownAndFlat: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <StatCard
        {...args}
        label="Orders"
        value="120"
        note={undefined}
        trend={{ direction: 'down', value: 0.045 }}
      />
      <StatCard
        {...args}
        label="Customers"
        value="58"
        note={undefined}
        trend={{ direction: 'flat' }}
      />
    </div>
  ),
};

/** The children slot sits between the value and the note, for a small visual. */
export const WithProportionBar: Story = {
  args: { label: 'Received', note: 'Pix is most of it' },
  render: (args) => (
    <StatCard {...args}>
      <ProportionBar
        label="Payment methods"
        segments={[
          { label: 'Pix', value: 70 },
          { label: 'Cash', value: 20 },
          { label: 'Card', value: 10 },
        ]}
      />
    </StatCard>
  ),
};

export const LongText: Story = {
  args: {
    label: 'Accounts receivable from wholesale customers',
    value: '$1,234,567,890.00',
    note: 'A very long explanation that should wrap to the next line instead of overflowing the card',
  },
};

/** Auto-fit grid of cards, at most four per row. */
export const Grid: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--ds-space-4)',
          maxInlineSize: 'none',
        }}
      >
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <StatCard
        label="Sold"
        value="$37,655.30"
        trend={{ direction: 'up', value: 0.12, comparedTo: 'vs previous 30 days' }}
      />
      <StatCard label="Overdue" value="$96.40" tone="danger" note="Water since Oct 28" />
      <StatCard label="Orders" value="120" note="3 awaiting shipment" />
    </>
  ),
};

/** The trend text and number formats follow the provider locale. */
export const PortugueseBrazil: Story = {
  args: {
    label: 'Vendido',
    value: formatCurrency(3765530, 'BRL', 'pt-BR'),
    note: undefined,
    trend: { direction: 'up', value: 0.125, comparedTo: 'em relação aos 30 dias anteriores' },
  },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Subiu 12,5%/)).toBeInTheDocument();
  },
};
