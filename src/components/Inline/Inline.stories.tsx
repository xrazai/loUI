import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Inline } from './Inline';

function Chip({ children }: { children: string }) {
  return (
    <span
      style={{
        padding: '4px 12px',
        border: '1px solid var(--ds-line)',
        borderRadius: 'var(--ds-radius-pill)',
        background: 'var(--ds-surface)',
        color: 'var(--ds-text)',
      }}
    >
      {children}
    </span>
  );
}

const chips = ['Open', 'Paid', 'Overdue', 'Archived'].map((label) => (
  <Chip key={label}>{label}</Chip>
));

const meta = {
  title: 'Layout/Inline',
  component: Inline,
  tags: ['autodocs'],
  args: { children: chips },
  argTypes: {
    gap: { control: 'select', options: [1, 2, 3, 4, 5, 6, 8, 12, 16] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'baseline', 'stretch'] },
    justify: { control: 'inline-radio', options: ['start', 'center', 'end', 'between'] },
    wrap: { control: 'boolean' },
  },
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LargeGap: Story = { args: { gap: 6 } };

export const JustifyBetween: Story = { args: { justify: 'between' } };

export const JustifyEnd: Story = {
  args: {
    justify: 'end',
    children: [
      <button key="cancel" type="button">
        Cancel
      </button>,
      <button key="save" type="button">
        Save changes
      </button>,
    ],
  },
};

export const AlignBaseline: Story = {
  args: {
    align: 'baseline',
    children: [
      <span key="n" style={{ fontSize: 'var(--ds-fs-num)', color: 'var(--ds-text)' }}>
        1,240
      </span>,
      <span key="l" style={{ color: 'var(--ds-text-2)' }}>
        orders this month
      </span>,
    ],
  },
};

/** Wraps onto a second line in a narrow container: a row never overflows a phone. */
export const Wrapping: Story = {
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 180 }}>
        <Story />
      </div>
    ),
  ],
};

/** With wrap off, children stay on one line and the row scrolls or clips: use it only for short rows. */
export const NoWrap: Story = {
  args: { wrap: false },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 180, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};

export const AsList: Story = {
  args: {
    as: 'ul',
    children: [<li key="1">Orders</li>, <li key="2">Customers</li>],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(2);
  },
};

/** The row mirrors: the first child sits at the right in right-to-left text. */
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
