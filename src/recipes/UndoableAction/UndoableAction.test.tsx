import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from '../../index';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { UndoableAction } from './UndoableAction';
import type { UndoableActionProps } from './UndoableAction';

async function setup(props: UndoableActionProps = {}) {
  return renderWithProvider(
    <RecipeHost>
      <UndoableAction {...props} />
    </RecipeHost>,
  );
}

afterEach(() => {
  vi.useRealTimers();
  act(() => {
    toast.clear();
  });
});

describe('UndoableAction', () => {
  it('archives at once, without asking, and offers Undo', async () => {
    const screen = await setup();
    await expect.element(screen.getByText('3 open, 0 archived')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Archive order #1051' }));
    // The toast is an alertdialog too; a confirmation would be one without a tone.
    expect(
      document.querySelector('[role="dialog"], [role="alertdialog"]:not([data-tone])'),
    ).toBeNull();
    await expect.element(screen.getByText(/Order #1051 archived/)).toBeVisible();
    await expect.element(screen.getByText('2 open, 1 archived')).toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'Archive order #1051' }))
      .not.toBeInTheDocument();
  });

  it('restores the order on Undo', async () => {
    const screen = await setup();
    await userEvent.click(screen.getByRole('button', { name: 'Archive order #1051' }));
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect.element(screen.getByText('3 open, 0 archived')).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Archive order #1051' })).toBeVisible();
  });

  it('works from the keyboard and keeps focus on the page', async () => {
    const screen = await setup();
    screen.getByRole('button', { name: 'Archive order #1049' }).element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText('2 open, 1 archived')).toBeVisible();
    await expect.element(screen.getByRole('heading', { name: 'Open orders' })).toHaveFocus();
    screen.getByRole('button', { name: 'Undo' }).element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText('3 open, 0 archived')).toBeVisible();
  });

  it('saves only when the Undo window closes, and not at all after Undo', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const saveStatus = vi.fn().mockResolvedValue(undefined);
    const screen = await setup({ saveStatus });
    await userEvent.click(screen.getByRole('button', { name: 'Archive order #1051' }));
    await userEvent.click(screen.getByRole('button', { name: 'Archive order #1050' }));
    await expect.element(screen.getByText('1 open, 2 archived')).toBeVisible();
    expect(saveStatus).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5200);
    });
    expect(saveStatus).toHaveBeenCalledTimes(2);
    expect(saveStatus).toHaveBeenCalledWith(expect.objectContaining({ number: 1051 }), 'archived');
  });

  it('puts the order back with an error toast when saving fails', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const saveStatus = vi.fn().mockRejectedValue(new Error('offline'));
    const screen = await setup({ saveStatus });
    await userEvent.click(screen.getByRole('button', { name: 'Archive order #1051' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5200);
    });
    await expect.element(screen.getByText('3 open, 0 archived')).toBeVisible();
    await expect.element(screen.getByText(/Couldn't complete the change/)).toBeVisible();
  });

  it('has no axe violations: list and toast', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    await userEvent.click(screen.getByRole('button', { name: 'Archive order #1051' }));
    await expect.element(screen.getByText(/Order #1051 archived/)).toBeVisible();
    await expectNoViolationsOnceSettled();
  });
});
