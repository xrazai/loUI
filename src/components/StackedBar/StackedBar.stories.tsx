import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { StoryFrame } from '../../test/StoryFrame';
import { formatCurrency } from '../../utils/currency';
import { StackedBar } from './StackedBar';
import type { StackedBarDatum, StackedBarProps, StackedBarSeries } from './StackedBar';

type Props = Extract<StackedBarProps, { 'aria-label': string }>;

const channels: StackedBarSeries[] = [
  { id: 'online', label: 'Online' },
  { id: 'store', label: 'Store' },
  { id: 'phone', label: 'Phone' },
];

const quarters: StackedBarDatum[] = [
  { label: 'Q1', values: { online: 40, store: 30, phone: 10 } },
  { label: 'Q2', values: { online: 50, store: 20, phone: 30 } },
  { label: 'Q3', values: { online: 20, store: 20, phone: 0 } },
  { label: 'Q4', values: { online: 65, store: 35, phone: 15 } },
];

const meta = {
  title: 'Components/StackedBar',
  component: StackedBar,
  tags: ['autodocs'],
  args: { data: quarters, series: channels, 'aria-label': 'Orders per quarter, by channel' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={480}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<Props>;

export default meta;
type Story = StoryObj<Props>;

/** Each bar is an image named by a text summary; the legend names the series and a hidden table holds the numbers. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('img', { name: 'Q1: Online 40, Store 30, and Phone 10. Total 80.' }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('list', { name: 'Legend' })).toBeInTheDocument();
  },
};

export const Vertical: Story = { args: { orientation: 'vertical' } };

export const VerticalTall: Story = { args: { orientation: 'vertical', height: 280 } };

/** Every bar at full length: the share of each part, not the size of the total. */
export const Normalized: Story = { args: { normalize: true } };

export const NormalizedVertical: Story = { args: { normalize: true, orientation: 'vertical' } };

export const WithCurrency: Story = {
  args: {
    format: (value: number) => formatCurrency(value * 1000, 'USD', 'en-US'),
  },
};

/** Beyond four series the ramp repeats with a hatch pattern, up to eight series. */
export const EightSeries: Story = {
  args: {
    series: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'].map(
      (label) => ({ id: label.toLowerCase(), label }),
    ),
    data: ['Mon', 'Tue', 'Wed'].map((label, day) => ({
      label,
      values: Object.fromEntries(
        ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'].map(
          (id, index) => [id, 4 + ((index * 3 + day * 5) % 9)],
        ),
      ),
    })),
  },
};

/** Explicit colors are for when the neutral ramp is not enough; the legend still names every series. */
export const ExplicitColors: Story = {
  args: {
    'aria-label': 'Invoices per month, by status',
    series: [
      { id: 'paid', label: 'Paid', color: 'var(--ds-success)' },
      { id: 'pending', label: 'Pending', color: 'var(--ds-warning)' },
      { id: 'overdue', label: 'Overdue', color: 'var(--ds-danger)' },
    ],
    data: [
      { label: 'Aug', values: { paid: 62, pending: 25, overdue: 13 } },
      { label: 'Sep', values: { paid: 70, pending: 18, overdue: 8 } },
      { label: 'Oct', values: { paid: 55, pending: 30, overdue: 20 } },
    ],
  },
};

/** The legend toggles series. Hidden series leave the bars, the totals and the data table. */
export const InteractiveLegend: Story = {
  args: { interactiveLegend: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Store/ }));
    await expect(
      canvas.getByRole('img', { name: 'Q1: Online 40 and Phone 10. Total 50.' }),
    ).toBeInTheDocument();
  },
};

export const InteractiveLegendControlled: Story = {
  render: (args) => {
    function Demo() {
      const [hidden, setHidden] = useState<string[]>(['phone']);
      return (
        <StackedBar
          {...args}
          interactiveLegend
          hiddenSeries={hidden}
          onHiddenSeriesChange={setHidden}
        />
      );
    }
    return <Demo />;
  },
};

export const AllSeriesHidden: Story = {
  args: { interactiveLegend: true, defaultHiddenSeries: ['online', 'store', 'phone'] },
};

/** Arrow keys move between bars; the focused (or hovered) bar is also printed under the chart. */
export const KeyboardReadout: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('img', { name: /^Q2:/ })).toHaveFocus();
    await expect(canvasElement.querySelector('p[aria-hidden="true"]')).toHaveTextContent('Q2:');
  },
};

export const WithoutLegend: Story = { args: { legend: false } };

export const ZeroBar: Story = {
  args: {
    data: [
      { label: 'Q1', values: { online: 40, store: 30 } },
      { label: 'Q2', values: {} },
    ],
  },
};

export const Empty: Story = { args: { data: [] } };

export const LongLabels: Story = {
  args: {
    data: [
      { label: 'Northern distribution center', values: { online: 40, store: 30, phone: 10 } },
      { label: 'Southern distribution center', values: { online: 20, store: 50, phone: 5 } },
    ],
    series: [
      { id: 'online', label: 'Orders placed through the website' },
      { id: 'store', label: 'Orders placed in a store' },
      { id: 'phone', label: 'Phone' },
    ],
  },
};

export const PortugueseBrazil: Story = {
  args: {
    'aria-label': 'Pedidos por trimestre, por canal',
    interactiveLegend: true,
    series: [
      { id: 'online', label: 'Online' },
      { id: 'store', label: 'Loja' },
      { id: 'phone', label: 'Telefone' },
    ],
    format: (value: number) => formatCurrency(value * 1000, 'BRL', 'pt-BR'),
  },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('list', { name: 'Legenda' })).toBeInTheDocument();
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={480} dir="rtl">
        <Story />
      </StoryFrame>
    ),
  ],
};

/** `legendShare` adds each series' share of the visible total to the legend. */
export const LegendShare: Story = {
  args: { legendShare: true },
};
