import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ScrollArea } from './ScrollArea';
import type { ScrollAreaProps } from './ScrollArea';

/** Storybook cannot infer args from a union: use the variant with an `aria-label`. */
type LabelledScrollAreaProps = Extract<ScrollAreaProps, { 'aria-label': string }>;

function Rows({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <p key={index} style={{ margin: 0, padding: '8px 12px', color: 'var(--ds-text)' }}>
      Row {index + 1}
    </p>
  ));
}

const meta = {
  title: 'Layout/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  args: { 'aria-label': 'Order history', children: <Rows count={30} /> },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal', 'both'] },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          inlineSize: 280,
          blockSize: 160,
          border: '1px solid var(--ds-line)',
          borderRadius: 'var(--ds-radius-lg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<LabelledScrollAreaProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Overflowing content: the area is a labelled region and a keyboard stop. Press Tab, then PageDown (the browser test covers the scrolling itself). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', { name: 'Order history' });
    await waitFor(() => expect(region).toHaveAttribute('tabindex', '0'));
    await userEvent.tab();
    await expect(region).toHaveFocus();
  },
};

/** Nothing overflows: a plain container, no tab stop and no landmark. */
export const NotScrollable: Story = {
  args: { children: <Rows count={2} /> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('region')).toBeNull();
  },
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    'aria-label': 'Wide table',
    children: (
      <p style={{ margin: 0, padding: 12, whiteSpace: 'nowrap', color: 'var(--ds-text)' }}>
        A very long line of text that does not wrap and needs a sideways scroll to read in full.
      </p>
    ),
  },
};

export const Both: Story = {
  args: {
    orientation: 'both',
    'aria-label': 'Grid of values',
    children: (
      <div style={{ inlineSize: 600, color: 'var(--ds-text)' }}>
        <Rows count={20} />
      </div>
    ),
  },
};

export const LabelledBy: Story = {
  render: () => (
    <>
      <h3 id="activity-title" style={{ margin: '0 0 8px', color: 'var(--ds-text)' }}>
        Activity
      </h3>
      <div
        style={{
          blockSize: 120,
          inlineSize: 280,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--ds-line)',
        }}
      >
        <ScrollArea aria-labelledby="activity-title">
          <Rows count={30} />
        </ScrollArea>
      </div>
    </>
  ),
  decorators: [],
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
