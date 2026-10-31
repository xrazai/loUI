import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ToastRegion, createToastApi, createToastQueue } from '../../components/Toast';
import { ApprovalCard } from './ApprovalCard';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Patterns/ApprovalCard',
  component: ApprovalCard,
  tags: ['autodocs'],
  args: {
    kind: 'question',
    author: 'buyer_sp',
    itemName: 'Knit jersey, black',
    itemColor: '#1b1b1d',
    when: 'today, 10:40',
    message: 'Do you have this backpack in mustard yellow?',
    defaultDraft: 'Hello. We have this backpack in black, navy and grey. Mustard is not available.',
    onSend: fn(),
    onDiscard: fn(),
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['question', 'review'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={640}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof ApprovalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Agent reply' });
    await userEvent.type(field, ' Thanks.');
    await userEvent.click(canvas.getByRole('button', { name: 'Send reply' }));
    await expect(args.onSend).toHaveBeenCalledTimes(1);
  },
};

export const Review: Story = {
  args: {
    kind: 'review',
    rating: 5,
    message: 'Great quality and fast delivery.',
    defaultDraft: 'Thank you for the review.',
  },
};

export const LowRatingWithFlag: Story = {
  args: {
    kind: 'review',
    rating: 2,
    message: 'The backpack came with a small defect at the zipper.',
    defaultDraft: 'Sorry about that. Please send us a photo so we can check the batch.',
    flag: '2-star review: read it carefully before sending.',
  },
};

export const Minimal: Story = {
  args: { author: undefined, itemName: undefined, itemColor: undefined, when: undefined },
};

export const LongText: Story = {
  args: {
    author: 'a_very_long_username_that_has_to_wrap_somewhere_in_the_header',
    itemName: 'Knit jersey with a very long marketing name and a longer colour description',
    message:
      'A long message that goes on for several lines so the layout can show how the quoted text wraps inside the block, with an unbroken value: ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048.\n\nSecond paragraph.',
    flag: 'A long warning that wraps onto a second line inside the card to check alignment of the icon.',
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={360}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  args: { kind: 'review', rating: 3.5, flag: 'Read before sending.' },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

/** The recipe: act now, then offer Undo in a toast. No confirmation dialog. */
export const SendWithUndo: Story = {
  render: function Render(args) {
    const [queue] = useState(() => createToastQueue());
    const [api] = useState(() => createToastApi(queue));
    const [state, setState] = useState<'pending' | 'sent'>('pending');
    return (
      <>
        <p aria-live="polite">{state === 'sent' ? 'Reply sent.' : 'Reply waiting for approval.'}</p>
        <ApprovalCard
          {...args}
          onSend={() => {
            setState('sent'); // 1. do it now
            api.success('Reply sent', {
              // 2. say so, past tense
              action: {
                label: 'Undo',
                onPress: () => {
                  setState('pending');
                },
              }, // 3. reverse it
            });
          }}
        />
        <ToastRegion queue={queue} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Send reply' }));
    await expect(canvas.getByText('Reply sent.')).toBeVisible();
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('button', { name: 'Undo' }));
    await expect(canvas.getByText('Reply waiting for approval.')).toBeVisible();
  },
};
