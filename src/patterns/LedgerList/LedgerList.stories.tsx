import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { LedgerList } from './LedgerList';
import type { LedgerEntry } from './LedgerList';
import { StoryFrame } from '../../test/StoryFrame';

const entries: LedgerEntry[] = [
  {
    id: 'e4',
    date: '2026-03-14',
    title: 'Refund',
    sub: 'Order 1048',
    delta: -2500,
    balance: 12500,
  },
  {
    id: 'e3',
    date: '2026-03-12',
    title: 'Payment received',
    sub: 'Bank transfer',
    delta: 5000,
    balance: 15000,
  },
  { id: 'e2', date: '2026-03-05', title: 'Service fee', delta: -1000, balance: 10000 },
  { id: 'e1', date: '2026-03-01', title: 'Opening balance', delta: 11000, balance: 11000 },
];

const meta = {
  title: 'Patterns/LedgerList',
  component: LedgerList,
  tags: ['autodocs'],
  args: { 'aria-label': 'Account activity', entries, currency: 'USD' },
  argTypes: {
    negativeTone: { control: 'inline-radio', options: ['neutral', 'success', 'warning', 'danger'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={560}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof LedgerList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('list', { name: 'Account activity' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    await expect(canvas.getByText('Balance $125.00')).toBeInTheDocument();
  },
};

export const NegativeAsSuccess: Story = { args: { negativeTone: 'success' } };

export const NegativeNeutral: Story = { args: { negativeTone: 'neutral' } };

export const WithoutBalance: Story = {
  args: {
    entries: entries.map(({ id, date, title, delta }) => ({ id, date, title, delta })),
  },
};

/** Plain quantities: no currency, numbers formatted for the locale. */
export const Quantities: Story = {
  render: () => (
    <LedgerList
      aria-label="Stock movements"
      entries={[
        { id: 'a', date: '2026-03-12', title: 'Delivery received', delta: 120, balance: 340 },
        { id: 'b', date: '2026-03-10', title: 'Shipped to customer', delta: -45, balance: 220 },
      ]}
    />
  ),
};

/** A custom formatter receives the absolute amount in the same unit as `delta`. */
export const CustomFormat: Story = {
  render: (args) => (
    <LedgerList
      aria-label="Weights"
      entries={args.entries}
      format={(value) => `${(value / 100).toFixed(1)} kg`}
    />
  ),
};

export const LongText: Story = {
  args: {
    entries: [
      {
        id: 'l',
        date: '2026-03-12',
        title: 'Payment received from a customer with a very long registered company name',
        sub: 'Reference 0000-1111-2222-3333-4444 with a very long note attached to it',
        delta: 123456789,
        balance: 987654321,
      },
    ],
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={420}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const Empty: Story = { args: { entries: [] } };

function DeletableExample() {
  const [rows, setRows] = useState(entries);
  return (
    <LedgerList
      aria-label="Account activity"
      entries={rows}
      currency="USD"
      onDelete={(entry) => {
        setRows((current) => current.filter((row) => row.id !== entry.id));
      }}
    />
  );
}

/** The consumer is responsible for confirming before data is removed. */
export const Deletable: Story = {
  render: () => <DeletableExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button')).toHaveLength(4);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete entry Service fee' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

export const KeyboardDelete: Story = {
  args: { onDelete: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Delete entry Refund' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onDelete).toHaveBeenCalledWith(entries[0]);
  },
};

export const Portuguese: Story = {
  render: (args) => (
    <DSProvider locale="pt-BR">
      <LedgerList {...args} aria-label="Movimentação" onDelete={() => undefined} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Excluir lançamento Refund' }),
    ).toBeInTheDocument();
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <DSProvider locale="ar">
        <StoryFrame dir="rtl" maxWidth={560}>
          <Story />
        </StoryFrame>
      </DSProvider>
    ),
  ],
};

export const Focused: Story = {
  args: { onDelete: fn() },
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
