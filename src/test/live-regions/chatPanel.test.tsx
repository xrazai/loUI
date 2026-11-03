/**
 * Screen-reader verification of ChatPanel streaming (TEST-018).
 * What assistive technology receives is checked in the DOM (live-region mutations) and in
 * Chromium's accessibility tree. Real NVDA / VoiceOver runs: docs/a11y/screen-reader-checklist.md.
 */
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { ChatPanel } from '../../patterns/ChatPanel/ChatPanel';
import type { ChatMessage, ChatPanelProps } from '../../patterns/ChatPanel/ChatPanel';
import { renderWithProvider } from '../render';
import { axFind, axNodes, recordAnnouncements } from './helpers';

const question: ChatMessage = { id: 'u1', role: 'user', content: 'Do you ship abroad?' };
const REPLY = 'Yes, we ship to most countries within Europe and North America.';
const TOKENS = REPLY.split(' ').map((word, i) => (i === 0 ? word : ` ${word}`));

function Panel(props: Partial<ChatPanelProps>) {
  return (
    <div style={{ blockSize: 480 }}>
      <ChatPanel items={[]} {...props} />
    </div>
  );
}

const reply = (content: string, status?: ChatMessage['status']): ChatMessage => ({
  id: 'a1',
  role: 'assistant',
  content,
  ...(status ? { status } : {}),
});

describe('ChatPanel announcements', () => {
  it('announces "Thinking", "responding" and the full reply once, never a token', async () => {
    const recorder = recordAnnouncements();
    const screen = await renderWithProvider(<Panel items={[question]} />);
    // First render: history is silent.
    expect(recorder.records).toEqual([]);

    await screen.rerender(<Panel items={[question]} busy />);
    await screen.rerender(<Panel items={[question, reply('', 'streaming')]} />);

    let text = '';
    for (const token of TOKENS) {
      text += token;
      await screen.rerender(<Panel items={[question, reply(text, 'streaming')]} />);
    }
    // The log keeps changing while tokens arrive, but it is aria-live="off" and never recorded.
    expect(screen.getByRole('log').element().textContent).toContain(REPLY.slice(0, 20));
    expect(recorder.texts()).toEqual(['Thinking…', 'The assistant is responding']);

    await screen.rerender(<Panel items={[question, reply(REPLY)]} />);
    expect(recorder.texts()).toEqual([
      'Thinking…',
      'The assistant is responding',
      `Assistant: ${REPLY}`,
    ]);
    expect(recorder.stop().every((r) => r.politeness === 'polite' && r.role === 'status')).toBe(
      true,
    );
  });

  it('announces only the start and the completion when there is no busy phase', async () => {
    const recorder = recordAnnouncements();
    const screen = await renderWithProvider(<Panel items={[question]} />);
    let text = '';
    for (const token of TOKENS.slice(0, 6)) {
      text += token;
      await screen.rerender(<Panel items={[question, reply(text, 'streaming')]} />);
    }
    await screen.rerender(<Panel items={[question, reply(text)]} />);
    expect(recorder.stop().map((r) => r.text)).toEqual([
      'The assistant is responding',
      `Assistant: ${text}`,
    ]);
  });

  it('announces a failed reply once, as an error', async () => {
    const recorder = recordAnnouncements();
    const screen = await renderWithProvider(<Panel items={[question]} />);
    await screen.rerender(<Panel items={[question, reply('Partial', 'streaming')]} />);
    await screen.rerender(
      <Panel items={[question, reply('The agent is unavailable.', 'error')]} />,
    );
    expect(recorder.stop().map((r) => r.text)).toEqual([
      'The assistant is responding',
      'Error: The agent is unavailable.',
    ]);
  });

  it('is silent when a conversation is rendered already complete', async () => {
    const recorder = recordAnnouncements();
    await renderWithProvider(<Panel items={[question, reply(REPLY)]} />);
    expect(recorder.stop()).toEqual([]);
  });
});

describe('ChatPanel accessibility tree', () => {
  it('exposes a named region, a non-live log and one polite atomic status region', async () => {
    await renderWithProvider(<Panel items={[question, reply(REPLY)]} />);
    expect(await axFind('region', 'Chat with the agent')).toBeDefined();
    const log = await axFind('log', 'Conversation');
    expect(log).toBeDefined();
    // The transcript is navigable but never speaks on its own.
    expect(log?.properties['live']).not.toBe('polite');
    expect(log?.properties['live']).not.toBe('assertive');
    const statuses = (await axNodes()).filter((n) => n.role === 'status');
    expect(statuses).toHaveLength(1);
    expect(statuses[0]?.properties['live']).toBe('polite');
    expect(statuses[0]?.properties['atomic']).toBe(true);
  });

  it('marks the log busy while streaming and clears it when the reply completes', async () => {
    const screen = await renderWithProvider(
      <Panel items={[question, reply('Yes, we', 'streaming')]} />,
    );
    expect((await axFind('log', 'Conversation'))?.properties['busy']).toBeTruthy();
    await screen.rerender(<Panel items={[question, reply(REPLY)]} />);
    expect((await axFind('log', 'Conversation'))?.properties['busy']).toBeFalsy();
  });

  it('keeps Stop reachable and named while streaming, on the button that had focus', async () => {
    const onStop = vi.fn();
    const screen = await renderWithProvider(
      <Panel items={[question]} onSend={() => undefined} onStop={onStop} />,
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Message' }), 'Hi');
    const send = screen.getByRole('button', { name: 'Send message' }).element();
    send.focus();
    await screen.rerender(
      <Panel items={[question, reply('Yes, we', 'streaming')]} onStop={onStop} />,
    );
    const stop = await axFind('button', 'Stop generating');
    expect(stop).toBeDefined();
    expect(stop?.properties['disabled']).not.toBe(true);
    expect(stop?.properties['focused']).toBe(true);
    expect(await axFind('button', 'Send message')).toBeUndefined();
    await userEvent.keyboard('{Enter}');
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('exposes Retry by name on a failed reply and reaches it with Tab', async () => {
    const onRetry = vi.fn();
    const failed = reply('The agent is unavailable.', 'error');
    const screen = await renderWithProvider(<Panel items={[question, failed]} onRetry={onRetry} />);
    expect(await axFind('button', 'Retry')).toBeDefined();
    screen.getByRole('log').element().focus();
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: 'Retry' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledWith(failed);
  });
});
