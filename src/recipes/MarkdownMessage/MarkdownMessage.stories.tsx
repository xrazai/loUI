import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { recipeDecorator } from '../storybook';
import { MarkdownChat } from './MarkdownMessage';

const meta = {
  title: 'Recipes/MarkdownMessage',
  component: MarkdownChat,
  tags: ['autodocs'],
  decorators: [recipeDecorator({ maxWidth: 480, height: 560 })],
  parameters: {
    visual: { width: 512 },
    docs: { story: { inline: false, iframeHeight: 600 } },
  },
} satisfies Meta<typeof MarkdownChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: /the guide/ })).toHaveAttribute(
      'href',
      'https://example.com/orders',
    );
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

/** Raw HTML and unsafe addresses are shown as text; nothing runs. */
export const UntrustedText: Story = {
  args: {
    initialItems: [
      {
        id: 'm-1',
        role: 'assistant',
        content:
          'Not markup: <img src=x onerror=alert(1)> and <b>tags</b>.\n\n[Open this](javascript:alert(1)) keeps only its text.',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.getByText(/<img src=x onerror=alert\(1\)>/)).toBeVisible();
  },
};

export const WhileStreaming: Story = {
  args: {
    initialItems: [
      { id: 'm-1', role: 'user', content: 'Show me an example.' },
      {
        id: 'm-2',
        role: 'assistant',
        status: 'streaming',
        content: 'Here is **a half-written reply and a list:\n\n- first\n- sec',
      },
    ],
  },
};

export const SendKeepsPlainText: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Message' }), '**not bold**{Enter}');
    await expect(canvas.getByText('**not bold**')).toBeVisible();
  },
};
