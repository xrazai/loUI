/**
 * Keyboard contract: Dialog, ConfirmDialog, Sheet, Drawer, Tour and nested layers.
 * Spec: AGENTS.md section 8, row "Dialog / sheet": focus trapped; initial focus configurable
 * (Cancel for destructive); Esc closes only the top layer; focus returns to the trigger (TEST-004).
 */
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Button } from '../../components/Button';
import { ConfirmDialog, Dialog } from '../../components/Dialog';
import { Drawer } from '../../components/Drawer';
import { Input } from '../../components/Input';
import { Menu, MenuItem } from '../../components/Menu';
import { Sheet } from '../../components/Sheet';
import { renderWithProvider } from '../render';
import { expectFocus, expectFocusOn, focusIsWithin, press } from './contract';

const dialogs = (role = 'dialog') => document.querySelectorAll(`[role="${role}"]`);
const noDialog = (role = 'dialog') => dialogs(role).length === 0;

function topDialog(role = 'dialog'): HTMLElement {
  const all = [...dialogs(role)] as HTMLElement[];
  const last = all.at(-1);
  if (!last) throw new Error(`No ${role} open.`);
  return last;
}

/** Focuses the trigger the way a keyboard user does: Tab past the "Before" button. */
async function focusTrigger(label: string) {
  await userEvent.tab();
  await userEvent.tab();
  await expectFocus(label);
  return document.activeElement as HTMLElement;
}

function EditCustomer() {
  return (
    <>
      <button type="button">Before</button>
      <Dialog
        trigger={<Button>Edit customer</Button>}
        title="Edit customer"
        footer={({ close }) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <Button variant="primary" onPress={close}>
              Save customer
            </Button>
          </>
        )}
      >
        <Input label="Name" />
      </Dialog>
      <button type="button">After</button>
    </>
  );
}

describe('keyboard contract: dialog', () => {
  it('Enter on the trigger opens the dialog and moves focus inside it', async () => {
    await renderWithProvider(<EditCustomer />);
    await focusTrigger('Edit customer');
    await press('{Enter}');
    await expect.poll(() => dialogs().length).toBe(1);
    await expect.poll(() => focusIsWithin(topDialog())).toBe(true);
  });

  it('Space on the trigger also opens it', async () => {
    await renderWithProvider(<EditCustomer />);
    await focusTrigger('Edit customer');
    await press(' ');
    await expect.poll(() => dialogs().length).toBe(1);
  });

  it('traps focus: Tab and Shift+Tab cycle inside the dialog and never reach the page', async () => {
    await renderWithProvider(<EditCustomer />);
    await focusTrigger('Edit customer');
    await press('{Enter}');
    await expect.poll(() => focusIsWithin(topDialog())).toBe(true);
    const seen = new Set<Element | null>();
    for (let i = 0; i < 8; i += 1) {
      await userEvent.tab();
      expect(focusIsWithin(topDialog())).toBe(true);
      seen.add(document.activeElement);
    }
    // Wrapped around: more presses than focusable elements, so we revisited elements.
    expect(seen.size).toBeLessThan(8);
    for (let i = 0; i < 8; i += 1) {
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      expect(focusIsWithin(topDialog())).toBe(true);
    }
  });

  it('Escape closes the dialog and returns focus to the trigger', async () => {
    await renderWithProvider(<EditCustomer />);
    const trigger = await focusTrigger('Edit customer');
    await press('{Enter}');
    await expect.poll(() => dialogs().length).toBe(1);
    await press('{Escape}');
    await expect.poll(() => noDialog()).toBe(true);
    await expectFocusOn(trigger);
  });

  it('activating Cancel with Enter closes the dialog and returns focus to the trigger', async () => {
    await renderWithProvider(<EditCustomer />);
    const trigger = await focusTrigger('Edit customer');
    await press('{Enter}');
    await expect.poll(() => focusIsWithin(topDialog())).toBe(true);
    let guard = 0;
    while (document.activeElement?.textContent.trim() !== 'Cancel' && guard < 8) {
      await userEvent.tab();
      guard += 1;
    }
    await expectFocus('Cancel');
    await press('{Enter}');
    await expect.poll(() => noDialog()).toBe(true);
    await expectFocusOn(trigger);
  });
});

