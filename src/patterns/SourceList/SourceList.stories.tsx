import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { StoryFrame } from '../../test/StoryFrame';
import { Citation, SourceList } from './SourceList';
import type { Source } from './SourceList';

const sources: Source[] = [
  {
    id: 'a',
    title: 'Order lifecycle and statuses',
    url: 'https://www.example.com/docs/orders/lifecycle',
    snippet: 'An order moves from open to paid, packed and shipped. Each change is logged.',
  },
  {
    id: 'b',
    title: 'Shipping policy',
    url: 'https://help.example.org/shipping',
    domain: 'help.example.org',
  },
  { id: 'c', title: 'Internal note, March review' },
];

const meta = {
  title: 'Patterns/SourceList',
  component: SourceList,
  tags: ['autodocs'],
  args: { id: 'sources', sources },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={560}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof SourceList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongText: Story = {
  args: {
    sources: [
      {
        id: 'x',
        title:
          'A very long document title that goes on and on so that it has to wrap onto several lines',
        url: 'https://example.com/a/very/long/path/that/keeps/going/and/going/and/going/forever',
        snippet:
          'A long excerpt that supports the claim, with an unbroken value: ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048.',
      },
    ],
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={560} dir="rtl">
        <Story />
      </StoryFrame>
    ),
  ],
};

/** Markers in a sentence jump to the matching source; focus lands on it. */
export const WithCitations: Story = {
  render: (args) => (
    <div>
      <p>
        Orders move through four statuses
        <Citation number={1} title={sources[0]?.title ?? ''} listId={args.id} sourceId="a" />, and
        shipping takes place after packing
        <Citation number={2} title={sources[1]?.title ?? ''} listId={args.id} sourceId="b" />.
      </p>
      <SourceList {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('link', { name: 'Source 2: Shipping policy' }));
    await expect(canvas.getAllByRole('listitem')[1]).toHaveFocus();
  },
};
