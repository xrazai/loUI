import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card';
import { Grid } from './Grid';
import type { GridProps } from './Grid';

const cards = ['Storage', 'Orders', 'Customers', 'Invoices', 'Returns', 'Shipping'].map((title) => (
  <Card key={title} title={title}>
    <p style={{ margin: 0, color: 'var(--ds-text-2)' }}>Summary for {title.toLowerCase()}.</p>
  </Card>
));

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { columns: 3, children: cards },
  argTypes: {
    columns: { control: 'select', options: [1, 2, 3, 4, 6, 12] },
    minItemWidth: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    gap: { control: 'select', options: [1, 2, 3, 4, 5, 6, 8, 12, 16] },
  },
} satisfies Meta<GridProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoColumns: Story = { args: { columns: 2, gap: 6 } };

/** As many columns as fit, each at least 240px wide. Resize the canvas to see it reflow. */
export const AutoFillMedium: Story = {
  args: { columns: undefined, minItemWidth: 'md' } as unknown as GridProps,
};

export const AutoFillSmall: Story = {
  args: { columns: undefined, minItemWidth: 'sm' } as unknown as GridProps,
};

export const AutoFillLarge: Story = {
  args: { columns: undefined, minItemWidth: 'lg' } as unknown as GridProps,
};

/** In a container narrower than the minimum item width the grid is one column and never overflows. */
export const NarrowContainer: Story = {
  args: { columns: undefined, minItemWidth: 'lg' } as unknown as GridProps,
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 240 }}>
        <Story />
      </div>
    ),
  ],
};

export const LongText: Story = {
  args: {
    columns: 2,
    children: [
      <Card key="a" title="A long title that wraps inside its column">
        <p style={{ margin: 0, overflowWrap: 'anywhere' }}>ORD-1048-ORD-1048-ORD-1048-ORD-1048</p>
      </Card>,
      <Card key="b" title="Short">
        <p style={{ margin: 0 }}>Content</p>
      </Card>,
    ],
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
