import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ChatPanel } from './ChatPanel';
import type { ChatMessage, ChatPanelProps } from './ChatPanel';

const conversation: ChatMessage[] = [
  { id: 'm1', role: 'user', content: 'Do you ship abroad?' },
  { id: 'm2', role: 'assistant', content: 'Yes, to most countries.' },
];

function Panel(props: Partial<ChatPanelProps>) {
  return (
    <div style={{ blockSize: 480 }}>
      <ChatPanel items={[]} {...props} />
    </div>
  );
}

function composer(screen: Awaited<ReturnType<typeof renderWithProvider>>) {
  return screen.getByRole('textbox', { name: 'Message' });
}

function status(screen: Awaited<ReturnType<typeof renderWithProvider>>) {
  return screen.getByRole('status').element();
}

describe('ChatPanel', () => {
  describe('structure', () => {
    it('is a region named by the title, with a log and a labelled composer', async () => {
      const screen = await renderWithProvider(<Panel items={conversation} />);
      await expect
        .element(screen.getByRole('region', { name: 'Chat with the agent' }))
        .toBeVisible();
      await expect.element(screen.getByRole('log', { name: 'Conversation' })).toBeVisible();
      await expect
        .element(composer(screen))
        .toHaveAttribute('placeholder', 'Ask or request something');
    });

    it('takes a custom title and heading level', async () => {
      const screen = await renderWithProvider(
        <Panel items={conversation} title="Ask the agent" headingLevel={3} />,
      );
      await expect
        .element(screen.getByRole('heading', { level: 3, name: 'Ask the agent' }))
        .toBeVisible();
    });

    it('keeps the log out of the live-region announcements and uses a status region instead', async () => {
      const screen = await renderWithProvider(<Panel items={conversation} />);
      await expect.element(screen.getByRole('log')).toHaveAttribute('aria-live', 'off');
      await expect.element(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('prefixes each message with a hidden author for screen readers', async () => {
      const screen = await renderWithProvider(<Panel items={conversation} />);
      const text = screen.getByRole('log').element().textContent;
      expect(text).toContain('You: Do you ship abroad?');
      expect(text).toContain('Assistant: Yes, to most countries.');
    });

    it('preserves line breaks in plain text content', async () => {
      const screen = await renderWithProvider(
        <Panel items={[{ id: 'a', role: 'assistant', content: 'One\nTwo' }]} />,
      );
      const bubble = screen
        .getByRole('log')
        .element()
        .querySelector('[data-role] > div') as HTMLElement;
      expect(getComputedStyle(bubble).whiteSpace).toBe('pre-wrap');
    });

    it('makes the scrollable log reachable by keyboard', async () => {
      const screen = await renderWithProvider(<Panel items={conversation} />);
      await expect.element(screen.getByRole('log')).toHaveAttribute('tabindex', '0');
    });
  });

  describe('empty state', () => {
    it('shows the intro and the suggested prompts, and sends a prompt when pressed', async () => {
      const onSend = vi.fn();
      const screen = await renderWithProvider(
        <Panel
          intro="Test replies or ask for changes."
          prompts={['How would you answer X?']}
          onSend={onSend}
        />,
      );
      await expect.element(screen.getByText('Test replies or ask for changes.')).toBeVisible();
      await expect.element(screen.getByRole('group', { name: 'Suggested prompts' })).toBeVisible();
      await screen.getByRole('button', { name: 'How would you answer X?' }).click();
      expect(onSend).toHaveBeenCalledWith('How would you answer X?');
    });

    it('hides the intro and prompts once there are messages', async () => {
      const screen = await renderWithProvider(
        <Panel intro="Intro text" prompts={['A prompt']} items={conversation} />,
      );
      expect(screen.getByText('Intro text').elements()).toHaveLength(0);
      expect(screen.getByRole('button', { name: 'A prompt' }).elements()).toHaveLength(0);
    });
  });

  describe('composer keyboard', () => {
    it('sends the trimmed text on Enter and clears the field', async () => {
      const onSend = vi.fn();
      const screen = await renderWithProvider(<Panel onSend={onSend} />);
      composer(screen).element().focus();
      await userEvent.keyboard('  Hello there  {Enter}');
      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith('Hello there');
      await expect.element(composer(screen)).toHaveValue('');
    });

    it('inserts a new line on Shift+Enter and does not send', async () => {
      const onSend = vi.fn();
      const screen = await renderWithProvider(<Panel onSend={onSend} />);
      composer(screen).element().focus();
      await userEvent.keyboard('One{Shift>}{Enter}{/Shift}Two');
      expect(onSend).not.toHaveBeenCalled();
      await expect.element(composer(screen)).toHaveValue('One\nTwo');
    });

    it('does not send an empty or whitespace-only message', async () => {
      const onSend = vi.fn();
      const screen = await renderWithProvider(<Panel onSend={onSend} />);
      composer(screen).element().focus();
      await userEvent.keyboard('   {Enter}');
      expect(onSend).not.toHaveBeenCalled();
      await expect.element(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
    });

    it('ignores Enter while an IME composition is active', async () => {
      const onSend = vi.fn();
      const screen = await renderWithProvider(<Panel onSend={onSend} />);
      const field = composer(screen);
      await userEvent.type(field, 'nihon');
      const element = field.element();
      element.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          isComposing: true,
          bubbles: true,
          cancelable: true,
        }),
      );
      expect(onSend).not.toHaveBeenCalled();
      await expect.element(field).toHaveValue('nihon');
    });

    it('ignores the Enter that Safari reports with keyCode 229 after a composition', async () => {
      const onSend = vi.fn();
      const screen = await renderWithProvider(<Panel onSend={onSend} />);
      const field = composer(screen);
      await userEvent.type(field, 'nihon');
      field.element().dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          keyCode: 229,
          bubbles: true,
          cancelable: true,
        }),
      );
      expect(onSend).not.toHaveBeenCalled();
    });

    it('sends with the button', async () => {
      const onSend = vi.fn();
      const screen = await renderWithProvider(<Panel onSend={onSend} />);
      await userEvent.type(composer(screen), 'Hi');
      await screen.getByRole('button', { name: 'Send message' }).click();
      expect(onSend).toHaveBeenCalledWith('Hi');
    });

    it('uses a secondary send button by default and a primary one when asked', async () => {
      const secondary = await renderWithProvider(<Panel />);
      await expect
        .element(secondary.getByRole('button', { name: 'Send message' }))
        .toHaveAttribute('data-variant', 'secondary');
      await secondary.unmount();
      const primary = await renderWithProvider(<Panel sendVariant="primary" />);
      await expect
        .element(primary.getByRole('button', { name: 'Send message' }))
        .toHaveAttribute('data-variant', 'primary');
    });
  });

  describe('busy and streaming', () => {
    it('shows the thinking state, disables sending and announces it', async () => {
      const onSend = vi.fn();
      const screen = await renderWithProvider(
        <Panel items={conversation.slice(0, 1)} busy onSend={onSend} />,
      );
      await expect.element(screen.getByText('Thinking…', { exact: true }).first()).toBeVisible();
      expect(status(screen).textContent).toBe('Thinking…');
      composer(screen).element().focus();
      await userEvent.keyboard('Wait{Enter}');
      expect(onSend).not.toHaveBeenCalled();
      await expect.element(screen.getByRole('button', { name: 'Stop generating' })).toBeDisabled();
    });

    it('announces a reply once, when it completes, and never while it streams', async () => {
      const first: ChatMessage[] = [conversation[0] as ChatMessage];
      const screen = await renderWithProvider(<Panel items={first} />);
      expect(status(screen).textContent).toBe('');

      const partial = (content: string): ChatMessage[] => [
        ...first,
        { id: 'a1', role: 'assistant', content, status: 'streaming' },
      ];
      await screen.rerender(<Panel items={partial('Yes, to')} />);
      expect(status(screen).textContent).toBe('The assistant is responding');
      await screen.rerender(<Panel items={partial('Yes, to most')} />);
      expect(status(screen).textContent).toBe('The assistant is responding');
      expect(screen.getByRole('log').element().getAttribute('aria-busy')).toBe('true');

      await screen.rerender(
        <Panel
          items={[...first, { id: 'a1', role: 'assistant', content: 'Yes, to most countries.' }]}
        />,
      );
      expect(status(screen).textContent).toBe('Assistant: Yes, to most countries.');
      expect(screen.getByRole('log').element().getAttribute('aria-busy')).toBeNull();
    });

    it('does not announce the conversation that was there on first render', async () => {
      const screen = await renderWithProvider(<Panel items={conversation} />);
      expect(status(screen).textContent).toBe('');
    });

    it('shows a stop button while streaming, keeps focus on the same button and stops', async () => {
      const onStop = vi.fn();
      const streaming: ChatMessage[] = [
        conversation[0] as ChatMessage,
        { id: 'a1', role: 'assistant', content: 'Partial', status: 'streaming' },
      ];
      const idle = (
        <Panel items={[conversation[0] as ChatMessage]} onSend={() => undefined} onStop={onStop} />
      );
      const screen = await renderWithProvider(idle);
      await userEvent.type(composer(screen), 'Hi');
      const button = screen.getByRole('button', { name: 'Send message' }).element();
      button.focus();
      await screen.rerender(<Panel items={streaming} onStop={onStop} />);
      const stop = screen.getByRole('button', { name: 'Stop generating' });
      await expect.element(stop).toBeEnabled();
      expect(stop.element()).toBe(button);
      expect(document.activeElement).toBe(button);
      await userEvent.keyboard('{Enter}');
      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('disables the stop button when there is no onStop handler', async () => {
      const screen = await renderWithProvider(
        <Panel
          items={[{ id: 'a1', role: 'assistant', content: 'Partial', status: 'streaming' }]}
        />,
      );
      await expect.element(screen.getByRole('button', { name: 'Stop generating' })).toBeDisabled();
    });

    it('shows the thinking row for a streaming message that has no text yet', async () => {
      const screen = await renderWithProvider(
        <Panel items={[{ id: 'a1', role: 'assistant', content: '', status: 'streaming' }]} />,
      );
      await expect.element(screen.getByText('Thinking…', { exact: true }).first()).toBeVisible();
      expect(screen.getByRole('log').element().querySelectorAll('[data-role]')).toHaveLength(0);
    });
  });

  describe('errors', () => {
    const failed: ChatMessage = {
      id: 'e1',
      role: 'assistant',
      content: 'The agent is unavailable.',
      status: 'error',
    };

    it('styles the failed message as an error, announces it and offers Retry', async () => {
      const onRetry = vi.fn();
      const screen = await renderWithProvider(
        <Panel items={[conversation[0] as ChatMessage, failed]} onRetry={onRetry} />,
      );
      const row = screen
        .getByRole('log')
        .element()
        .querySelector('[data-status="error"]') as HTMLElement;
      expect(row.textContent).toContain('Error: The agent is unavailable.');
      expect(getComputedStyle(row.firstElementChild as HTMLElement).borderColor).not.toBe(
        getComputedStyle(screen.getByRole('log').element()).borderColor,
      );
      await screen.getByRole('button', { name: 'Retry' }).click();
      expect(onRetry).toHaveBeenCalledWith(failed);
    });

    it('shows no Retry button without a handler', async () => {
      const screen = await renderWithProvider(<Panel items={[failed]} />);
      expect(screen.getByRole('button', { name: 'Retry' }).elements()).toHaveLength(0);
    });

    it('announces a reply that fails', async () => {
      const first = [conversation[0] as ChatMessage];
      const screen = await renderWithProvider(<Panel items={first} />);
      await screen.rerender(<Panel items={[...first, failed]} />);
      expect(status(screen).textContent).toBe('Error: The agent is unavailable.');
    });
  });

  describe('clear', () => {
    it('shows Clear only with messages and a handler', async () => {
      const onClear = vi.fn();
      const empty = await renderWithProvider(<Panel onClear={onClear} />);
      expect(empty.getByRole('button', { name: 'Clear conversation' }).elements()).toHaveLength(0);
      await empty.unmount();
      const full = await renderWithProvider(<Panel items={conversation} onClear={onClear} />);
      await full.getByRole('button', { name: 'Clear conversation' }).click();
      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('content', () => {
    it('renders custom content from renderContent', async () => {
      const screen = await renderWithProvider(
        <Panel
          items={[{ id: 'a', role: 'assistant', content: 'bold' }]}
          renderContent={(message) => <strong data-testid="custom">{message.content}</strong>}
        />,
      );
      await expect.element(screen.getByTestId('custom')).toHaveTextContent('bold');
    });

    it('renders HTML-looking text as text', async () => {
      const screen = await renderWithProvider(
        <Panel items={[{ id: 'a', role: 'assistant', content: '<img src=x onerror=alert(1)>' }]} />,
      );
      expect(screen.getByRole('log').element().querySelector('img')).toBeNull();
      expect(screen.getByRole('log').element().textContent).toContain(
        '<img src=x onerror=alert(1)>',
      );
    });

    it('keys messages by id so existing nodes survive an insertion before them', async () => {
      const screen = await renderWithProvider(<Panel items={conversation} />);
      const before = [...screen.getByRole('log').element().querySelectorAll('[data-role]')];
      await screen.rerender(
        <Panel items={[{ id: 'm0', role: 'user', content: 'Earlier' }, ...conversation]} />,
      );
      const after = [...screen.getByRole('log').element().querySelectorAll('[data-role]')];
      expect(after).toHaveLength(3);
      expect(after.slice(1)).toEqual(before);
    });
  });

  describe('scroll anchoring', () => {
    const many = (count: number): ChatMessage[] =>
      Array.from({ length: count }, (_, index) => ({
        id: `m${String(index)}`,
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: `Message number ${String(index)} with enough text to take some room.`,
      }));

    it('follows new messages while at the bottom', async () => {
      const screen = await renderWithProvider(<Panel items={many(20)} />);
      const log = screen.getByRole('log').element();
      await vi.waitFor(() => {
        expect(log.scrollTop).toBeGreaterThan(0);
      });
      await screen.rerender(<Panel items={many(24)} />);
      await vi.waitFor(() => {
        expect(log.scrollHeight - log.scrollTop - log.clientHeight).toBeLessThanOrEqual(1);
      });
    });

    it('does not move the list when the user scrolled up, and offers a way back', async () => {
      const screen = await renderWithProvider(<Panel items={many(20)} />);
      const log = screen.getByRole('log').element();
      await vi.waitFor(() => {
        expect(log.scrollTop).toBeGreaterThan(0);
      });
      log.scrollTop = 0;
      await expect.element(screen.getByRole('button', { name: 'Jump to latest' })).toBeVisible();
      await screen.rerender(<Panel items={many(24)} />);
      expect(log.scrollTop).toBe(0);
      await screen.getByRole('button', { name: 'Jump to latest' }).click();
      await vi.waitFor(() => {
        expect(log.scrollHeight - log.scrollTop - log.clientHeight).toBeLessThanOrEqual(1);
      });
      expect(screen.getByRole('button', { name: 'Jump to latest' }).elements()).toHaveLength(0);
    });
  });

  describe('i18n', () => {
    it('renders pt-BR', async () => {
      const screen = await renderWithProvider(
        <Panel items={conversation} onClear={() => undefined} />,
        {
          locale: 'pt-BR',
        },
      );
      await expect
        .element(screen.getByRole('region', { name: 'Conversar com o agente' }))
        .toBeVisible();
      await expect.element(screen.getByRole('textbox', { name: 'Mensagem' })).toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Limpar conversa' })).toBeVisible();
    });

    it('accepts instance and provider overrides', async () => {
      const instance = await renderWithProvider(<Panel messages={{ send: 'Ask agent' }} />);
      await expect.element(instance.getByRole('button', { name: 'Ask agent' })).toBeVisible();
      await instance.unmount();
      const provider = await renderWithProvider(<Panel />, {
        messages: { ChatPanel: { composerLabel: 'Your question' } },
      });
      await expect.element(provider.getByRole('textbox', { name: 'Your question' })).toBeVisible();
    });
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLElement>();
    await renderWithProvider(<ChatPanel items={[]} ref={ref} className="extra" id="chat-1" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('chat-1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Agent</h1>
        <Panel headingLevel={2} intro="Test replies." prompts={['How would you answer X?']} />
        <Panel
          headingLevel={2}
          onClear={() => undefined}
          onRetry={() => undefined}
          items={[
            ...conversation,
            { id: 'e', role: 'assistant', content: 'Unavailable.', status: 'error' },
            { id: 's', role: 'assistant', content: 'Streaming', status: 'streaming' },
          ]}
          busy
          onStop={() => undefined}
        />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });

  describe('messages without ids and busy indicator', () => {
    const noIds: ChatMessage[] = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello' },
      { role: 'user', content: 'Ship abroad?' },
    ];

    it('renders messages that have no id', async () => {
      const screen = await renderWithProvider(<Panel items={noIds} />);
      const log = screen.getByRole('log').element();
      expect(log.textContent).toContain('Hello');
      expect(log.textContent).toContain('Ship abroad?');
    });

    it('does not announce history or re-announce when a message has no id', async () => {
      const screen = await renderWithProvider(<Panel items={noIds} />);
      expect(status(screen).textContent).toBe('');
      await screen.rerender(
        <Panel items={[...noIds, { role: 'assistant', content: 'Yes, we do.' }]} />,
      );
      await expect.poll(() => status(screen).textContent).toBe('Assistant: Yes, we do.');
    });

    it('uses getKey for keys and the first-announcement logic', async () => {
      const getKey = vi.fn((message: ChatMessage) => `${message.role}:${message.content}`);
      const screen = await renderWithProvider(<Panel items={noIds} getKey={getKey} />);
      expect(getKey).toHaveBeenCalledWith(noIds[0], 0);
      expect(status(screen).textContent).toBe('');
    });

    it('shows a custom busy label, announces it and keeps the default spinner', async () => {
      const screen = await renderWithProvider(
        <Panel items={noIds} busy busyLabel="Searching orders…" />,
      );
      await expect.element(screen.getByText('Searching orders…').first()).toBeVisible();
      expect(status(screen).textContent).toBe('Searching orders…');
      expect(
        screen.getByRole('log').element().querySelector('[role="status"], svg'),
      ).not.toBeNull();
    });

    it('replaces the spinner with busyIndicator, and omits it with null', async () => {
      const screen = await renderWithProvider(
        <Panel items={noIds} busy busyIndicator={<span data-testid="mine">...</span>} />,
      );
      expect(screen.getByTestId('mine').element()).not.toBeNull();
      await screen.rerender(<Panel items={noIds} busy busyIndicator={null} />);
      await expect.element(screen.getByText('Thinking…').first()).toBeVisible();
    });

    it('has no axe violations with a custom busy row', async () => {
      const screen = await renderWithProvider(
        <Panel items={noIds} busy busyLabel="Searching orders…" />,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
