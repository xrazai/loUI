import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { MatrixGrid } from './MatrixGrid';
import type { MatrixGridProps } from './MatrixGrid';
import { StoryFrame } from '../../test/StoryFrame';

const rows = [
  { id: 'backpack', label: 'Backpack', meta: 'BKP-02' },
  { id: 'lamp', label: 'Desk lamp', meta: 'LMP-01' },
  { id: 'notebook', label: 'Notebook', meta: 'NTB-07' },
];

const columns = [
  { id: 'navy', label: 'Navy', color: '#1f3a93' },
  { id: 'yellow', label: 'Yellow', color: '#ffd400' },
  { id: 'gray', label: 'Gray', color: '#808080' },
  { id: 'red', label: 'Brick red', color: '#c0392b' },
  { id: 'white', label: 'White', color: '#ffffff' },
];

const initial = ['lamp:navy', 'notebook:yellow', 'notebook:red'];

type StatefulProps = Omit<
  MatrixGridProps,
  'isLinked' | 'onToggle' | 'aria-label' | 'rows' | 'columns'
> &
  Partial<Pick<MatrixGridProps, 'aria-label' | 'rows' | 'columns'>>;

/** Owns the linked cells; ignores `isLinked` / `onToggle` coming from the story args. */
function Stateful(props: StatefulProps) {
  const [linked, setLinked] = useState(() => new Set(initial));
  return (
    <MatrixGrid
      aria-label="Product colors"
      rows={rows}
      columns={columns}
      {...props}
      isLinked={(row, column) => linked.has(`${row}:${column}`)}
      onToggle={(row, column) => {
        const key = `${row}:${column}`;
        setLinked((current) => {
          const next = new Set(current);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return next;
        });
      }}
    />
  );
}

const meta = {
  title: 'Patterns/MatrixGrid',
  component: MatrixGrid,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Product colors',
    rows,
    columns,
    isLinked: (row: string, column: string) => initial.includes(`${row}:${column}`),
    onToggle: fn(),
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={760}>
        <Story />
      </StoryFrame>
    ),
  ],
  // The grid is up to 760 px wide; at the default 384 px frame its columns are clipped.
  parameters: { visual: { width: 800 } },
} satisfies Meta<typeof MatrixGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Stateful {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid', { name: 'Product colors' })).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Desk lamp · Navy: linked' }),
    ).toBeInTheDocument();
  },
};

export const WithCountAndHint: Story = {
  render: (args) => (
    <Stateful
      {...args}
      cornerLabel="Product"
      countLabel="Linked"
      hint="Select a cell to link or unlink a color."
    />
  ),
};

/** Bright, dark and mid-tone colors: the check mark switches by WCAG contrast. */
export const CheckContrast: Story = {
  args: {
    rows: [{ id: 'all', label: 'All linked' }],
    columns: ['#ffffff', '#ffd400', '#808080', '#c0392b', '#1f3a93', '#000000'].map((color) => ({
      id: color,
      label: color,
      color,
    })),
    isLinked: () => true,
  },
};

export const WithoutColors: Story = {
  args: {
    columns: [
      { id: 'a', label: 'Small' },
      { id: 'b', label: 'Medium' },
      { id: 'c', label: 'Large' },
    ],
  },
};

/** The region scrolls horizontally and is focusable and labelled. */
export const ManyColumns: Story = {
  render: (args) => (
    <Stateful
      {...args}
      countLabel="Linked"
      columns={Array.from({ length: 14 }, (_, index) => ({
        id: `c${String(index)}`,
        label: `Shade ${String(index + 1)}`,
        color: `#${((index * 18) % 256).toString(16).padStart(2, '0')}80c0`,
      }))}
    />
  ),
};

export const LongLabels: Story = {
  args: {
    rows: [
      {
        id: 'a',
        label: 'Ergonomic adjustable standing desk with cable management',
        meta: 'DSK-2048',
      },
    ],
    columns: [{ id: 'x', label: 'Midnight blue with a very long name', color: '#1f3a93' }],
  },
};

export const Empty: Story = { args: { rows: [] } };

/** One tab stop for the grid; arrows, Home/End and Ctrl+Home/End move; Space and Enter toggle. */
export const KeyboardNavigation: Story = {
  render: (args) => <Stateful {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Backpack · Navy: not linked' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(
      canvas.getByRole('button', { name: 'Desk lamp · Yellow: not linked' }),
    ).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(
      canvas.getByRole('button', { name: 'Desk lamp · White: not linked' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Control>}{End}{/Control}');
    await expect(
      canvas.getByRole('button', { name: 'Notebook · White: not linked' }),
    ).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('button', { name: 'Notebook · White: linked' })).toHaveFocus();
    await userEvent.keyboard('{Control>}{Home}{/Control}');
    await expect(canvas.getByRole('button', { name: 'Backpack · Navy: not linked' })).toHaveFocus();
  },
};

/**
 * `onToggle` returns a promise: the cell shows a spinner and ignores repeat toggles while it
 * runs. "Brick red" always fails, so `onToggleError` runs (here it only logs; use a toast).
 */
export const AsyncToggle: Story = {
  render: (args) => {
    function Async() {
      const [linked, setLinked] = useState(() => new Set(initial));
      return (
        <MatrixGrid
          {...args}
          isLinked={(row, column) => linked.has(`${row}:${column}`)}
          onToggle={async (row, column) => {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            if (column === 'red') throw new Error('Request failed');
            setLinked((current) => {
              const next = new Set(current);
              const key = `${row}:${column}`;
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return next;
            });
          }}
          onToggleError={() => undefined}
        />
      );
    }
    return <Async />;
  },
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Backpack · Gray: not linked' }));
    await expect(
      canvas.getByRole('button', { name: 'Backpack · Gray: not linked, saving' }),
    ).toBeVisible();
  },
};

/** The header row and the row header stay in view while the region scrolls in both directions. */
export const StickyHeaders: Story = {
  render: (args) => (
    <div style={{ blockSize: 280, display: 'flex' }}>
      <Stateful
        {...args}
        cornerLabel="Product"
        style={{ flex: 1 }}
        rows={Array.from({ length: 20 }, (_, index) => ({
          id: `p${String(index)}`,
          label: `Product ${String(index + 1)}`,
        }))}
        columns={Array.from({ length: 14 }, (_, index) => ({
          id: `c${String(index)}`,
          label: `Shade ${String(index + 1)}`,
        }))}
      />
    </div>
  ),
};

export const Portuguese: Story = {
  render: (args) => (
    <DSProvider locale="pt-BR">
      <Stateful {...args} aria-label="Cores do produto" countLabel="Vinculadas" />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Desk lamp · Navy: vinculado' }),
    ).toBeInTheDocument();
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <DSProvider locale="ar">
      <div dir="rtl">
        <Stateful {...args} countLabel="Linked" />
      </div>
    </DSProvider>
  ),
};

export const Focused: Story = {
  render: (args) => <Stateful {...args} />,
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
    await userEvent.tab();
  },
};
