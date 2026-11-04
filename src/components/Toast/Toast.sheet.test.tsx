import { act } from 'react';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Sheet } from '../Sheet';
import { createToastApi, createToastQueue } from './queue';
import { ToastRegion } from './Toast';

const settled = () => expect.poll(() => document.getAnimations().length).toBe(0);

function overlaps(a: DOMRect, b: DOMRect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

async function openSheetWithToasts(size?: 'sm' | 'md' | 'lg') {
  const queue = createToastQueue();
  const api = createToastApi(queue);
  await renderWithProvider(
    <main>
      <ToastRegion queue={queue} />
      <Sheet
        defaultOpen
        {...(size ? { size } : {})}
        title="New order"
        footer={() => (
          <>
            <Button>Create another</Button>
            <Button variant="primary">Create order</Button>
          </>
        )}
      >
        <p>Details</p>
      </Sheet>
    </main>,
  );
  act(() => {
    api.success('Order #1051 created for Contoso Industries Ltd', { timeout: null });
    api.success('Order #1052 created for Contoso Industries Ltd', { timeout: null });
    api.success('Order #1053 created for Contoso Industries Ltd', { timeout: null });
  });
  await settled();
  const region = document.querySelector<HTMLElement>('[aria-label="Toast notifications"]');
  const footer = document.querySelector<HTMLElement>('footer');
  if (!region || !footer) throw new Error('Region or footer missing');
  return { region, footer };
}

describe('Toast next to a Sheet (GAP-052)', () => {
  const original = { width: window.innerWidth, height: window.innerHeight };
  afterEach(async () => {
    await page.viewport(original.width, original.height);
  });

  it('keeps three stacked toasts clear of the footer buttons of an open sheet', async () => {
    await page.viewport(800, 720);
    const { region, footer } = await openSheetWithToasts('lg');
    const toasts = [...region.querySelectorAll<HTMLElement>('[data-tone]')];
    expect(toasts).toHaveLength(3);
    const buttons = [...footer.querySelectorAll('button')];
    expect(buttons.length).toBeGreaterThan(1);
    for (const toastEl of toasts) {
      for (const button of buttons) {
        expect(overlaps(toastEl.getBoundingClientRect(), button.getBoundingClientRect())).toBe(
          false,
        );
      }
    }
  });

  it('also stays clear on a narrow screen where the sheet is full width', async () => {
    await page.viewport(390, 800);
    const { region, footer } = await openSheetWithToasts('lg');
    const toasts = [...region.querySelectorAll<HTMLElement>('[data-tone]')];
    const footerRect = footer.getBoundingClientRect();
    for (const toastEl of toasts) {
      expect(overlaps(toastEl.getBoundingClientRect(), footerRect)).toBe(false);
    }
  });

  it('puts the toasts beside a large sheet while open and back in the centre as it starts to close', async () => {
    await page.viewport(800, 720);
    const { region } = await openSheetWithToasts('lg');
    const toast = region.querySelector<HTMLElement>('[data-tone]');
    const sheet = document.querySelector<HTMLElement>('[data-ds-sheet="lg"]');
    if (!toast || !sheet) throw new Error('Toast or sheet missing');
    expect(toast.getBoundingClientRect().right).toBeLessThanOrEqual(
      sheet.getBoundingClientRect().left + 1,
    );
    await userEvent.keyboard('{Escape}');
    // The sheet is still in the DOM, playing its exit animation, but no longer counts.
    await expect.poll(() => document.querySelector('[data-exiting]') !== null).toBe(true);
    await expect
      .poll(() => {
        const rect = toast.getBoundingClientRect();
        return Math.abs((rect.left + rect.right) / 2 - window.innerWidth / 2);
      })
      .toBeLessThan(2);
  });
});
