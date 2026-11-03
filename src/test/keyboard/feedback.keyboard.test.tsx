/**
 * Keyboard contract: Toast (Undo reachable, pause on focus), Alert dismiss, Breadcrumb, Stepper.
 * Spec: AGENTS.md section 8, row "Toast / alert": announced via live region; actions focusable;
 * auto-dismiss pauses on hover/focus. Breadcrumb and Stepper follow the "Button / link" row (TEST-004).
 */
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Alert } from '../../components/Alert';
import { Breadcrumb } from '../../components/Breadcrumb';
import { Button } from '../../components/Button';
import { Stepper } from '../../components/Stepper';
import { ToastRegion } from '../../components/Toast/Toast';
import { createToastApi, createToastQueue } from '../../components/Toast/queue';
import { renderWithProvider } from '../render';
import { expectFocus, focusIsWithin, press, tabOrder, tabTo } from './contract';

const toastCount = () => document.querySelectorAll('[class*="toast"][data-tone]').length;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function setup() {
  const queue = createToastQueue();
  return { queue, api: createToastApi(queue) };
}

function Page({ queue }: { queue: ReturnType<typeof createToastQueue> }) {
  return (
    <main>
      <Button>Page action</Button>
      <ToastRegion queue={queue} />
    </main>
  );
}

describe('keyboard contract: toast', () => {
  it('the Undo action is reachable with Tab and activates with Enter, then the toast closes', async () => {
    const { queue, api } = setup();
    const onUndo = vi.fn();
    await renderWithProvider(<Page queue={queue} />);
    act(() => {
      api('3 items archived', { timeout: null, action: { label: 'Undo', onPress: onUndo } });
    });
    await userEvent.tab();
    await expectFocus('Page action');
    await tabTo('Undo');
    await press('{Enter}');
    expect(onUndo).toHaveBeenCalledTimes(1);
    await expect.poll(toastCount).toBe(0);
  });

  it('Space also activates the Undo action', async () => {
    const { queue, api } = setup();
    const onUndo = vi.fn();
    await renderWithProvider(<Page queue={queue} />);
    act(() => {
      api('3 items archived', { timeout: null, action: { label: 'Undo', onPress: onUndo } });
    });
    await userEvent.tab();
    await tabTo('Undo');
    await press(' ');
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('F6 moves focus from the page into the toast region', async () => {
    const { queue, api } = setup();
    await renderWithProvider(<Page queue={queue} />);
    act(() => {
      api('Order archived', { timeout: null, action: { label: 'Undo', onPress: () => undefined } });
    });
    await userEvent.tab();
    await expectFocus('Page action');
    await press('{F6}');
    const region = document.querySelector('[role="region"]');
    await expect.poll(() => focusIsWithin(region)).toBe(true);
  });

  it('auto-dismiss pauses while keyboard focus is inside the region', async () => {
    const { queue, api } = setup();
    await renderWithProvider(<Page queue={queue} />);
    act(() => {
      api('Order archived', { timeout: 700, action: { label: 'Undo', onPress: () => undefined } });
    });
    await userEvent.tab();
    await tabTo('Undo');
    // Wait well past the timeout: the toast must still be there while focus is on it.
    await sleep(1400);
    expect(toastCount()).toBe(1);
  });

  it('the dismiss button is a labelled, keyboard-operable control', async () => {
    const { queue, api } = setup();
    await renderWithProvider(<Page queue={queue} />);
    act(() => {
      api('Saved', { timeout: null });
    });
    await userEvent.tab();
    await tabTo('Dismiss notification');
    await press('{Enter}');
    await expect.poll(toastCount).toBe(0);
  });
});

describe('keyboard contract: alert', () => {
  it('the dismiss button is reachable by Tab and activates with Enter and Space', async () => {
    const onDismiss = vi.fn();
    await renderWithProvider(<Alert title="Saved" onDismiss={onDismiss} />);
    await userEvent.tab();
    expect(document.activeElement?.tagName).toBe('BUTTON');
    await press('{Enter}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await press(' ');
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });
});

describe('keyboard contract: breadcrumb', () => {
  const items = [
    { label: 'Orders', href: '#orders' },
    { label: 'Northwind Traders', href: '#northwind' },
    { label: 'ORD-1048' },
  ];

  it('each ancestor is a Tab stop in order; the current page is not focusable', async () => {
    await renderWithProvider(
      <>
        <button type="button">Before</button>
        <Breadcrumb items={items} />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(await tabOrder(3)).toEqual(['Orders', 'Northwind Traders', 'After']);
  });

  it('Enter follows the focused link', async () => {
    await renderWithProvider(<Breadcrumb items={items} />);
    await userEvent.tab();
    await press('{Enter}');
    expect(window.location.hash).toBe('#orders');
    window.location.hash = '';
  });
});

describe('keyboard contract: stepper', () => {
  const steps = [
    { id: 'basics', label: 'Basics' },
    { id: 'source', label: 'Source' },
    { id: 'review', label: 'Review' },
  ];

  it('completed steps are buttons in the Tab order and activate with Enter and Space', async () => {
    const onStepPress = vi.fn();
    await renderWithProvider(
      <>
        <button type="button">Before</button>
        <Stepper steps={steps} current={2} aria-label="Setup progress" onStepPress={onStepPress} />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    const stops = await tabOrder(3);
    expect(stops[0]).toContain('Basics');
    expect(stops[1]).toContain('Source');
    expect(stops[2]).toBe('After');
    await userEvent.tab({ shift: true });
    await press('{Enter}');
    expect(onStepPress).toHaveBeenCalledTimes(1);
    await userEvent.tab({ shift: true });
    await press(' ');
    expect(onStepPress).toHaveBeenCalledTimes(2);
  });
});