describe('keyboard contract: ConfirmDialog (destructive)', () => {
  function DeleteOrder({ onConfirm }: { onConfirm?: () => void }) {
    return (
      <>
        <button type="button">Before</button>
        <ConfirmDialog
          trigger={<Button variant="danger">Delete order</Button>}
          title="Delete order #1048?"
          description="The order and its 14 lines will be removed. This can't be undone."
          confirmLabel="Delete order"
          onConfirm={onConfirm ?? (() => undefined)}
        />
      </>
    );
  }

  it('initial focus is on Cancel, never on the destructive button', async () => {
    await renderWithProvider(<DeleteOrder />);
    await focusTrigger('Delete order');
    await press('{Enter}');
    await expect.poll(() => dialogs('alertdialog').length).toBe(1);
    await expectFocus('Cancel');
  });

  it('Enter on the Cancel that opened focused never confirms and closes with focus restored', async () => {
    const onConfirm = vi.fn();
    await renderWithProvider(<DeleteOrder onConfirm={onConfirm} />);
    const trigger = await focusTrigger('Delete order');
    await press('{Enter}');
    await expectFocus('Cancel');
    await press('{Enter}');
    await expect.poll(() => noDialog('alertdialog')).toBe(true);
    expect(onConfirm).not.toHaveBeenCalled();
    await expectFocusOn(trigger);
  });

  it('Tab from Cancel reaches the confirm button; Enter on it confirms and closes', async () => {
    const onConfirm = vi.fn();
    await renderWithProvider(<DeleteOrder onConfirm={onConfirm} />);
    await focusTrigger('Delete order');
    await press('{Enter}');
    await expectFocus('Cancel');
    await userEvent.tab();
    await expectFocus('Delete order');
    expect(focusIsWithin(topDialog('alertdialog'))).toBe(true);
    await press('{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await expect.poll(() => noDialog('alertdialog')).toBe(true);
  });

  it('traps focus between Cancel and the confirm button', async () => {
    await renderWithProvider(<DeleteOrder />);
    await focusTrigger('Delete order');
    await press('{Enter}');
    await expectFocus('Cancel');
    for (let i = 0; i < 5; i += 1) {
      await userEvent.tab();
      expect(focusIsWithin(topDialog('alertdialog'))).toBe(true);
    }
  });

  it('Escape cancels without confirming and restores focus to the trigger', async () => {
    const onConfirm = vi.fn();
    await renderWithProvider(<DeleteOrder onConfirm={onConfirm} />);
    const trigger = await focusTrigger('Delete order');
    await press('{Enter}');
    await expectFocus('Cancel');
    await press('{Escape}');
    await expect.poll(() => noDialog('alertdialog')).toBe(true);
    expect(onConfirm).not.toHaveBeenCalled();
    await expectFocusOn(trigger);
  });
});

describe('keyboard contract: sheet', () => {
  function OrderSheet() {
    return (
      <>
        <button type="button">Before</button>
        <Sheet
          trigger={<Button>View order</Button>}
          title="Order"
          footer={({ close }) => <Button onPress={close}>Close order</Button>}
        >
          <p>Order details</p>
        </Sheet>
      </>
    );
  }

  it('opens from the keyboard, traps focus, and Escape restores focus to the trigger', async () => {
    await renderWithProvider(<OrderSheet />);
    const trigger = await focusTrigger('View order');
    await press('{Enter}');
    await expect.poll(() => dialogs().length).toBe(1);
    await expect.poll(() => focusIsWithin(topDialog())).toBe(true);
    for (let i = 0; i < 6; i += 1) {
      await userEvent.tab();
      expect(focusIsWithin(topDialog())).toBe(true);
    }
    await press('{Escape}');
    await expect.poll(() => noDialog()).toBe(true);
    await expectFocusOn(trigger);
  });
});

describe('keyboard contract: nested layers', () => {
  function SheetWithDialog() {
    return (
      <Sheet
        defaultOpen
        title="Order"
        footerStart={
          <Dialog
            trigger={<Button variant="danger">Remove lines</Button>}
            title="Remove lines?"
            footer={({ close }) => <Button onPress={close}>Keep lines</Button>}
          />
        }
      >
        <p>Order details</p>
      </Sheet>
    );
  }

  it('Escape closes only the top layer: the inner Dialog, then the Sheet', async () => {
    await renderWithProvider(<SheetWithDialog />);
    await expect.poll(() => dialogs().length).toBe(1);
    const trigger = [...document.querySelectorAll<HTMLElement>('button')].find(
      (b) => b.textContent.trim() === 'Remove lines',
    );
    if (!trigger) throw new Error('Inner trigger not found.');
    trigger.focus();
    await expectFocusOn(trigger);
    await press('{Enter}');
    await expect.poll(() => dialogs().length).toBe(2);
    await expect.poll(() => focusIsWithin(topDialog())).toBe(true);

    await press('{Escape}');
    await expect.poll(() => dialogs().length).toBe(1);
    // Focus returns to the control that opened the inner layer, inside the sheet.
    await expectFocusOn(trigger);

    await press('{Escape}');
    await expect.poll(() => noDialog()).toBe(true);
  });

  it('focus stays trapped in the inner Dialog while two layers are open', async () => {
    await renderWithProvider(<SheetWithDialog />);
    const trigger = [...document.querySelectorAll<HTMLElement>('button')].find(
      (b) => b.textContent.trim() === 'Remove lines',
    );
    if (!trigger) throw new Error('Inner trigger not found.');
    trigger.focus();
    await press('{Enter}');
    await expect.poll(() => dialogs().length).toBe(2);
    const inner = topDialog();
    for (let i = 0; i < 5; i += 1) {
      await userEvent.tab();
      expect(focusIsWithin(inner)).toBe(true);
    }
  });
});

describe('keyboard contract: menu inside a dialog', () => {
  it('Escape closes the menu first, then the dialog; focus returns one layer at a time', async () => {
    await renderWithProvider(
      <Dialog
        defaultOpen
        title="Edit customer"
        footer={({ close }) => <Button onPress={close}>Cancel</Button>}
      >
        <Menu trigger={<Button>More</Button>}>
          <MenuItem id="archive">Archive customer</MenuItem>
        </Menu>
      </Dialog>,
    );
    await expect.poll(() => dialogs().length).toBe(1);
    const more = [...document.querySelectorAll<HTMLElement>('button')].find(
      (b) => b.textContent.trim() === 'More',
    );
    if (!more) throw new Error('Menu trigger not found.');
    more.focus();
    await press('{Enter}');
    await expectFocus('Archive customer');
    await press('{Escape}');
    await expect.poll(() => document.querySelectorAll('[role="menu"]').length).toBe(0);
    expect(dialogs()).toHaveLength(1);
    await expectFocusOn(more);
    await press('{Escape}');
    await expect.poll(() => noDialog()).toBe(true);
  });
});

describe('keyboard contract: drawer', () => {
  function Page() {
    const [open, setOpen] = useState(false);
    return (
      <main>
        <Button
          onPress={() => {
            setOpen(true);
          }}
        >
          Open filters
        </Button>
        <Drawer title="Filters" isOpen={open} onOpenChange={setOpen}>
          <Input label="Customer" />
        </Drawer>
      </main>
    );
  }

  it('Escape from inside the drawer closes it and returns focus to the trigger', async () => {
    await renderWithProvider(<Page />);
    const trigger = await (async () => {
      await userEvent.tab();
      await expectFocus('Open filters');
      return document.activeElement as HTMLElement;
    })();
    await press('{Enter}');
    await expect.poll(() => document.querySelector('aside') !== null).toBe(true);
    await expect.poll(() => focusIsWithin(document.querySelector('aside'))).toBe(true);
    await press('{Escape}');
    await expect.poll(() => document.querySelector('aside') === null).toBe(true);
    await expectFocusOn(trigger);
  });
});
