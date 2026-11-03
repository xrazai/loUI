import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../components/Button';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Sheet } from '../../components/Sheet';
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

/** 384 px with date, amount, balance, edit and delete: the date moves under the title. */
export const NarrowEditableAndDeletable: Story = {
  args: { onEdit: fn(), onDelete: fn() },
  parameters: { visual: { width: 384 } },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={384}>
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

/** Edit and delete side by side; edit comes first. Fixed rows keep the column. */
export const EditableAndDeletable: Story = {
  args: {
    onEdit: fn(),
    onDelete: fn(),
    entries: entries.map((entry) => (entry.id === 'e1' ? { ...entry, isEditable: false } : entry)),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Edit entry Refund' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onEdit).toHaveBeenCalledWith(entries[0]);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Delete entry Refund' })).toHaveFocus();
    await expect(
      canvas.queryByRole('button', { name: 'Edit entry Opening balance' }),
    ).not.toBeInTheDocument();
  },
};

/** Edit only, without delete. */
export const EditOnly: Story = { args: { onEdit: fn() } };

function SheetEditExample() {
  const [rows, setRows] = useState(entries);
  const [editing, setEditing] = useState<LedgerEntry | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  return (
    <>
      <LedgerList
        aria-label="Account activity"
        entries={rows}
        currency="USD"
        onEdit={(entry) => {
          setAmount(Math.abs(entry.delta));
          setEditing(entry);
        }}
      />
      <Sheet
        title={editing ? `Edit ${editing.title}` : 'Edit entry'}
        isOpen={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        footer={({ close }) => (
          <>
            <Button variant="secondary" onPress={close}>
              Cancel
            </Button>
            <Button
              onPress={() => {
                const current = editing;
                if (current && amount !== null) {
                  const delta = current.delta < 0 ? -amount : amount;
                  setRows((all) =>
                    all.map((row) => (row.id === current.id ? { ...row, delta } : row)),
                  );
                }
                close();
              }}
            >
              Save entry
            </Button>
          </>
        )}
      >
        <CurrencyInput label="Amount" currency="USD" value={amount} onChange={setAmount} />
      </Sheet>
    </>
  );
}

/**
 * The consumer owns the editing UI: here a `Sheet` with a `CurrencyInput`. When the sheet
 * closes, focus returns to the edit button that opened it.
 */
export const EditInSheet: Story = {
  render: () => <SheetEditExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Edit entry Service fee' });
    await userEvent.click(button);
    const sheet = await screen.findByRole('dialog', { name: 'Edit Service fee' });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(button).toHaveFocus());
  },
};

function InlineEditExample() {
  const [rows, setRows] = useState(entries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = rows.find((row) => row.id === editingId);
  return (
    <div style={{ display: 'grid', gap: 'var(--ds-space-3)' }}>
      <LedgerList
        aria-label="Account activity"
        entries={rows}
        currency="USD"
        onEdit={(entry) => {
          setEditingId(entry.id);
        }}
      />
      {editing ? (
        <CurrencyInput
          label={`Amount of ${editing.title}`}
          currency="USD"
          defaultValue={Math.abs(editing.delta)}
          onChange={(value) => {
            if (value !== null) {
              const delta = editing.delta < 0 ? -value : value;
              setRows((all) => all.map((row) => (row.id === editing.id ? { ...row, delta } : row)));
            }
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * Inline editing stays with the consumer too: `onEdit` reveals a `CurrencyInput` (here under the
 * list; it could replace the row) and the consumer moves focus into it.
 */
export const EditInline: Story = {
  render: () => <InlineEditExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit entry Refund' }));
    await expect(canvas.getByRole('textbox', { name: 'Amount of Refund' })).toBeInTheDocument();
  },
};

/** `isDeletable: false` marks fixed rows: no button, and the amounts stay aligned. */
export const MixedDeletableAndFixed: Story = {
  args: {
    onDelete: fn(),
    entries: entries.map((entry) =>
      entry.id === 'e1' || entry.id === 'e3' ? { ...entry, isDeletable: false } : entry,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
    await expect(
      canvas.queryByRole('button', { name: 'Delete entry Opening balance' }),
    ).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Delete entry Refund' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Delete entry Service fee' })).toHaveFocus();
  },
};

/** Entries without a date keep the date column when other rows have one. */
export const WithoutDate: Story = {
  args: {
    entries: [
      { id: 'n3', date: '2026-03-14', title: 'Refund', sub: 'Order 1048', delta: -2500 },
      { id: 'n2', title: 'Manual adjustment', sub: 'No date recorded', delta: 500 },
      { id: 'n1', title: 'Opening balance', delta: 11000, isDeletable: false },
    ],
    onDelete: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('time')).toHaveLength(1);
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
  },
};

/** When no entry has a date, the date column is dropped entirely. */
export const NoDatesAtAll: Story = {
  args: {
    entries: [
      { id: 'q2', title: 'Delivery received', delta: 120, balance: 340 },
      { id: 'q1', title: 'Opening stock', delta: 220, balance: 220, isDeletable: false },
    ],
    onDelete: fn(),
  },
  render: (args) => (
    <LedgerList aria-label="Stock movements" entries={args.entries} onDelete={() => undefined} />
  ),
};

export const Portuguese: Story = {
  render: (args) => (
    <DSProvider locale="pt-BR">
      <LedgerList
        {...args}
        aria-label="Movimentação"
        onEdit={() => undefined}
        onDelete={() => undefined}
      />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Excluir lançamento Refund' }),
    ).toBeInTheDocument();
    await expect(
      within(canvasElement).getByRole('button', { name: 'Editar lançamento Refund' }),
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
