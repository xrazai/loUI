import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { StoryFrame } from '../../test/StoryFrame';
import { Chart } from '../Chart';
import { Legend } from './Legend';
import type { LegendItem, LegendProps } from './Legend';

const channels: LegendItem[] = [
  { id: 'online', label: 'Online', value: '1,240' },
  { id: 'store', label: 'Store', value: '860' },
  { id: 'phone', label: 'Phone', value: '310' },
];

const meta = {
  title: 'Components/Legend',
  component: Legend,
  tags: ['autodocs'],
  args: { items: channels },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={420}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<LegendProps>;

export default meta;
type Story = StoryObj<LegendProps>;

/** A plain list: swatch, name and an optional value. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('list', { name: 'Legend' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

export const Vertical: Story = { args: { orientation: 'vertical' } };

export const NamesOnly: Story = {
  args: { items: channels.map(({ id, label }) => ({ id, label })) },
};

/** Beyond four series the ramp repeats with a hatch, so no two swatches look alike. */
export const EightSeries: Story = {
  args: {
    items: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'].map(
      (label) => ({ id: label.toLowerCase(), label }),
    ),
  },
};

/** Explicit colors are for when the neutral ramp is not enough; the label still names every series. */
export const ExplicitColors: Story = {
  args: {
    items: [
      { id: 'paid', label: 'Paid', color: 'var(--ds-success)' },
      { id: 'pending', label: 'Pending', color: 'var(--ds-warning)' },
      { id: 'overdue', label: 'Overdue', color: 'var(--ds-danger)' },
    ],
  },
};

/**
 * Interactive items are toggle buttons (`aria-pressed`: pressed means shown). A hidden series
 * shows a hollow swatch and a struck label, not only a color change.
 */
export const Interactive: Story = {
  args: { interactive: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const store = canvas.getByRole('button', { name: /Store/ });
    await expect(store).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(store);
    await expect(store).toHaveAttribute('aria-pressed', 'false');
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard(' ');
  },
};

export const InteractiveWithHiddenSeries: Story = {
  args: { interactive: true, defaultHiddenIds: ['phone'] },
};

export const LongLabels: Story = {
  args: {
    orientation: 'vertical',
    items: [
      { id: 'a', label: 'Orders paid with a credit card in twelve installments', value: '12' },
      { id: 'b', label: 'Bank transfer', value: '5' },
    ],
  },
};

/** The legend is not tied to a chart: keep the hidden ids in state and filter your data. */
export const WithChart: Story = {
  render: () => {
    const series = [
      { id: 'online', label: 'Online', data: [12, 18, 15, 22] },
      { id: 'store', label: 'Store', data: [8, 10, 14, 9] },
    ];
    function Demo() {
      const [hidden, setHidden] = useState<string[]>([]);
      const shown = series.filter((s) => !hidden.includes(s.id));
      const first = shown[0];
      return (
        <div style={{ display: 'grid', gap: 'var(--ds-space-3)' }}>
          <Legend
            items={series.map(({ id, label }) => ({ id, label }))}
            interactive
            hiddenIds={hidden}
            onHiddenIdsChange={setHidden}
          />
          <Chart
            aria-label={first ? `${first.label} per quarter` : 'Nothing selected'}
            data={(first?.data ?? []).map((value, index) => ({
              label: `Q${String(index + 1)}`,
              value,
            }))}
          />
        </div>
      );
    }
    return <Demo />;
  },
};

export const PortugueseBrazil: Story = {
  args: { interactive: true },
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
      <StoryFrame maxWidth={420} dir="rtl">
        <Story />
      </StoryFrame>
    ),
  ],
};
