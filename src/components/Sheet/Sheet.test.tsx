import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { watchExit } from '../../test/exitAnimation';
import { renderWithProvider } from '../../test/render';
import { setReducedMotion } from '../../test/reducedMotion';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { Sheet } from './Sheet';
import type { SheetProps } from './Sheet';

/** Waits for the slide animation, which moves the box being measured. */
const settled = () => expect.poll(() => document.getAnimations().length).toBe(0);

/** `element.click()`, the way code (not a user) opens a trigger. */
const clickFromCode = (element: Element) => {
  (element as HTMLElement).click();
};

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

/** A sheet whose content comes from state that is cleared in the same update that closes it. */
function ClearingSheet() {
  const [record, setRecord] = useState<{ number: string; name: string } | null>({
    number: 'ORD-1048',
    name: 'Contoso',
  });
  return (
    <main>
      <Sheet
        isOpen={record !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setRecord(null);
        }}
        title={record ? 'Order' : ''}
        meta={record?.number}
        description={record ? 'Edit the customer.' : undefined}
        footer={({ close }) =>
          record ? (
            <Button variant="primary" onPress={close}>
              Save order
            </Button>
          ) : null
        }
      >
        {record ? <Input label="Customer" defaultValue={record.name} /> : null}
      </Sheet>
    </main>
  );
}

