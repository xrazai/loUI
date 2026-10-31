import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stack } from './Stack';

function Box({ children }: { children: string }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        border: '1px solid var(--ds-line)',
        borderRadius: 'var(--ds-radius-md)',
        background: 'var(--ds-surface)',
        color: 'var(--ds-text)',
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: {
    children: [<Box key="1">First</Box>, <Box key="2">Second</Box>, <Box key="3">Third</Box>],
  },
  argTypes: {
    gap: { control: 'select', options: [1, 2, 3, 4, 5, 6, 8, 12, 16] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'stretch'] },
    as: { control: 'select', options: ['div', 'section', 'ul', 'ol'] },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SmallGap: Story = { args: { gap: 1 } };

export const LargeGap: Story = { args: { gap: 8 } };

export const AlignStart: Story = { args: { align: 'start' } };

export const AlignCenter: Story = { args: { align: 'center' } };

export const AlignEnd: Story = { args: { align: 'end' } };

/** As a list: the list reset is applied and the list role is kept. */
export const AsList: Story = {
  args: {
    as: 'ul',
    gap: 2,
    children: [<li key="1">Orders</li>, <li key="2">Customers</li>, <li key="3">Invoices</li>],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(3);
  },
};

/** Children shrink instead of overflowing a narrow container. */
export const LongText: Story = {
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 240 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    children: [
      <Box key="1">A long label that has to wrap inside a narrow column without overflowing</Box>,
      <Box key="2">ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048</Box>,
    ],
  },
};

/** Mirrors nothing (it is vertical), but start and end alignment follow the writing direction. */
export const RightToLeft: Story = {
  args: { align: 'start' },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
