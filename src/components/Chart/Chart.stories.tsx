import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { formatCurrency } from '../../utils/currency';
import { Chart } from './Chart';
import type { ChartDatum, ChartProps } from './Chart';

type Props = Extract<ChartProps, { 'aria-label': string }>;

const weekdays: ChartDatum[] = [
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 58 },
  { label: 'Wed', value: 31 },
  { label: 'Thu', value: 75 },
  { label: 'Fri', value: 64 },
  { label: 'Sat', value: 90 },
  { label: 'Sun', value: 18 },
];

/** Deterministic 30-day series (minor units) so the stories never change between runs. */
const thirtyDays: ChartDatum[] = Array.from({ length: 30 }, (_, index) => ({
  label: String(index + 1),
  value: 80000 + ((index * 37) % 11) * 15000 + (index % 7) * 9000,
}));

const meta = {
  title: 'Components/Chart',
  component: Chart,
  tags: ['autodocs'],
  args: { data: weekdays, 'aria-label': 'Sales per weekday' },
} satisfies Meta<Props>;

export default meta;
type Story = StoryObj<Props>;

async function waitForDraw(canvasElement: HTMLElement) {
  await waitFor(() => expect(canvasElement.querySelector('svg')).not.toBeNull());
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForDraw(canvasElement);
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Sales per weekday' })).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('svg rect')).toHaveLength(7);
  },
};

export const Line: Story = {
  args: { type: 'line', data: thirtyDays, 'aria-label': 'Sales, last 30 days' },
};

/**
 * `highlight` marks points by index with text ("Today", "Best day"). The point is drawn in the
 * strong ink color with an outline, the text is printed above it and read by screen readers.
 */
export const Highlight: Story = {
  args: { highlight: { 5: 'Best day', 6: 'Today' } },
  play: async ({ canvasElement }) => {
    await waitForDraw(canvasElement);
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('svg')).toHaveTextContent('Best day');
    await expect(canvasElement.querySelector('svg')).toHaveTextContent('Today');
    await expect(
      canvas.getByRole('table', { name: 'Data for Sales per weekday' }),
    ).toBeInTheDocument();
  },
};

export const LineHighlight: Story = {
  args: {
    type: 'line',
    data: thirtyDays,
    highlight: { 29: 'Today', 12: 'Best day' },
    format: (value: number) => formatCurrency(value, 'USD', 'en-US', { notation: 'compact' }),
    'aria-label': 'Sales, last 30 days',
  },
};

/** The axis always includes zero and bars hang below it for negative values. */
export const NegativeValues: Story = {
  args: {
    data: [
      { label: 'Jan', value: 120 },
      { label: 'Feb', value: -45 },
      { label: 'Mar', value: 80 },
      { label: 'Apr', value: -130 },
      { label: 'May', value: 60 },
    ],
    'aria-label': 'Profit and loss',
  },
};

/** Tiny values still get a readable, round axis. */
export const SmallValues: Story = {
  args: {
    type: 'line',
    data: [
      { label: 'A', value: 0.00001 },
      { label: 'B', value: 0.000032 },
      { label: 'C', value: 0.000018 },
    ],
    format: (value: number) => value.toExponential(0),
    'aria-label': 'Error rate',
  },
};

export const AllZero: Story = {
  args: {
    data: weekdays.map((datum) => ({ ...datum, value: 0 })),
    'aria-label': 'Returns per weekday',
  },
};

export const SinglePoint: Story = {
  args: { type: 'line', data: [{ label: 'Mon', value: 42 }], 'aria-label': 'Sales today' },
};

export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvasElement }) => {
    await waitForDraw(canvasElement);
    await expect(within(canvasElement).getByText('No data to show')).toBeInTheDocument();
  },
};

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-6)' }}>
      {(['accent', 'neutral', 'success', 'warning', 'danger'] as const).map((tone) => (
        <Chart
          key={tone}
          {...args}
          type="line"
          tone={tone}
          height={96}
          aria-label={`Line, ${tone}`}
        />
      ))}
    </div>
  ),
};

export const CustomHeight: Story = { args: { height: 320 } };

/** With many points, category labels are skipped so they never overlap; the table keeps all of them. */
export const ManyPoints: Story = {
  args: { data: thirtyDays, 'aria-label': 'Sales, last 30 days' },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 360 }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Tab focuses the chart; the arrow keys, Home and End move between points; each point is
 * announced politely and shown in a label. Escape clears it.
 */
export const KeyboardNavigation: Story = {
  args: { highlight: { 6: 'Today' } },
  play: async ({ canvasElement }) => {
    await waitForDraw(canvasElement);
    const canvas = within(canvasElement);
    await userEvent.tab();
    const chart = canvas.getByRole('img', { name: 'Sales per weekday' });
    await expect(chart).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Mon: 42. 1 of 7');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Wed: 31. 3 of 7');
    await expect(canvas.getByText('31 · Wed')).toBeInTheDocument();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Sun: 18, Today. 7 of 7');
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByText('18 · Sun · Today')).not.toBeInTheDocument();
  },
};

/** Hover shows the same label as the keyboard. */
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await waitForDraw(canvasElement);
    const canvas = within(canvasElement);
    const chart = canvas.getByRole('img', { name: 'Sales per weekday' });
    const box = chart.getBoundingClientRect();
    await userEvent.pointer({
      target: chart,
      coords: { clientX: box.right - 20, clientY: box.top + 80 },
    });
    await expect(canvas.getByText('18 · Sun')).toBeInTheDocument();
  },
};

/** Instructions, announcements, the table caption and number formats follow the provider locale. */
export const PortugueseBrazil: Story = {
  args: {
    data: [
      { label: 'Seg', value: 1234.5 },
      { label: 'Ter', value: 2890 },
      { label: 'Qua', value: 1520.25 },
    ],
    'aria-label': 'Vendas por dia',
    valueLabel: 'Vendas',
    categoryLabel: 'Dia',
  },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForDraw(canvasElement);
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Seg: 1.234,5. 1 de 3');
  },
};
