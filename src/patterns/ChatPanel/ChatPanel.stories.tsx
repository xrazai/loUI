import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ChatPanel } from './ChatPanel';
import type { ChatMessage } from './ChatPanel';
import { StoryFrame } from '../../test/StoryFrame';

const conversation: ChatMessage[] = [
  { id: 'm1', role: 'user', content: 'How would you answer "do you ship abroad?"' },
  {
    id: 'm2',
    role: 'assistant',
    content: 'Hello. Yes, we ship to most countries.\nThe shipping cost is calculated at checkout.',
  },
  { id: 'm3', role: 'user', content: 'Shorter, please.' },
  { id: 'm4', role: 'assistant', content: 'Yes, we ship abroad. The cost appears at checkout.' },
];

const meta = {
  title: 'Patterns/ChatPanel',
  component: ChatPanel,
  tags: ['autodocs'],
  args: {
    items: [],
    intro:
      'Test replies or ask for changes. The agent follows the guidelines and the current data.',
    prompts: ['How would you answer "do you ship abroad?"', 'Summarize today’s questions'],
    onSend: fn(),
    onClear: fn(),
  },
  argTypes: {
    sendVariant: { control: 'inline-radio', options: ['secondary', 'primary'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame height={520} maxWidth={360}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof ChatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /do you ship abroad/ }));
    await expect(args.onSend).toHaveBeenCalledWith('How would you answer "do you ship abroad?"');
  },
};

export const Conversation: Story = { args: { items: conversation } };

export const Busy: Story = { args: { items: conversation.slice(0, 1), busy: true, onStop: fn() } };

/** Messages without ids (`{ role, content }`): keys come from the role and position, or from `getKey`. */
export const WithoutIds: Story = {
  args: { items: conversation.map(({ role, content }) => ({ role, content })) },
};

/** A busy row with the consumer's own text instead of "Thinking…". */
export const CustomBusyLabel: Story = {
  args: {
    items: conversation.slice(0, 1),
    busy: true,
    busyLabel: 'Searching orders…',
    onStop: fn(),
  },
};

export const Streaming: Story = {
  args: {
    items: [
      conversation[0] as ChatMessage,
      { id: 'a1', role: 'assistant', content: 'Hello. Yes, we ship to most', status: 'streaming' },
    ],
    onStop: fn(),
  },
};

export const ErrorWithRetry: Story = {
  args: {
    items: [
      conversation[0] as ChatMessage,
      {
        id: 'e1',
        role: 'assistant',
        content: 'The agent could not answer. Check your connection and try again.',
        status: 'error',
      },
    ],
    onRetry: fn(),
  },
};

export const PrimarySend: Story = { args: { sendVariant: 'primary' } };

export const LongConversation: Story = {
  args: {
    items: Array.from({ length: 24 }, (_, index) => ({
      id: `m${String(index)}`,
      role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `Message number ${String(index + 1)}. It has a few words to take up room in the list.`,
    })),
  },
};

export const LongText: Story = {
  args: {
    items: [
      {
        id: 'u',
        role: 'user',
        content: 'ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048',
      },
      {
        id: 'a',
        role: 'assistant',
        content:
          'A long reply that wraps over several lines so the bubble width, line height and wrapping can be checked at a narrow panel width. '.repeat(
            3,
          ),
      },
    ],
  },
};

/** Content is plain text by default. Plug a sanitized renderer in with `renderContent`. */
export const CustomRenderer: Story = {
  args: {
    items: [
      { id: 'a', role: 'assistant', content: 'We ship **worldwide**. See the shipping page.' },
    ],
    // A tiny, safe renderer: it only produces React elements, never HTML strings.
    renderContent: (message) =>
      message.content.split('**').map((part, index) => {
        const Wrapper = index % 2 === 1 ? 'strong' : Fragment;
        return <Wrapper key={index}>{part}</Wrapper>;
      }) as ReactNode,
  },
};

export const RightToLeft: Story = {
  args: { items: conversation },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

function LiveDemo() {
  const [items, setItems] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const counter = useRef(0);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  function reply(failOnce: boolean) {
    const id = `a${String((counter.current += 1))}`;
    const words = 'Yes, we ship abroad. The cost is calculated at checkout.'.split(' ');
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      if (failOnce) {
        setItems((current) => [
          ...current,
          { id, role: 'assistant', content: 'The agent could not answer.', status: 'error' },
        ]);
        return;
      }
      setItems((current) => [
        ...current,
        { id, role: 'assistant', content: '', status: 'streaming' },
      ]);
      let index = 0;
      const tick = () => {
        index += 1;
        const done = index >= words.length;
        setItems((current) =>
          current.map((message) =>
            message.id === id
              ? {
                  ...message,
                  content: words.slice(0, index).join(' '),
                  status: done ? 'complete' : 'streaming',
                }
              : message,
          ),
        );
        if (!done) timer.current = setTimeout(tick, 120);
      };
      timer.current = setTimeout(tick, 120);
    }, 150);
  }

  return (
    <ChatPanel
      items={items}
      busy={busy}
      prompts={['Start']}
      intro="Interactive demo: send a message to see Thinking, streaming and Stop."
      onSend={(text) => {
        setItems((current) => [
          ...current,
          { id: `u${String((counter.current += 1))}`, role: 'user', content: text },
        ]);
        reply(text.toLowerCase().includes('fail'));
      }}
      onStop={() => {
        clearTimeout(timer.current);
        setBusy(false);
        setItems((current) =>
          current.map((message) =>
            message.status === 'streaming' ? { ...message, status: 'complete' } : message,
          ),
        );
      }}
      onRetry={(failed) => {
        setItems((current) => current.filter((message) => message.id !== failed.id));
        reply(false);
      }}
      onClear={() => {
        clearTimeout(timer.current);
        setBusy(false);
        setItems([]);
      }}
    />
  );
}

export const InteractiveStreaming: Story = {
  render: () => <LiveDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.type(field, 'First line');
    // Shift+Enter adds a line and does not send.
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}second line');
    await expect(field).toHaveValue('First line\nsecond line');
    // Enter sends.
    await userEvent.keyboard('{Enter}');
    await expect(field).toHaveValue('');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Stop generating' })).toBeEnabled(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Stop generating' }));
    await expect(canvas.getByRole('button', { name: 'Send message' })).toBeDisabled();
  },
};

export const InteractiveError: Story = {
  render: () => <LiveDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Message' }), 'please fail{Enter}');
    await userEvent.click(await canvas.findByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Stop generating' })).toBeEnabled(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Stop generating' }));
  },
};
