import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline } from './Timeline';
import type { TimelineItem } from './Timeline';
import { StoryFrame } from '../../test/StoryFrame';

const EVENTS: TimelineItem[] = [
  {
    id: 'created',
    time: '2026-10-28T09:15:00Z',
    title: 'Request created',
    actor: 'Ana Costa',
  },
  {
    id: 'review',
    time: '2026-10-29T13:40:00Z',
    title: 'Review started',
    description: 'Assigned to the operations team.',
    actor: 'Lee Park',
  },
  {
    id: 'approved',
    time: '2026-10-31T16:05:00Z',
    title: 'Request approved',
    tone: 'success',
    actor: 'Dana Lopez',
  },
];

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Request history',
    items: EVENTS,
    timeZone: 'UTC',
  },
  argTypes: {
    order: { control: 'inline-radio', options: ['newest-first', 'oldest-first', 'as-given'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={480}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Newest first, the default order for dated records. */
export const Default: Story = {};

export const OldestFirst: Story = { args: { order: 'oldest-first' } };

export const Tones: Story = {
  args: {
    items: [
      { id: 'n', time: '2026-10-31T08:00:00Z', title: 'Neutral event' },
      { id: 'a', time: '2026-10-31T09:00:00Z', title: 'Highlighted event', tone: 'accent' },
      { id: 's', time: '2026-10-31T10:00:00Z', title: 'Succeeded', tone: 'success' },
      {
        id: 'w',
        time: '2026-10-31T11:00:00Z',
        title: 'Needs attention',
        tone: 'warning',
        description: 'The retry limit is almost reached.',
      },
      {
        id: 'd',
        time: '2026-10-31T12:00:00Z',
        title: 'Failed',
        tone: 'danger',
        description: 'The remote service did not answer.',
      },
    ],
  },
};

/** A date without a time is shown as a date. */
export const DateOnly: Story = {
  args: {
    items: [
      { id: 'a', time: '2026-10-01', title: 'Plan started' },
      { id: 'b', time: '2026-10-15', title: 'Plan renewed', tone: 'success' },
    ],
  },
};

export const LongText: Story = {
  args: {
    items: [
      {
        id: 'long',
        time: '2026-10-31T16:05:00Z',
        title:
          'The import finished with warnings because several rows referred to products that no longer exist',
        description:
          'REF-1048-REF-1048-REF-1048-REF-1048-REF-1048-REF-1048 and 37 other rows were skipped. Download the report to review them.',
        actor: 'A very long name of an actor that keeps going and going',
        tone: 'warning',
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

export const SingleEvent: Story = { args: { items: EVENTS.slice(0, 1) } };

export const Empty: Story = {
  args: { items: [], empty: <p>No events yet. Activity appears here as it happens.</p> },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <StoryFrame dir="rtl" maxWidth={480}>
        <Story />
      </StoryFrame>
    ),
  ],
};
