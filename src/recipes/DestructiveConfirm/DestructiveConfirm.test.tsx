import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from '../../index';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { DestructiveConfirm } from './DestructiveConfirm';
import type { DestructiveConfirmProps } from './DestructiveConfirm';

type Screen = Awaited<ReturnType<typeof setup>>;

async function setup(props: DestructiveConfirmProps = {}) {
  return renderWithProvider(
    <RecipeHost>
      <DestructiveConfirm {...props} />
    </RecipeHost>,
  );
}

async function openConfirm(screen: Screen, number = 1048) {
  await userEvent.click(screen.getByRole('button', { name: `More actions for order #${number}` }));
  await userEvent.click(screen.getByRole('menuitem', { name: 'Delete order' }));
  return screen.getByRole('alertdialog', { name: `Delete order #${number}?` });
}

afterEach(() => {
  vi.useRealTimers();
  act(() => {
    toast.clear();
  });
});

describe('DestructiveConfirm', () => {
  it('lists orders alphabetically by customer', async () => {
    const screen = await setup();
    await expect.element(screen.getByRole('grid', { name: 'Orders' })).toBeVisible();
    const customers = [...document.querySelectorAll('tbody [role="rowheader"]')].map(
      (cell) => cell.textContent,
    );
    expect(customers).toEqual(['Acme Supply', 'Contoso', 'Globex', 'Northwind']);
  });

  it('asks first: names the object and the consequence, focus on Cancel', async () => {
    const screen = await setup();
    const dialog = await openConfirm(screen);
    await expect.element(dialog).toBeVisible();
    await expect
      .element(dialog.getByText(/The order and its 14 lines will be removed/))
      .toBeVisible();
    await expect.element(dialog.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await expect.element(dialog.getByRole('button', { name: 'Delete order #1048' })).toBeVisible();
    // Nothing happened yet.
    expect(document.body.textContent).toContain('Contoso');
  });

  it('deletes after confirming and offers Undo in a toast', async () => {
    const screen = await setup();
    const dialog = await openConfirm(screen);
    await userEvent.click(dialog.getByRole('button', { name: 'Delete order #1048' }));
    await expect.element(screen.getByText(/Order #1048 deleted/)).toBeVisible();
    expect(document.querySelectorAll('tbody [role="rowheader"]')).toHaveLength(3);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(document.querySelectorAll('tbody [role="rowheader"]')).toHaveLength(4);
  });

  it('cancels with Cancel and with Escape, without a toast', async () => {
    const screen = await setup();
    const first = await openConfirm(screen);
    await userEvent.click(first.getByRole('button', { name: 'Cancel' }));
    await expect.element(screen.getByRole('alertdialog')).not.toBeInTheDocument();
    await openConfirm(screen);
    await userEvent.keyboard('{Escape}');
    await expect.element(screen.getByRole('alertdialog')).not.toBeInTheDocument();
    expect(document.querySelectorAll('tbody [role="rowheader"]')).toHaveLength(4);
    expect(document.body.textContent).not.toContain('deleted');
  });

  it('works from the keyboard: menu, Tab to the danger button, Enter, Undo', async () => {
    const screen = await setup();
    // Grid navigation: Tab enters the table, arrows reach the row's action button.
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}');
    await expect
      .element(screen.getByRole('button', { name: 'More actions for order #1048' }))
      .toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('menuitem', { name: 'Delete order' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = screen.getByRole('alertdialog', { name: 'Delete order #1048?' });
    await expect.element(dialog.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.tab();
    await expect.element(dialog.getByRole('button', { name: 'Delete order #1048' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText(/Order #1048 deleted/)).toBeVisible();
    // Focus did not fall to the body: React Aria moved it to the next row's action.
    await expect.poll(() => document.activeElement?.closest('[role="grid"]') !== null).toBe(true);
    screen.getByRole('button', { name: 'Undo' }).element().focus();
    await userEvent.keyboard('{Enter}');
    expect(document.querySelectorAll('tbody [role="rowheader"]')).toHaveLength(4);
  });

  it('deletes for real only when the Undo window closes', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const deleteOrder = vi.fn().mockResolvedValue(undefined);
    const screen = await setup({ deleteOrder });
    const dialog = await openConfirm(screen);
    await userEvent.click(dialog.getByRole('button', { name: 'Delete order #1048' }));
    expect(deleteOrder).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5100);
    });
    expect(deleteOrder).toHaveBeenCalledTimes(1);
    expect(deleteOrder).toHaveBeenCalledWith(expect.objectContaining({ number: 1048 }));
  });

  it('puts the order back and says so when the delete fails', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const deleteOrder = vi.fn().mockRejectedValue(new Error('offline'));
    const screen = await setup({ deleteOrder });
    const dialog = await openConfirm(screen);
    await userEvent.click(dialog.getByRole('button', { name: 'Delete order #1048' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5100);
    });
    await expect.element(screen.getByText(/Couldn't complete the change/)).toBeVisible();
    expect(document.querySelectorAll('tbody [role="rowheader"]')).toHaveLength(4);
  });

  it('has no axe violations: list, confirmation and toast', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    const dialog = await openConfirm(screen);
    await expect.element(dialog).toBeVisible();
    await expectNoViolationsOnceSettled();
    await userEvent.click(dialog.getByRole('button', { name: 'Delete order #1048' }));
    await expect.element(screen.getByText(/Order #1048 deleted/)).toBeVisible();
    await expectNoViolationsOnceSettled();
  });
});
