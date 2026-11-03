/**
 * Keyboard contract: Menu (including SubMenu and MoreActionsMenu).
 * Spec: AGENTS.md section 8, row "Menu": trigger Enter/Space/ArrowDown opens and focuses the first
 * item; up/down, Home/End, typeahead; Enter/Space activates; Esc closes and restores focus (TEST-004).
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Button } from '../../components/Button';
import { Menu, MenuItem, MenuSeparator, MoreActionsMenu, SubMenu } from '../../components/Menu';
import { renderWithProvider } from '../render';
import { expectFocus, press, tabOrder } from './contract';

const menuCount = () => document.querySelectorAll('[role="menu"]').length;

function Example({ onAction }: { onAction?: (key: string) => void }) {
  return (
    <>
      <button type="button">Before</button>
      <Menu
        trigger={<Button>Actions</Button>}
        onAction={(key) => {
          onAction?.(String(key));
        }}
      >
        <MenuItem id="edit">Edit order</MenuItem>
        <MenuItem id="duplicate">Duplicate order</MenuItem>
        <MenuItem id="archive" isDisabled>
          Archive order
        </MenuItem>
        <MenuSeparator />
        <MenuItem id="delete" tone="danger">
          Delete order
        </MenuItem>
      </Menu>
      <button type="button">After</button>
    </>
  );
}

async function focusTrigger() {
  await userEvent.tab();
  await userEvent.tab();
  await expectFocus('Actions');
}

async function openMenu(onAction?: (key: string) => void) {
  await renderWithProvider(<Example {...(onAction ? { onAction } : {})} />);
  await focusTrigger();
  await press('{Enter}');
  await expectFocus('Edit order');
}

describe('keyboard contract: menu trigger', () => {
  it.each([['{Enter}'], [' '], ['{ArrowDown}']])(
    '%j on the trigger opens the menu and focuses the first item',
    async (key) => {
      await renderWithProvider(<Example />);
      await focusTrigger();
      await press(key);
      await expectFocus('Edit order');
      expect(menuCount()).toBe(1);
    },
  );

  it('ArrowUp on the trigger opens the menu and focuses the last item', async () => {
    await renderWithProvider(<Example />);
    await focusTrigger();
    await press('{ArrowUp}');
    await expectFocus('Delete order');
  });

  it('the trigger is one Tab stop', async () => {
    await renderWithProvider(<Example />);
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual(['Actions', 'After']);
  });
});

describe('keyboard contract: menu items', () => {
  it('Up/Down move through items and skip disabled ones', async () => {
    await openMenu();
    await press('{ArrowDown}');
    await expectFocus('Duplicate order');
    await press('{ArrowDown}');
    await expectFocus('Delete order');
    await press('{ArrowUp}');
    await expectFocus('Duplicate order');
  });

  it('Up on the first item wraps to the last and Down on the last wraps to the first', async () => {
    await openMenu();
    await press('{ArrowUp}');
    await expectFocus('Delete order');
    await press('{ArrowDown}');
    await expectFocus('Edit order');
  });

  it('Home and End jump to the first and last enabled item', async () => {
    await openMenu();
    await press('{End}');
    await expectFocus('Delete order');
    await press('{Home}');
    await expectFocus('Edit order');
  });

  it('typeahead focuses the item that starts with the typed text', async () => {
    await openMenu();
    await press('dup');
    await expectFocus('Duplicate order');
  });

  it('typeahead reaches items past a separator', async () => {
    await openMenu();
    await press('del');
    await expectFocus('Delete order');
  });

  it('Enter activates the focused item, closes the menu and restores focus to the trigger', async () => {
    const onAction = vi.fn();
    await openMenu(onAction);
    await press('{Enter}');
    expect(onAction).toHaveBeenLastCalledWith('edit');
    await expect.poll(menuCount).toBe(0);
    await expectFocus('Actions');
  });

  it('Space activates the focused item and restores focus to the trigger', async () => {
    const onAction = vi.fn();
    await openMenu(onAction);
    await press('{ArrowDown} ');
    expect(onAction).toHaveBeenLastCalledWith('duplicate');
    await expect.poll(menuCount).toBe(0);
    await expectFocus('Actions');
  });

  it('Escape closes the menu without activating anything and restores focus to the trigger', async () => {
    const onAction = vi.fn();
    await openMenu(onAction);
    await press('{Escape}');
    await expect.poll(menuCount).toBe(0);
    await expectFocus('Actions');
    expect(onAction).not.toHaveBeenCalled();
  });

  it('a disabled item is not reachable by typeahead', async () => {
    await openMenu();
    await press('arch');
    expect(document.activeElement?.textContent).not.toBe('Archive order');
  });
});

describe('keyboard contract: submenu', () => {
  function Nested() {
    return (
      <>
        <Menu trigger={<Button>Actions</Button>}>
          <MenuItem id="edit">Edit order</MenuItem>
          <SubMenu label="Move to…" textValue="Move to">
            <MenuItem id="ready">Ready</MenuItem>
            <MenuItem id="shipped">Shipped</MenuItem>
          </SubMenu>
        </Menu>
      </>
    );
  }

  it('Right opens the submenu on its first item, Left closes it back to the parent item', async () => {
    await renderWithProvider(<Nested />);
    await userEvent.tab();
    await press('{Enter}{ArrowDown}');
    await expectFocus('Move to…');
    await press('{ArrowRight}');
    await expectFocus('Ready');
    expect(menuCount()).toBe(2);
    await press('{ArrowLeft}');
    await expectFocus('Move to…');
    await expect.poll(menuCount).toBe(1);
  });

  it('Escape closes only the top level: submenu first, then the menu, then focus returns to the trigger', async () => {
    await renderWithProvider(<Nested />);
    await userEvent.tab();
    await press('{Enter}{ArrowDown}{ArrowRight}');
    await expectFocus('Ready');
    await press('{Escape}');
    await expectFocus('Move to…');
    await expect.poll(menuCount).toBe(1);
    await press('{Escape}');
    await expect.poll(menuCount).toBe(0);
    await expectFocus('Actions');
  });

  it('Enter on a submenu item activates it and closes the whole tree', async () => {
    await renderWithProvider(<Nested />);
    await userEvent.tab();
    await press('{Enter}{ArrowDown}{ArrowRight}{ArrowDown}');
    await expectFocus('Shipped');
    await press('{Enter}');
    await expect.poll(menuCount).toBe(0);
    await expectFocus('Actions');
  });
});

describe('keyboard contract: MoreActionsMenu', () => {
  it('opens from the keyboard and closes with Escape restoring focus', async () => {
    await renderWithProvider(
      <MoreActionsMenu>
        <MenuItem id="edit">Edit order</MenuItem>
        <MenuItem id="delete">Delete order</MenuItem>
      </MoreActionsMenu>,
    );
    await userEvent.tab();
    const trigger = document.activeElement;
    await press('{Enter}');
    await expectFocus('Edit order');
    await press('{Escape}');
    await expect.poll(menuCount).toBe(0);
    await expect.poll(() => document.activeElement === trigger).toBe(true);
  });
});
