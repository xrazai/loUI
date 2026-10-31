import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from '../../index';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { ApprovalQueue } from './ApprovalQueue';
import type { ApprovalQueueProps } from './ApprovalQueue';

type Screen = Awaited<ReturnType<typeof setup>>;

async function setup(props: ApprovalQueueProps = {}) {
  return renderWithProvider(
    <RecipeHost>
      <ApprovalQueue {...props} />
    </RecipeHost>,
  );
}

const card = (screen: Screen, author: string) =>
  screen.getByRole('article', { name: new RegExp(author) });
const cards = () => document.querySelectorAll('article');

afterEach(() => {
  vi.useRealTimers();
  act(() => {
    toast.clear();
  });
});

describe('ApprovalQueue', () => {
  it('lists what waits for approval, with a warning on the low-star review', async () => {
    const screen = await setup();
    await expect
      .element(screen.getByRole('tab', { name: /To approve/ }))
      .toHaveAttribute('aria-selected', 'true');
    expect(cards()).toHaveLength(2);
    await expect
      .element(card(screen, 'mara_k').getByText('2-star review: read it carefully before sending.'))
      .toBeVisible();
  });

  it('sends at once, without asking, and offers Undo; the card moves to Sent', async () => {
    const screen = await setup();
    await userEvent.click(card(screen, 'buyer_sp').getByRole('button', { name: 'Send reply' }));
    expect(
      document.querySelector('[role="dialog"], [role="alertdialog"]:not([data-tone])'),
    ).toBeNull();
    await expect.element(screen.getByText(/Reply to buyer_sp sent/)).toBeVisible();
    expect(cards()).toHaveLength(1);
    await userEvent.click(screen.getByRole('tab', { name: /Sent/ }));
    await expect.element(screen.getByText('Reply to buyer_sp').first()).toBeVisible();
  });

  it('puts the card back on Undo', async () => {
    const screen = await setup();
    await userEvent.click(card(screen, 'buyer_sp').getByRole('button', { name: 'Send reply' }));
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(cards()).toHaveLength(2);
  });

  it('discards with Undo too', async () => {
    const screen = await setup();
    await userEvent.click(card(screen, 'mara_k').getByRole('button', { name: 'Discard reply' }));
    await expect.element(screen.getByText(/Reply to mara_k discarded/)).toBeVisible();
    expect(cards()).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(cards()).toHaveLength(2);
  });

  it('really sends the edited reply only when the Undo window closes', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const sendReply = vi.fn().mockResolvedValue(undefined);
    const screen = await setup({ sendReply });
    const target = card(screen, 'buyer_sp');
    await userEvent.type(target.getByRole('textbox', { name: 'Agent reply' }), ' Thanks.');
    await userEvent.click(target.getByRole('button', { name: 'Send reply' }));
    expect(sendReply).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5200);
    });
    expect(sendReply).toHaveBeenCalledTimes(1);
    const sent = sendReply.mock.calls[0]?.[0] as { author: string; draft: string };
    expect(sent.author).toBe('buyer_sp');
    expect(sent.draft).toContain('Thanks.');
  });

  it('never sends a discarded reply', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const sendReply = vi.fn().mockResolvedValue(undefined);
    const screen = await setup({ sendReply });
    await userEvent.click(card(screen, 'buyer_sp').getByRole('button', { name: 'Discard reply' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5200);
    });
    expect(sendReply).not.toHaveBeenCalled();
  });

  it('shows an empty state when everything is handled', async () => {
    const screen = await setup();
    await userEvent.click(card(screen, 'buyer_sp').getByRole('button', { name: 'Discard reply' }));
    await userEvent.click(card(screen, 'mara_k').getByRole('button', { name: 'Discard reply' }));
    await expect.element(screen.getByRole('heading', { name: 'Nothing to review' })).toBeVisible();
    await expect
      .element(screen.getByText('New approvals appear here as they arrive.'))
      .toBeVisible();
  });

  it('works from the keyboard and keeps focus on the page', async () => {
    const screen = await setup();
    const send = card(screen, 'buyer_sp').getByRole('button', { name: 'Send reply' });
    send.element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText(/Reply to buyer_sp sent/)).toBeVisible();
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Replies' })).toHaveFocus();
    screen.getByRole('button', { name: 'Undo' }).element().focus();
    await userEvent.keyboard('{Enter}');
    expect(cards()).toHaveLength(2);
  });

  it('switches tabs with the arrow keys', async () => {
    const screen = await setup();
    screen
      .getByRole('tab', { name: /To approve/ })
      .element()
      .focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect
      .element(screen.getByRole('tab', { name: /Sent/ }))
      .toHaveAttribute('aria-selected', 'true');
    await expect.element(screen.getByRole('heading', { name: 'Nothing sent yet' })).toBeVisible();
  });

  it('has no axe violations: queue, toast and empty tab', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    await userEvent.click(card(screen, 'buyer_sp').getByRole('button', { name: 'Send reply' }));
    await expect.element(screen.getByText(/Reply to buyer_sp sent/)).toBeVisible();
    await expectNoViolationsOnceSettled();
    await userEvent.click(screen.getByRole('tab', { name: /Sent/ }));
    await expectNoViolationsOnceSettled();
  });
});
