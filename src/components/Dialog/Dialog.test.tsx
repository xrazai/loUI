import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Input } from '../Input';
import { Menu, MenuItem } from '../Menu';
import { Sheet } from '../Sheet';
import { Dialog } from './Dialog';

/** Waits for the open and close animations, which move the box being measured. */
const settled = () => expect.poll(() => document.getAnimations().length).toBe(0);

const none = (role = 'dialog') => document.querySelector(`[role="${role}"]`) === null;

function EditCustomer(props: Partial<React.ComponentProps<typeof Dialog>>) {
  return (
    <main>
      <Dialog
        trigger={<Button>Edit customer</Button>}
        title="Edit customer"
        description="Changes apply to new orders only."
        footer={({ close }) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <Button variant="primary" onPress={close}>
              Save customer
            </Button>
          </>
        )}
        {...props}
      >
        <Input label="Name" />
      </Dialog>
    </main>
  );
}

describe('Dialog', () => {
  const original = { width: window.innerWidth, height: window.innerHeight };
  afterEach(async () => {
    await page.viewport(original.width, original.height);
  });

  it('opens from the trigger as a modal dialog named by its title and described by its text', async () => {
    const screen = await renderWithProvider(<EditCustomer />);
    expect(none()).toBe(true);
    await screen.getByRole('button', { name: 'Edit customer' }).click();
    const dialog = screen.getByRole('dialog', { name: 'Edit customer' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveAccessibleDescription('Changes apply to new orders only.');
    expect(screen.getByRole('heading', { name: 'Edit customer' }).element().tagName).toBe('H2');
  });

  it('opens with the keyboard and moves focus inside', async () => {
    const screen = await renderWithProvider(<EditCustomer />);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    const dialog = screen.getByRole('dialog');
    await expect.element(dialog).toBeVisible();
    expect(dialog.element().contains(document.activeElement)).toBe(true);
  });

  it('traps focus: Tab and Shift+Tab cycle inside the dialog', async () => {
    const screen = await renderWithProvider(<EditCustomer />);
    await screen.getByRole('button', { name: 'Edit customer' }).click();
    const dialog = screen.getByRole('dialog').element();
    for (let step = 0; step < 8; step += 1) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let step = 0; step < 8; step += 1) {
      await userEvent.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('closes with Escape and restores focus to the trigger', async () => {
    const screen = await renderWithProvider(<EditCustomer />);
    const trigger = screen.getByRole('button', { name: 'Edit customer' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => none()).toBe(true);
    await expect.element(trigger).toHaveFocus();
  });

  it('closes from the footer through the close render prop', async () => {
    const screen = await renderWithProvider(<EditCustomer />);
    await screen.getByRole('button', { name: 'Edit customer' }).click();
    await screen.getByRole('button', { name: 'Cancel' }).click();
    await expect.poll(() => none()).toBe(true);
  });

  it('makes the page inert for assistive technology and locks scrolling while open', async () => {
    const screen = await renderWithProvider(
      <div>
        <p>Page content</p>
        <EditCustomer />
      </div>,
    );
    await screen.getByRole('button', { name: 'Edit customer' }).click();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    const trigger = screen.getByRole('button', { name: 'Edit customer' }).element();
    expect(trigger.closest('[aria-hidden="true"], [inert]')).not.toBeNull();
    expect(getComputedStyle(document.documentElement).overflow).toBe('hidden');
  });

  it('closes on a press on the overlay when dismissable and stays open when not', async () => {
    const dismissable = await renderWithProvider(<EditCustomer />);
    await dismissable.getByRole('button', { name: 'Edit customer' }).click();
    const overlay = document.querySelector<HTMLElement>(
      '[data-testid="underlay"], .react-aria-ModalOverlay, [class*="overlay"]',
    );
    expect(overlay).not.toBeNull();
    await userEvent.click(overlay as HTMLElement, { position: { x: 4, y: 4 } });
    await expect.poll(() => none()).toBe(true);
    await dismissable.unmount();

    const fixed = await renderWithProvider(<EditCustomer isDismissable={false} />);
    await fixed.getByRole('button', { name: 'Edit customer' }).click();
    const again = document.querySelector<HTMLElement>('[class*="overlay"]');
    await userEvent.click(again as HTMLElement, { position: { x: 4, y: 4 } });
    await expect.element(fixed.getByRole('dialog')).toBeVisible();
  });

  it('is controlled through isOpen and reports changes', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <EditCustomer
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
    await expect.poll(() => none()).toBe(true);
  });

  it('supports defaultOpen for uncontrolled use', async () => {
    const screen = await renderWithProvider(<EditCustomer defaultOpen />);
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('can open without a trigger when controlled', async () => {
    const screen = await renderWithProvider(
      <Dialog title="Session expired" isOpen onOpenChange={() => undefined}>
        Sign in again to continue.
      </Dialog>,
    );
    await expect.element(screen.getByRole('dialog', { name: 'Session expired' })).toBeVisible();
  });

  it.each([
    ['sm', 420],
    ['md', 540],
    ['lg', 680],
  ] as const)('size %s is at most %i px wide', async (size, width) => {
    await page.viewport(1280, 900);
    const screen = await renderWithProvider(<EditCustomer size={size} defaultOpen />);
    await settled();
    const box = screen.getByRole('dialog').element().getBoundingClientRect();
    expect(box.width).toBeLessThanOrEqual(width);
    expect(box.width).toBeGreaterThan(width - 4);
  });

  it('uses the dialog layer, the raised surface, the dialog shadow and the overlay color', async () => {
    await renderWithProvider(<EditCustomer defaultOpen />);
    const overlay = document.querySelector<HTMLElement>('[class*="overlay"]') as HTMLElement;
    expect(getComputedStyle(overlay).zIndex).toBe('45');
    const modal = document.querySelector<HTMLElement>('[class*="modal"]') as HTMLElement;
    expect(getComputedStyle(modal).boxShadow).not.toBe('none');
    expect(getComputedStyle(modal).borderRadius).toBe('10px');
  });

  it('keeps long bodies inside the viewport and scrolls the body', async () => {
    const screen = await renderWithProvider(
      <Dialog title="Terms" defaultOpen footer={<Button>Close</Button>}>
        {Array.from({ length: 80 }, (_, index) => (
          <p key={index}>Line {index}</p>
        ))}
      </Dialog>,
    );
    await settled();
    const dialog = screen.getByRole('dialog').element().getBoundingClientRect();
    expect(dialog.height).toBeLessThanOrEqual(window.innerHeight);
    expect(
      screen.getByRole('button', { name: 'Close' }).element().getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(window.innerHeight);
  });

  it('makes the body a tab stop only while it overflows, so it can be scrolled by keyboard', async () => {
    const long = await renderWithProvider(
      <Dialog title="Terms" defaultOpen>
        {Array.from({ length: 80 }, (_, index) => (
          <p key={index}>Line {index}</p>
        ))}
      </Dialog>,
    );
    await settled();
    const longBody = long.getByRole('dialog').element().querySelector('[class*="body"]');
    await expect.poll(() => longBody?.getAttribute('tabindex')).toBe('0');
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
    await long.unmount();
    const short = await renderWithProvider(
      <Dialog title="Short" defaultOpen>
        <p>One line</p>
      </Dialog>,
    );
    await settled();
    const shortBody = short.getByRole('dialog').element().querySelector('[class*="body"]');
    expect(shortBody?.hasAttribute('tabindex')).toBe(false);
  });

  it('shows consumer-translated content with the pt-BR locale', async () => {
    const screen = await renderWithProvider(
      <Dialog
        title="Editar cliente"
        description="As alterações valem para novos pedidos."
        defaultOpen
      >
        <Input label="Nome" />
      </Dialog>,
      { locale: 'pt-BR' },
    );
    await expect.element(screen.getByRole('dialog', { name: 'Editar cliente' })).toBeVisible();
  });

  describe('nested overlays', () => {
    function SheetWithDialog() {
      return (
        <main>
          <Sheet
            defaultOpen
            title="Order"
            meta="ORD-1048"
            footerStart={
              <Dialog
                trigger={<Button variant="danger">Delete order</Button>}
                title="Delete order #1048?"
                description="The order will be removed."
                footer={({ close }) => <Button onPress={close}>Cancel</Button>}
              />
            }
          >
            <p>Order details</p>
          </Sheet>
        </main>
      );
    }

    it('closes only the top layer on Escape: the Dialog first, then the Sheet', async () => {
      const screen = await renderWithProvider(<SheetWithDialog />);
      const sheet = screen.getByRole('dialog', { name: 'Order' });
      await expect.element(sheet).toBeVisible();
      // Open from the keyboard: focus restoration targets the element that had focus, and a
      // pointer click during the sheet's entry animation does not always leave it focused.
      const trigger = screen.getByRole('button', { name: 'Delete order' });
      trigger.element().focus();
      await expect.element(trigger).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect
        .element(screen.getByRole('dialog', { name: 'Delete order #1048?' }))
        .toBeVisible();
      expect(screen.getByRole('dialog').elements()).toHaveLength(2);

      await userEvent.keyboard('{Escape}');
      await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(1);
      await expect.element(screen.getByRole('dialog', { name: 'Order' })).toBeVisible();
      // Focus is back on the button that opened the dialog, inside the sheet.
      await expect.element(screen.getByRole('button', { name: 'Delete order' })).toHaveFocus();

      await userEvent.keyboard('{Escape}');
      await expect.poll(() => none()).toBe(true);
    });

    it('stacks the Dialog above the Sheet', async () => {
      const screen = await renderWithProvider(<SheetWithDialog />);
      await screen.getByRole('button', { name: 'Delete order' }).click();
      await expect
        .element(screen.getByRole('dialog', { name: 'Delete order #1048?' }))
        .toBeVisible();
      const overlays = [...document.querySelectorAll<HTMLElement>('[class*="overlay"]')];
      const zs = overlays.map((el) => Number(getComputedStyle(el).zIndex));
      expect(Math.max(...zs)).toBe(45);
      expect(Math.min(...zs)).toBe(40);
    });

    it('has no axe violations with a Dialog open over a Sheet', async () => {
      const screen = await renderWithProvider(<SheetWithDialog />);
      await screen.getByRole('button', { name: 'Delete order' }).click();
      await expect
        .element(screen.getByRole('dialog', { name: 'Delete order #1048?' }))
        .toBeVisible();
      await expect.poll(() => document.getAnimations().length).toBe(0);
      await expectNoA11yViolations(document.body);
    });
  });

  describe('layers', () => {
    it('renders a menu opened inside a dialog above the dialog', async () => {
      const screen = await renderWithProvider(
        <Dialog title="Order" defaultOpen>
          <Menu trigger={<Button>Actions</Button>} defaultOpen>
            <MenuItem id="edit">Edit order</MenuItem>
          </Menu>
        </Dialog>,
      );
      await expect.element(screen.getByRole('menu')).toBeVisible();
      const popover = document.querySelector<HTMLElement>(
        '[data-trigger="MenuTrigger"]',
      ) as HTMLElement;
      const overlay = document.querySelector<HTMLElement>('[class*="overlay"]') as HTMLElement;
      // Popover layers sit above the dialog layer (z-index scale, see Dialog.md "Layers").
      expect(Number(getComputedStyle(popover).zIndex)).toBeGreaterThan(
        Number(getComputedStyle(overlay).zIndex),
      );
    });
  });

  it('has no axe violations with the dialog open', async () => {
    const screen = await renderWithProvider(<EditCustomer />);
    await screen.getByRole('button', { name: 'Edit customer' }).click();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
  });
});
