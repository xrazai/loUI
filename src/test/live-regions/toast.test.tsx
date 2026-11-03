/**
 * Screen-reader verification of Toast (TEST-018).
 * Timer pausing on hover and focus is already covered in `Toast.test.tsx` ("pauses the timer
 * while the pointer is over the toast", "... while keyboard focus is inside the region"), as is
 * F6; this file adds what a screen reader receives: announcement count and politeness, focus,
 * and the accessibility tree.
 */
import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../components/Button';
import { ToastRegion } from '../../components/Toast/Toast';
import { createToastApi, createToastQueue } from '../../components/Toast/queue';
import { renderWithProvider } from '../render';
import { axFind, axNodes, recordAnnouncements } from './helpers';

function setup() {
  const queue = createToastQueue();
  return { queue, api: createToastApi(queue) };
}

describe('Toast announcements', () => {
  it('announces a new toast once, assertively through its alert, without moving focus', async () => {
    const { queue, api } = setup();
    const recorder = recordAnnouncements();
    const screen = await renderWithProvider(
      <main>
        <Button>Page action</Button>
        <ToastRegion queue={queue} />
      </main>,
    );
    const page = screen.getByRole('button', { name: 'Page action' }).element();
    page.focus();
    expect(recorder.records).toEqual([]);

    act(() => {
      api.success('3 items archived', { timeout: null });
    });
    await expect.element(screen.getByText(/3 items archived/)).toBeVisible();
    // Success: the tone is spoken as text, never color alone.
    expect(recorder.records).toEqual([
      {
        kind: 'insert',
        politeness: 'assertive',
        role: 'alert',
        text: 'Success: 3 items archived',
      },
    ]);
    expect(document.activeElement).toBe(page);
  });

  it('announces only the new toast when a second one arrives, and nothing when one closes', async () => {
    const { queue, api } = setup();
    const recorder = recordAnnouncements();
    await renderWithProvider(
      <main>
        <ToastRegion queue={queue} />
      </main>,
    );
    let first = '';
    act(() => {
      first = api.info('Saved', { timeout: null });
    });
    await expect.poll(() => recorder.texts()).toEqual(['Information: Saved']);
    act(() => {
      api.warning('Low stock on 2 items', { timeout: null });
    });
    await expect
      .poll(() => recorder.texts())
      .toEqual(['Information: Saved', 'Warning: Low stock on 2 items']);
    act(() => {
      api.close(first);
    });
    await expect.poll(() => queue.visibleToasts.length).toBe(1);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(recorder.texts()).toEqual(['Information: Saved', 'Warning: Low stock on 2 items']);
  });

  it('does not announce again when the region re-renders with the same toasts', async () => {
    const { queue, api } = setup();
    const recorder = recordAnnouncements();
    const screen = await renderWithProvider(<ToastRegion queue={queue} />);
    act(() => {
      api('Saved', { timeout: null });
    });
    await expect.poll(() => recorder.texts()).toHaveLength(1);
    await screen.rerender(<ToastRegion queue={queue} className="again" />);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(recorder.texts()).toHaveLength(1);
  });
});

describe('Toast accessibility tree', () => {
  it('exposes a named region, a named alert dialog, an atomic assertive alert and reachable actions', async () => {
    const { queue, api } = setup();
    const onUndo = vi.fn();
    const screen = await renderWithProvider(
      <main>
        <Button>Page action</Button>
        <ToastRegion queue={queue} />
      </main>,
    );
    act(() => {
      api.success('3 items archived', {
        timeout: null,
        action: { label: 'Undo', onPress: onUndo },
      });
    });
    await expect.element(screen.getByText(/3 items archived/)).toBeVisible();

    expect(await axFind('region', 'Toast notifications')).toBeDefined();
    expect(await axFind('alertdialog', 'Success: 3 items archived')).toBeDefined();
    const alert = await axFind('alert');
    expect(alert?.properties['live']).toBe('assertive');
    expect(alert?.properties['atomic']).toBe(true);
    expect(await axFind('button', 'Undo')).toBeDefined();
    expect(await axFind('button', 'Dismiss notification')).toBeDefined();
    // One live region speaks for the toast; there is no second status or alert.
    expect((await axNodes()).filter((n) => n.role === 'alert' || n.role === 'status')).toHaveLength(
      1,
    );

    // Documented keyboard path: F6 moves into the region, then Undo is a normal tab stop.
    screen.getByRole('button', { name: 'Page action' }).element().focus();
    await userEvent.keyboard('{F6}');
    const region = screen.getByRole('region', { name: 'Toast notifications' }).element();
    await expect.poll(() => region.contains(document.activeElement)).toBe(true);
    const undo = screen.getByRole('button', { name: 'Undo' }).element();
    undo.focus();
    await userEvent.keyboard('{Enter}');
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('leaves the accessibility tree free of a toast region until a toast exists', async () => {
    const { queue } = setup();
    await renderWithProvider(
      <main>
        <ToastRegion queue={queue} />
      </main>,
    );
    expect(await axFind('region', 'Toast notifications')).toBeUndefined();
  });
});
