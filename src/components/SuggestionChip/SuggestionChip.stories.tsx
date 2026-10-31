import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SuggestionChip } from './SuggestionChip';

const meta = {
  title: 'Components/SuggestionChip',
  component: SuggestionChip,
  tags: ['autodocs'],
  args: { children: 'Your order has shipped.', onPress: fn() },
} satisfies Meta<typeof SuggestionChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const chip = within(canvasElement).getByRole('button', { name: 'Your order has shipped.' });
    await userEvent.click(chip);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement, args }) => {
    const chip = within(canvasElement).getByRole('button');
    await expect(chip).toBeDisabled();
    await userEvent.click(chip);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

export const LongText: Story = {
  args: {
    children:
      'We are checking with the carrier and will update you as soon as the parcel is scanned at the next depot.',
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 280 }}>
        <Story />
      </div>
    ),
  ],
};

function ComposerExample() {
  const [text, setText] = useState('');
  const suggestions = [
    'Thanks for your patience.',
    'Your order has shipped.',
    'Can you confirm the address?',
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxInlineSize: 420 }}>
      <div
        role="group"
        aria-label="Suggested replies"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
      >
        {suggestions.map((suggestion) => (
          <SuggestionChip
            key={suggestion}
            onPress={() => {
              setText((current) => (current ? `${current} ${suggestion}` : suggestion));
            }}
          >
            {suggestion}
          </SuggestionChip>
        ))}
      </div>
      <textarea
        aria-label="Reply"
        value={text}
        rows={3}
        onChange={(event) => {
          setText(event.target.value);
        }}
      />
    </div>
  );
}

/** The chip inserts text into the field; Enter and Space both press it. */
export const InsertsText: Story = {
  render: () => <ComposerExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('textbox', { name: 'Reply' })).toHaveValue(
      'Thanks for your patience.',
    );
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('textbox', { name: 'Reply' })).toHaveValue(
      'Thanks for your patience. Your order has shipped.',
    );
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

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
