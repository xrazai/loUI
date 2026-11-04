import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Card } from '../Card';
import { DEFAULT_TOAST_TIMEOUT, createToastApi, createToastQueue, toast, useToast } from './queue';
import { ToastRegion } from './Toast';

function setup() {
  const queue = createToastQueue();
  return { queue, api: createToastApi(queue) };
}

const toasts = () => document.querySelectorAll('[class*="toast"][data-tone]');
/** Moves the fake clock (the toast timers) forward. Needs `vi.useFakeTimers`. */
const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

describe('Toast', () => {
  it('shows nothing until a toast is queued, then a labelled region', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(<ToastRegion queue={queue} />);
    expect(toasts()).toHaveLength(0);
    act(() => {
      api('Order #1051 created');
    });
    await expect.element(screen.getByRole('region', { name: 'Toast notifications' })).toBeVisible();
    await expect.element(screen.getByText(/Order #1051 created/)).toBeVisible();
  });

  it('defaults to a 5000 ms timeout, longer than the 3.6 s of the handoff', async () => {
    expect(DEFAULT_TOAST_TIMEOUT).toBe(5000);
    const { queue, api } = setup();
    await renderWithProvider(<ToastRegion queue={queue} />);
    act(() => {
      api('Saved');
    });
    expect(queue.visibleToasts[0]?.timeout).toBe(5000);
  });

  it('closes by itself after the timeout and calls onClose', async () => {
    const { queue, api } = setup();
    const onClose = vi.fn();
    await renderWithProvider(<ToastRegion queue={queue} />);
    act(() => {
      api('Saved', { timeout: 300, onClose });
    });
    await expect.poll(() => toasts().length).toBe(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stays until dismissed when the timeout is null', async () => {
    const { queue, api } = setup();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    try {
      const screen = await renderWithProvider(<ToastRegion queue={queue} />);
      act(() => {
        api.danger('Payment failed', { timeout: null });
      });
      expect(queue.visibleToasts[0]?.timeout).toBeUndefined();
      await advance(5500);
      await expect.element(screen.getByText(/Payment failed/)).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  });

  it('pauses the timer while the pointer is over the toast and resumes afterwards', async () => {
    const { queue, api } = setup();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    try {
      const screen = await renderWithProvider(
        <main>
          <p>Page content</p>
          <ToastRegion queue={queue} />
        </main>,
      );
      act(() => {
        api('Saved', { timeout: 1500 });
      });
      await expect.poll(() => document.getAnimations().length).toBe(0);
      const message = screen.getByText(/Saved/);
      const box = document.querySelector('[data-tone]') as HTMLElement;
      await userEvent.hover(screen.getByText('Page content'));
      await userEvent.hover(box);
      await advance(2000);
      await expect.element(message).toBeVisible();
      await userEvent.unhover(box);
      await advance(1600);
      await expect.poll(() => toasts().length, { timeout: 4000 }).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('pauses the timer while keyboard focus is inside the region (WCAG 2.2.1)', async () => {
    const { queue, api } = setup();
    const onUndo = vi.fn();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    try {
      const screen = await renderWithProvider(
        <main>
          <ToastRegion queue={queue} />
        </main>,
      );
      act(() => {
        api('Order archived', { timeout: 700, action: { label: 'Undo', onPress: onUndo } });
      });
      screen.getByRole('button', { name: 'Undo' }).element().focus();
      await advance(1200);
      await expect.element(screen.getByText(/Order archived/)).toBeVisible();
      expect(onUndo).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('moves focus into the region with F6', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(
      <main>
        <Button>Page action</Button>
        <ToastRegion queue={queue} />
      </main>,
    );
    act(() => {
      api('Order archived', { timeout: null, action: { label: 'Undo', onPress: () => undefined } });
    });
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: 'Page action' })).toHaveFocus();
    await userEvent.keyboard('{F6}');
    // Fall back to a synthetic event if the driver does not send F6.
    if (
      !screen
        .getByRole('region', { name: 'Toast notifications' })
        .element()
        .contains(document.activeElement)
    ) {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'F6', bubbles: true }),
      );
    }
    const region = screen.getByRole('region', { name: 'Toast notifications' }).element();
    await expect.poll(() => region.contains(document.activeElement)).toBe(true);
  });

  it('offers an Undo action reachable by keyboard that runs and closes the toast', async () => {
    const { queue, api } = setup();
    const onUndo = vi.fn();
    const screen = await renderWithProvider(
      <main>
        <ToastRegion queue={queue} />
      </main>,
    );
    act(() => {
      api.success('3 items archived', {
        timeout: null,
        action: { label: 'Undo', onPress: onUndo },
      });
    });
    const undo = screen.getByRole('button', { name: 'Undo' });
    undo.element().focus();
    await expect.element(undo).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onUndo).toHaveBeenCalledTimes(1);
    await expect.poll(() => toasts().length).toBe(0);
  });

  it('dismisses with the labelled close button', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(<ToastRegion queue={queue} />);
    act(() => {
      api('Saved', { timeout: null });
    });
    await screen.getByRole('button', { name: 'Dismiss notification' }).click();
    await expect.poll(() => toasts().length).toBe(0);
  });

  it.each([
    ['info', 'Information'],
    ['success', 'Success'],
    ['warning', 'Warning'],
    ['danger', 'Error'],
  ] as const)('speaks the %s tone as text, not only as the dot color', async (tone, spoken) => {
    const { queue, api } = setup();
    await renderWithProvider(<ToastRegion queue={queue} />);
    act(() => {
      api[tone]('Something happened', { timeout: null });
    });
    const item = document.querySelector(`[data-tone="${tone}"]`) as HTMLElement;
    expect(item).not.toBeNull();
    expect(item.textContent).toContain(`${spoken}: Something happened`);
    const dot = item.querySelector('[class*="dot"]');
    expect(dot?.getAttribute('aria-hidden')).toBe('true');
  });

  it('colors the dot by tone', async () => {
    const { queue, api } = setup();
    await renderWithProvider(<ToastRegion queue={queue} />);
    act(() => {
      api.success('Saved', { timeout: null });
      api.danger('Failed', { timeout: null });
    });
    const colors = [...document.querySelectorAll('[class*="dot"]')].map(
      (dot) => getComputedStyle(dot).backgroundColor,
    );
    expect(new Set(colors).size).toBe(2);
  });

  it('shows at most four toasts and queues the rest', async () => {
    const { queue, api } = setup();
    await renderWithProvider(<ToastRegion queue={queue} />);
    act(() => {
      for (let n = 1; n <= 6; n += 1) api(`Message ${String(n)}`, { timeout: null });
    });
    expect(toasts()).toHaveLength(4);
  });

  it('sits on the toast layer, bottom center, with the overlay shadow', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(<ToastRegion queue={queue} />);
    act(() => {
      api('Saved', { timeout: null });
    });
    const region = screen.getByRole('region').element();
    expect(getComputedStyle(region).zIndex).toBe('58');
    expect(getComputedStyle(region).position).toBe('fixed');
    await expect.poll(() => document.getAnimations().length).toBe(0);
    const box = document.querySelector('[class*="toast"][data-tone]') as HTMLElement;
    expect(getComputedStyle(box).boxShadow).not.toBe('none');
    const rect = box.getBoundingClientRect();
    expect(Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2)).toBeLessThan(2);
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
  });

  it('has a toast global and a hook that return the same API', () => {
    expect(useToast()).toBe(toast);
  });

  it('uses the pt-BR catalog, a provider override and an instance override', async () => {
    const { queue, api } = setup();
    const pt = await renderWithProvider(<ToastRegion queue={queue} />, { locale: 'pt-BR' });
    act(() => {
      api.success('Pedido criado', { timeout: null });
    });
    await expect
      .element(pt.getByRole('region', { name: 'Notificações temporárias' }))
      .toBeVisible();
    await expect.element(pt.getByRole('button', { name: 'Dispensar notificação' })).toBeVisible();
    await pt.unmount();

    const second = setup();
    const provider = await renderWithProvider(<ToastRegion queue={second.queue} />, {
      messages: { Toast: { dismiss: 'Close message' } },
    });
    act(() => {
      second.api('Saved', { timeout: null });
    });
    await expect.element(provider.getByRole('button', { name: 'Close message' })).toBeVisible();
    await provider.unmount();

    const third = setup();
    const instance = await renderWithProvider(
      <ToastRegion queue={third.queue} messages={{ dismiss: 'Hide' }} />,
    );
    act(() => {
      third.api('Saved', { timeout: null });
    });
    await expect.element(instance.getByRole('button', { name: 'Hide' })).toBeVisible();
  });

  it('has no axe violations with toasts of every tone and an action open', async () => {
    const { queue, api } = setup();
    await renderWithProvider(
      <main>
        <h1>Orders</h1>
        <ToastRegion queue={queue} />
      </main>,
    );
    act(() => {
      api.info('Information message', { timeout: null });
      api.success('Order #1051 created', {
        timeout: null,
        action: { label: 'Undo', onPress: () => undefined },
      });
      api.warning('Stock is low', { timeout: null });
      api.danger('Payment failed', { timeout: null });
    });
    await expect.poll(() => toasts().length).toBe(4);
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
  });

  it('does not share its landmark name with a Card titled "Notifications" (landmark-unique)', async () => {
    const { queue, api } = setup();
    await renderWithProvider(
      <main>
        <h1>Settings</h1>
        <Card title="Notifications">Choose which emails you receive.</Card>
        <ToastRegion queue={queue} />
      </main>,
    );
    act(() => {
      api.success('Settings saved', { timeout: null });
    });
    await expect.poll(() => toasts().length).toBe(1);
    await expect.poll(() => document.getAnimations().length).toBe(0);
    // `landmark-unique` is a best-practice rule, outside the WCAG tag set of the shared helper.
    await expectNoA11yViolations(document.body, {
      runOnly: { type: 'rule', values: ['landmark-unique'] },
    });
  });
});