describe('Sheet', () => {
  const original = { width: window.innerWidth, height: window.innerHeight };
  afterEach(async () => {
    await page.viewport(original.width, original.height);
    await setReducedMotion(false);
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
    // On a narrow viewport the sheet is full width and there is no scrim left to press.
    await page.viewport(1280, 900);
    const screen = await renderWithProvider(<OrderSheet />);
    const trigger = screen.getByRole('button', { name: 'View order' });

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(none, { timeout: 4000 }).toBe(true);
    await expect.element(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await screen.getByRole('button', { name: 'Close panel' }).click();
    await expect.poll(none, { timeout: 4000 }).toBe(true);
    await expect.element(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    const overlay = document.querySelector<HTMLElement>('[class*="overlay"]') as HTMLElement;
    await userEvent.click(overlay, { position: { x: 4, y: 4 } });
    await expect.poll(none, { timeout: 4000 }).toBe(true);
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

  it('opens controlled without a trigger and logs nothing to the console (GAP-022)', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      function Controlled() {
        const [open, setOpen] = useState(false);
        return (
          <main>
            <Button
              onPress={() => {
                setOpen(true);
              }}
            >
              Open it
            </Button>
            <Sheet
              isOpen={open}
              onOpenChange={(value) => {
                setOpen(value);
              }}
              title="Controlled"
            >
              <p>Body</p>
            </Sheet>
          </main>
        );
      }
      const screen = await renderWithProvider(<Controlled />);
      await userEvent.click(screen.getByRole('button', { name: 'Open it' }));
      await expect.element(screen.getByRole('dialog')).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await expect.poll(none).toBe(true);
      await expect.element(screen.getByRole('button', { name: 'Open it' })).toHaveFocus();
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
      warn.mockRestore();
    }
  });

  describe('initial focus (GAP-031)', () => {
    function FocusSheet({ via }: { via: 'trigger' | 'controlled' }) {
      const [open, setOpen] = useState(false);
      const body = (
        <>
          {/* eslint-disable-next-line jsx-a11y-x/no-autofocus -- the behavior under test (GAP-031). */}
          <Input label="Customer" autoFocus />
          <Input label="Notes" />
        </>
      );
      return (
        <main>
          {via === 'trigger' ? (
            <Sheet trigger={<Button>Edit order</Button>} title="Edit order">
              {body}
            </Sheet>
          ) : (
            <>
              <Button
                onPress={() => {
                  setOpen(true);
                }}
              >
                Edit order
              </Button>
              <button
                type="button"
                onClick={() => {
                  setTimeout(() => {
                    setOpen(true);
                  }, 0);
                }}
              >
                Open later
              </button>
              <Sheet isOpen={open} onOpenChange={setOpen} title="Edit order">
                {body}
              </Sheet>
            </>
          )}
        </main>
      );
    }

    const customer = () => document.activeElement?.getAttribute('aria-label') ?? '';
    const focusedLabel = () =>
      (document.activeElement as HTMLInputElement | null)?.labels?.[0]?.textContent ?? customer();

    it('focuses the autoFocus field when the trigger is opened with the keyboard', async () => {
      const screen = await renderWithProvider(<FocusSheet via="trigger" />);
      screen.getByRole('button', { name: 'Edit order' }).element().focus();
      await userEvent.keyboard('{Enter}');
      await expect.element(screen.getByRole('dialog')).toBeVisible();
      await expect.poll(focusedLabel).toBe('Customer');
    });

    it('focuses the autoFocus field when the trigger is opened with the pointer', async () => {
      const screen = await renderWithProvider(<FocusSheet via="trigger" />);
      await userEvent.click(screen.getByRole('button', { name: 'Edit order' }));
      await expect.poll(focusedLabel).toBe('Customer');
    });

    it('focuses the autoFocus field when a trigger is clicked from code (element.click())', async () => {
      const screen = await renderWithProvider(<FocusSheet via="trigger" />);
      clickFromCode(screen.getByRole('button', { name: 'Edit order' }).element());
      await expect.element(screen.getByRole('dialog')).toBeVisible();
      await expect.poll(focusedLabel).toBe('Customer');
    });

    it('focuses the autoFocus field when a controlled sheet without a trigger is opened by state', async () => {
      const screen = await renderWithProvider(<FocusSheet via="controlled" />);
      await userEvent.click(screen.getByRole('button', { name: 'Edit order' }));
      await expect.poll(focusedLabel).toBe('Customer');
    });

    it('focuses the autoFocus field when the state is set from a timer, away from any user event', async () => {
      const screen = await renderWithProvider(<FocusSheet via="controlled" />);
      clickFromCode(screen.getByRole('button', { name: 'Open later' }).element());
      await expect.element(screen.getByRole('dialog')).toBeVisible();
      await expect.poll(focusedLabel).toBe('Customer');
    });

    it('moves focus into the dialog when no field asks for it, for a programmatic open', async () => {
      function Plain() {
        const [open, setOpen] = useState(false);
        return (
          <main>
            <button
              type="button"
              onClick={() => {
                setTimeout(() => {
                  setOpen(true);
                }, 0);
              }}
            >
              Open later
            </button>
            <Sheet isOpen={open} onOpenChange={setOpen} title="Plain">
              <p>No fields</p>
            </Sheet>
          </main>
        );
      }
      const screen = await renderWithProvider(<Plain />);
      clickFromCode(screen.getByRole('button', { name: 'Open later' }).element());
      await expect.element(screen.getByRole('dialog')).toBeVisible();
      await expect
        .poll(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement))
        .toBe(true);
    });
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
    await expect.poll(() => onOpenChange).toHaveBeenCalledWith(false);
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

  it('keeps its content while it animates out after the state that feeds it was cleared (GAP-036)', async () => {
    const screen = await renderWithProvider(<ClearingSheet />);
    await expect.element(screen.getByRole('dialog', { name: 'Order' })).toBeVisible();
    await settled();
    const watch = watchExit({ text: ['Order', 'ORD-1048', 'Save order'], values: ['Contoso'] });
    await userEvent.keyboard('{Escape}');
    await expect.poll(none, { timeout: 4000 }).toBe(true);
    const seen = watch.stop();
    expect(seen.sawExiting).toBe(true);
    expect(seen.blank).toEqual([]);
  });

  it('shows the new content again when it reopens after the state was cleared', async () => {
    function Reopen() {
      const [record, setRecord] = useState<string | null>('ORD-1048');
      return (
        <main>
          <Button
            onPress={() => {
              setRecord('ORD-2000');
            }}
          >
            Open another
          </Button>
          <Sheet
            isOpen={record !== null}
            onOpenChange={(isOpen) => {
              if (!isOpen) setRecord(null);
            }}
            title="Order"
            meta={record ?? undefined}
          >
            <p>{record}</p>
          </Sheet>
        </main>
      );
    }
    const screen = await renderWithProvider(<Reopen />);
    await userEvent.keyboard('{Escape}');
    await expect.poll(none, { timeout: 4000 }).toBe(true);
    await screen.getByRole('button', { name: 'Open another' }).click();
    const dialog = screen.getByRole('dialog', { name: 'Order' });
    await expect.element(dialog).toBeVisible();
    expect(dialog.element().textContent).toContain('ORD-2000');
    expect(dialog.element().textContent).not.toContain('ORD-1048');
  });

  it('leaves the DOM right after closing when the user prefers reduced motion', async () => {
    await setReducedMotion(true);
    await renderWithProvider(<ClearingSheet />);
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect.poll(none, { timeout: 1000 }).toBe(true);
    expect(document.querySelector('[data-exiting]')).toBeNull();
    expect(document.getAnimations().length).toBe(0);
  });
});
