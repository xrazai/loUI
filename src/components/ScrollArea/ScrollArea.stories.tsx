import { StoryFrame } from '../../test/StoryFrame';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ScrollArea } from './ScrollArea';
import type { ScrollAreaProps } from './ScrollArea';

/** Storybook cannot infer args from a union: use the variant with an `aria-label`. */
type LabelledScrollAreaProps = Extract<ScrollAreaProps, { 'aria-label': string }>;

function Rows({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <p
      key={index}
      style={{ margin: 0, padding: 'var(--ds-space-2) var(--ds-space-3)', color: 'var(--ds-text)' }}
    >
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
      <StoryFrame width={280} height={160} box>
        <Story />
      </StoryFrame>
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
/** `maxBlockSize` lets the region grow with its content up to a cap, then scroll (a visible list of N rows). */
export const MaxHeight: Story = {
  args: { maxBlockSize: '8rem' },
  decorators: [
    (Story) => (
      <StoryFrame width={280} box>
        <Story />
      </StoryFrame>
    ),
  ],
};

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
      <p
        style={{
          margin: 0,
          padding: 'var(--ds-space-3)',
          whiteSpace: 'nowrap',
          color: 'var(--ds-text)',
        }}
      >
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
      <StoryFrame width={600}>
        <Rows count={20} />
      </StoryFrame>
    ),
  },
};

export const LabelledBy: Story = {
  render: () => (
    <>
      <h3 id="activity-title" style={{ margin: '0 0 var(--ds-space-2)', color: 'var(--ds-text)' }}>
        Activity
      </h3>
      <StoryFrame width={280} height={120} box>
        <ScrollArea aria-labelledby="activity-title">
          <Rows count={30} />
        </ScrollArea>
      </StoryFrame>
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
