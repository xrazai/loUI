import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { StoryFrame } from '../../test/StoryFrame';
import { ResponseFeedback } from './ResponseFeedback';

const meta = {
  title: 'Patterns/ResponseFeedback',
  component: ResponseFeedback,
  tags: ['autodocs'],
  args: { onChange: fn(), onCopy: fn(), onRegenerate: fn() },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={480}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof ResponseFeedback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const good = canvas.getByRole('button', { name: 'Good response' });
    await expect(good).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(good);
    await expect(good).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onChange).toHaveBeenLastCalledWith('positive');
    await expect(canvas.getByRole('status')).toHaveTextContent('Feedback sent');
    await userEvent.click(good);
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
  },
};

export const RatedBad: Story = { args: { defaultValue: 'negative' } };

export const RatingOnly: Story = { render: () => <ResponseFeedback /> };

export const Regenerating: Story = { args: { isRegenerating: true } };

export const Disabled: Story = { args: { isDisabled: true } };

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={480} dir="rtl">
        <Story />
      </StoryFrame>
    ),
  ],
};
