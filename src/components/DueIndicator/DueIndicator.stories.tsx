import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { DueIndicator } from './DueIndicator';

const meta = {
  title: 'Components/DueIndicator',
  component: DueIndicator,
  tags: ['autodocs'],
  // A fixed day keeps the stories (and their visual baselines) deterministic.
  args: { date: '2026-03-14', today: '2026-03-10' },
  argTypes: {
    dateStyle: {
      control: 'select',
      options: ['short', 'medium', 'long', 'full', 'monthDay', 'monthYear'],
    },
  },
} satisfies Meta<typeof DueIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Due in 4 days')).toBeInTheDocument();
  },
};

export const Overdue: Story = {
  args: { date: '2026-03-07' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Overdue by 3 days')).toBeInTheDocument();
  },
};

export const DueToday: Story = { args: { date: '2026-03-10' } };

export const DueTomorrow: Story = { args: { date: '2026-03-11' } };

export const Later: Story = { args: { date: '2026-04-20' } };

export const Paid: Story = {
  args: { date: '2026-03-01', paid: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Paid')).toBeInTheDocument();
  },
};

export const WithoutDate: Story = { args: { showDate: false } };

export const LongDate: Story = { args: { dateStyle: 'long' } };

/** Calendar-day arithmetic: the daylight-saving change does not shift the count. */
export const AcrossDaylightSaving: Story = {
  args: { today: '2026-03-07', date: '2026-03-09' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Due in 2 days')).toBeInTheDocument();
  },
};

export const AllTones: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-2)' }}>
      <DueIndicator {...args} date="2026-03-07" />
      <DueIndicator {...args} date="2026-03-10" />
      <DueIndicator {...args} date="2026-04-20" />
      <DueIndicator {...args} date="2026-03-07" paid />
    </div>
  ),
};

export const Portuguese: Story = {
  render: (args) => (
    <DSProvider locale="pt-BR">
      <div style={{ display: 'grid', gap: 'var(--ds-space-2)' }}>
        <DueIndicator {...args} date="2026-03-07" />
        <DueIndicator {...args} date="2026-03-10" />
        <DueIndicator {...args} date="2026-03-11" />
        <DueIndicator {...args} paid />
      </div>
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Vence hoje')).toBeInTheDocument();
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <DSProvider locale="ar">
        <div dir="rtl">
          <Story />
        </div>
      </DSProvider>
    ),
  ],
};
