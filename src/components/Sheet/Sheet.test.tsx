import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Sheet } from './Sheet';
import type { SheetProps } from './Sheet';

/** Waits for the slide animation, which moves the box being measured. */
const settled = () => expect.poll(() => document.getAnimations().length).toBe(0);

const none = () => document.querySelector('[role="dialog"]') === null;

function OrderSheet(props: Partial<SheetProps>) {
  return (
    <main>
      <Sheet
        trigger={<Button>View order</Button>}
        title="Order"
        meta="ORD-1048"
        headerExtra={<Badge tone="success">Shipped</Badge>}
        footerStart={<Button variant="danger">Delete order</Button>}
        footer={({ close }) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <Button variant="primary" onPress={close}>
              Save order
            </Button>
          </>
        )}
        {...props}
      >
        {props.children ?? <p>Order details</p>}
      </Sheet>
    </main>
  );
}

describe('Sheet', () => {
  const original = { width: window.innerWidth, height: window.innerHeight };
  afterEach(async () => {
    await page.viewport(original.width, original.height);
  });

  it('opens as a modal dialog named by its title, with mono meta and a close button', async () => {
    const screen = await renderWithProvider(<OrderSheet />);
    await screen.getByRole('button', { name: 'View order' }).click();
    const sheet = screen.getByRole('dialog', { name: 'Order' });
    await expect.element(sheet).toBeVisible();
    const meta = screen.getByText('ORD-1048').element();
    expect(getComputedStyle(meta).fontFamily).toContain('Geist Mono');
    await expect.element(screen.getByRole('button', { name: 'Close panel' })).toBeVisible();
    await expect.element(screen.getByText('Shipped')).toBeVisible();
  });

  it('opens from the inline-end edge, full height, and fills the width of the size token', async () => {
    await page.viewport(1280, 900);
    const screen = await renderWithProvider(<OrderSheet defaultOpen />);
    await settled();
    const box = screen.getByRole('dialog').element().getBoundingClientRect();
    expect(box.right).toBe(window.innerWidth);
    expect(box.height).toBe(window.innerHeight);
    expect(box.width).toBeGreaterThanOrEqual(439);
    expect(box.width).toBeLessThanOrEqual(441);
  });

  it.each([
    ['sm', 440],
    ['md', 460],
    ['lg', 480],
  ] as const)('size %s is %i px wide', async (size, width) => {
    await page.viewport(1280, 900);
    const screen = await renderWithProvider(<OrderSheet size={size} defaultOpen />);
    await settled();
    const box = screen.getByRole('dialog').element().getBoundingClientRect();
    expect(Math.round(box.width)).toBeGreaterThanOrEqual(width - 1);
    expect(Math.round(box.width)).toBeLessThanOrEqual(width);
  });

  it('has a header as tall as the top bar token', async () => {
    const screen = await renderWithProvider(<OrderSheet defaultOpen />);
    const header = screen.getByRole('dialog').element().querySelector('header') as HTMLElement;
    expect(header.getBoundingClientRect().height).toBe(64);
  });

  it('uses the sheet layer and the scrim color', async () => {
    await renderWithProvider(<OrderSheet defaultOpen />);
    const overlay = document.querySelector<HTMLElement>('[class*="overlay"]') as HTMLElement;
    expect(getComputedStyle(overlay).zIndex).toBe('40');
    expect(getComputedStyle(overlay).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  it('closes with the close button, Escape, and a press on the scrim; focus returns to the trigger', async () => {
    const screen = await renderWithProvider(<OrderSheet />);
    const trigger = screen.getByRole('button', { name: 'View order' });

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(none).toBe(true);
    await expect.element(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await screen.getByRole('button', { name: 'Close panel' }).click();
    await expect.poll(none).toBe(true);
    await expect.element(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    const overlay = document.querySelector<HTMLElement>('[class*="overlay"]') as HTMLElement;
    await userEvent.click(overlay, { position: { x: 4, y: 4 } });
    await expect.poll(none).toBe(true);
  });

  it('traps focus inside the sheet', async () => {
    const screen = await renderWithProvider(<OrderSheet />);
    await screen.getByRole('button', { name: 'View order' }).click();
    const sheet = screen.getByRole('dialog').element();
    for (let step = 0; step < 10; step += 1) {
      await userEvent.tab();
      expect(sheet.contains(document.activeElement)).toBe(true);
    }
  });

  it('keeps the footer visible and scrolls the body when the content is long', async () => {
    const screen = await renderWithProvider(
      <OrderSheet defaultOpen>
        {Array.from({ length: 100 }, (_, index) => (
          <p key={index}>Line {index}</p>
        ))}
      </OrderSheet>,
    );
    await settled();
    const footer = screen.getByRole('button', { name: 'Save order' }).element();
    expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
    const body = screen.getByRole('dialog').element().querySelector('[data-padded]') as HTMLElement;
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    expect(getComputedStyle(body).overflowY).toBe('auto');
  });

  it('puts the destructive action at the start and the other actions at the end of the footer', async () => {
    const screen = await renderWithProvider(<OrderSheet defaultOpen />);
    const destructive = screen.getByRole('button', { name: 'Delete order' }).element();
    const save = screen.getByRole('button', { name: 'Save order' }).element();
    expect(destructive.getBoundingClientRect().left).toBeLessThan(
      save.getBoundingClientRect().left,
    );
  });

  it('can drop the body padding for a full-bleed list', async () => {
    const screen = await renderWithProvider(<OrderSheet defaultOpen padded={false} />);
    const body = screen.getByRole('dialog').element().querySelector('div') as HTMLElement;
    expect(body).not.toBeNull();
    const inner = screen.getByText('Order details').element().parentElement as HTMLElement;
    expect(getComputedStyle(inner).paddingLeft).toBe('0px');
  });

  it('links an optional description with aria-describedby', async () => {
    const screen = await renderWithProvider(
      <OrderSheet defaultOpen description="Edit the lines and the delivery date." />,
    );
    await expect
      .element(screen.getByRole('dialog'))
      .toHaveAccessibleDescription('Edit the lines and the delivery date.');
  });

  it('is controlled through isOpen and reports changes', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <OrderSheet
          isOpen={open}
          onOpenChange={(value) => {
            onOpenChange(value);
            setOpen(value);
          }}
        />
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.poll(none).toBe(true);
  });

  it('takes the close label from the catalog: pt-BR, provider and instance overrides', async () => {
    const pt = await renderWithProvider(<OrderSheet defaultOpen title="Pedido" />, {
      locale: 'pt-BR',
    });
    await expect.element(pt.getByRole('button', { name: 'Fechar painel' })).toBeVisible();
    await pt.unmount();
    const provider = await renderWithProvider(<OrderSheet defaultOpen />, {
      messages: { Sheet: { close: 'Hide panel' } },
    });
    await expect.element(provider.getByRole('button', { name: 'Hide panel' })).toBeVisible();
    await provider.unmount();
    const instance = await renderWithProvider(
      <OrderSheet defaultOpen messages={{ close: 'Dismiss order' }} />,
    );
    await expect.element(instance.getByRole('button', { name: 'Dismiss order' })).toBeVisible();
  });

  it('truncates a very long title with an ellipsis instead of pushing the close button away', async () => {
    const screen = await renderWithProvider(
      <OrderSheet
        defaultOpen
        title="A very long order title that would not fit in the header of the side panel at all"
      />,
    );
    await settled();
    const close = screen.getByRole('button', { name: 'Close panel' }).element();
    expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    const title = screen.getByRole('heading').element();
    expect(getComputedStyle(title).textOverflow).toBe('ellipsis');
  });

  it('has no axe violations with the sheet open', async () => {
    const screen = await renderWithProvider(<OrderSheet />);
    await screen.getByRole('button', { name: 'View order' }).click();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
  });
});
