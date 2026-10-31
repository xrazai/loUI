import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Menu, MenuItem, MenuSection, MenuSeparator, MoreActionsMenu, SubMenu } from './Menu';

const closed = () => document.querySelector('[role="menu"]') === null;

function RowMenu(props: { onAction?: (key: string) => void; defaultOpen?: boolean }) {
  const { onAction = () => undefined, defaultOpen } = props;
  return (
    <main>
      <Menu
        trigger={<Button>Actions</Button>}
        onAction={(key) => {
          onAction(String(key));
        }}
        {...(defaultOpen ? { defaultOpen } : {})}
      >
        <MenuItem id="edit" shortcut="Ctrl+E">
          Edit order
        </MenuItem>
        <MenuItem id="duplicate">Duplicate order</MenuItem>
        <MenuItem id="archive" isDisabled>
          Archive order
        </MenuItem>
        <MenuSeparator />
        <MenuItem id="delete" tone="danger">
          Delete order
        </MenuItem>
      </Menu>
    </main>
  );
}

describe('Menu', () => {
  it('opens from the trigger with menu semantics and names the menu after the trigger', async () => {
    const screen = await renderWithProvider(<RowMenu />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger.element().getAttribute('aria-haspopup')).toBe('true');
    expect(trigger.element().getAttribute('aria-expanded')).toBe('false');
    await trigger.click();
    const menu = screen.getByRole('menu', { name: 'Actions' });
    await expect.element(menu).toBeVisible();
    expect(trigger.element().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('menuitem').elements()).toHaveLength(4);
  });

  it.each([['{Enter}'], [' '], ['{ArrowDown}']])(
    'opens with %j and focuses the first item',
    async (key) => {
      const screen = await renderWithProvider(<RowMenu />);
      await userEvent.tab();
      await userEvent.keyboard(key);
      await expect.element(screen.getByRole('menuitem', { name: /Edit order/ })).toHaveFocus();
    },
  );

  it('opens with ArrowUp and focuses the last enabled item', async () => {
    const screen = await renderWithProvider(<RowMenu />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(screen.getByRole('menuitem', { name: 'Delete order' })).toHaveFocus();
  });

  it('moves with arrows, Home, End and typeahead, skipping disabled items', async () => {
    const screen = await renderWithProvider(<RowMenu />);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('menuitem', { name: 'Duplicate order' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('menuitem', { name: 'Delete order' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(screen.getByRole('menuitem', { name: /Edit order/ })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect.element(screen.getByRole('menuitem', { name: 'Delete order' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await userEvent.keyboard('dup');
    await expect.element(screen.getByRole('menuitem', { name: 'Duplicate order' })).toHaveFocus();
  });

  it('activates the focused item with Enter and with Space, closes and restores focus', async () => {
    const onAction = vi.fn();
    const screen = await renderWithProvider(<RowMenu onAction={onAction} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Enter}');
    expect(onAction).toHaveBeenLastCalledWith('edit');
    await expect.poll(closed).toBe(true);
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard(' ');
    expect(onAction).toHaveBeenLastCalledWith('duplicate');
    await expect.poll(closed).toBe(true);
  });

  it('activates an item with a click', async () => {
    const onAction = vi.fn();
    const screen = await renderWithProvider(<RowMenu onAction={onAction} />);
    await screen.getByRole('button', { name: 'Actions' }).click();
    await screen.getByRole('menuitem', { name: 'Delete order' }).click();
    expect(onAction).toHaveBeenCalledWith('delete');
    await expect.poll(closed).toBe(true);
  });

  it('closes with Escape and restores focus to the trigger', async () => {
    const screen = await renderWithProvider(<RowMenu />);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(closed).toBe(true);
    await expect.element(screen.getByRole('button', { name: 'Actions' })).toHaveFocus();
  });

  it('does not activate a disabled item and marks it disabled', async () => {
    const onAction = vi.fn();
    const screen = await renderWithProvider(<RowMenu onAction={onAction} />);
    await screen.getByRole('button', { name: 'Actions' }).click();
    const disabled = screen.getByRole('menuitem', { name: 'Archive order' });
    expect(disabled.element().getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(disabled, { force: true });
    expect(onAction).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('menu')).toBeVisible();
  });

  it('shows the shortcut hint in mono type and tints the danger item', async () => {
    const screen = await renderWithProvider(<RowMenu defaultOpen />);
    const hint = screen.getByText('Ctrl+E').element();
    expect(getComputedStyle(hint).fontFamily).toContain('Geist Mono');
    const danger = screen.getByRole('menuitem', { name: 'Delete order' }).element();
    const neutral = screen.getByRole('menuitem', { name: 'Duplicate order' }).element();
    expect(getComputedStyle(danger).color).not.toBe(getComputedStyle(neutral).color);
    expect(danger.getAttribute('data-tone')).toBe('danger');
  });

  it('gives items the item height token', async () => {
    const screen = await renderWithProvider(<RowMenu defaultOpen />);
    const item = screen.getByRole('menuitem', { name: 'Duplicate order' }).element();
    expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(36);
  });

  it('uses the popover layer', async () => {
    await renderWithProvider(<RowMenu defaultOpen />);
    const popover = document.querySelector<HTMLElement>('[data-trigger="MenuTrigger"]');
    expect(popover && getComputedStyle(popover).zIndex).toBe('55');
  });

  it('is controlled through isOpen and reports changes', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <Menu
          trigger={<Button>Actions</Button>}
          isOpen={open}
          onOpenChange={(value) => {
            onOpenChange(value);
            setOpen(value);
          }}
        >
          <MenuItem id="edit">Edit order</MenuItem>
        </Menu>
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await expect.element(screen.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.poll(closed).toBe(true);
  });

  describe('selection', () => {
    it('makes checkbox items with selectionMode multiple', async () => {
      const onSelectionChange = vi.fn();
      const screen = await renderWithProvider(
        <Menu
          trigger={<Button>View</Button>}
          selectionMode="multiple"
          defaultSelectedKeys={['id']}
          onSelectionChange={onSelectionChange}
        >
          <MenuItem id="id">Show ID</MenuItem>
          <MenuItem id="status">Show status</MenuItem>
        </Menu>,
      );
      await screen.getByRole('button', { name: 'View' }).click();
      const showId = screen.getByRole('menuitemcheckbox', { name: 'Show ID' });
      const showStatus = screen.getByRole('menuitemcheckbox', { name: 'Show status' });
      expect(showId.element().getAttribute('aria-checked')).toBe('true');
      expect(showStatus.element().getAttribute('aria-checked')).toBe('false');
      await showStatus.click();
      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('makes radio items with selectionMode single', async () => {
      const screen = await renderWithProvider(
        <Menu trigger={<Button>Sort</Button>} selectionMode="single" defaultSelectedKeys={['new']}>
          <MenuItem id="new">Newest first</MenuItem>
          <MenuItem id="old">Oldest first</MenuItem>
        </Menu>,
      );
      await screen.getByRole('button', { name: 'Sort' }).click();
      expect(
        screen
          .getByRole('menuitemradio', { name: 'Newest first' })
          .element()
          .getAttribute('aria-checked'),
      ).toBe('true');
      await screen.getByRole('menuitemradio', { name: 'Oldest first' }).click();
    });

    it('lets one section be a radio group inside a menu of plain commands', async () => {
      const screen = await renderWithProvider(
        <Menu trigger={<Button>Options</Button>}>
          <MenuItem id="export">Export</MenuItem>
          <MenuSection title="Density" selectionMode="single" defaultSelectedKeys={['comfortable']}>
            <MenuItem id="comfortable">Comfortable</MenuItem>
            <MenuItem id="compact">Compact</MenuItem>
          </MenuSection>
        </Menu>,
      );
      await screen.getByRole('button', { name: 'Options' }).click();
      expect(screen.getByRole('menuitem', { name: 'Export' }).element()).toBeTruthy();
      expect(screen.getByRole('menuitemradio').elements()).toHaveLength(2);
      expect(screen.getByRole('group', { name: 'Density' }).element()).toBeTruthy();
    });
  });

  describe('SubMenu', () => {
    function Nested() {
      return (
        <Menu trigger={<Button>Actions</Button>}>
          <MenuItem id="edit">Edit order</MenuItem>
          <SubMenu label="Move to…" textValue="Move to">
            <MenuItem id="ready">Ready</MenuItem>
            <MenuItem id="shipped">Shipped</MenuItem>
          </SubMenu>
        </Menu>
      );
    }

    it('opens with ArrowRight, closes with ArrowLeft and Escape closes one level at a time', async () => {
      const screen = await renderWithProvider(<Nested />);
      await userEvent.tab();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('{ArrowDown}');
      const parent = screen.getByRole('menuitem', { name: 'Move to…' });
      expect(parent.element().getAttribute('aria-haspopup')).toBe('menu');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('menuitem', { name: 'Ready' })).toHaveFocus();
      await userEvent.keyboard('{ArrowLeft}');
      await expect.element(parent).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('menuitem', { name: 'Ready' })).toHaveFocus();
      await userEvent.keyboard('{Escape}');
      await expect.element(parent).toHaveFocus();
      await expect.poll(() => screen.getByRole('menu').elements().length).toBe(1);
    });
  });

  describe('MoreActionsMenu', () => {
    it('names the ellipsis trigger from messages and opens the menu', async () => {
      const screen = await renderWithProvider(
        <MoreActionsMenu>
          <MenuItem id="edit">Edit order</MenuItem>
        </MoreActionsMenu>,
      );
      const trigger = screen.getByRole('button', { name: 'More actions' });
      await trigger.click();
      await expect.element(screen.getByRole('menu', { name: 'More actions' })).toBeVisible();
    });

    it('uses the pt-BR catalog, a provider override and an instance override', async () => {
      const pt = await renderWithProvider(
        <MoreActionsMenu>
          <MenuItem id="edit">Editar pedido</MenuItem>
        </MoreActionsMenu>,
        { locale: 'pt-BR' },
      );
      await expect.element(pt.getByRole('button', { name: 'Mais ações' })).toBeVisible();
      await pt.unmount();
      const provider = await renderWithProvider(
        <MoreActionsMenu>
          <MenuItem id="edit">Edit</MenuItem>
        </MoreActionsMenu>,
        { messages: { Menu: { moreActions: 'Row actions' } } },
      );
      await expect.element(provider.getByRole('button', { name: 'Row actions' })).toBeVisible();
      await provider.unmount();
      const instance = await renderWithProvider(
        <MoreActionsMenu messages={{ moreActions: 'Order actions' }}>
          <MenuItem id="edit">Edit</MenuItem>
        </MoreActionsMenu>,
      );
      await expect.element(instance.getByRole('button', { name: 'Order actions' })).toBeVisible();
    });
  });

  it('has no axe violations with the menu open', async () => {
    const screen = await renderWithProvider(<RowMenu />);
    await screen.getByRole('button', { name: 'Actions' }).click();
    await expect.element(screen.getByRole('menu')).toBeVisible();
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
  });

  it('has no axe violations with selectable items and a section open', async () => {
    const screen = await renderWithProvider(
      <main>
        <Menu trigger={<Button>Options</Button>}>
          <MenuItem id="export">Export</MenuItem>
          <MenuSection title="Density" selectionMode="single" defaultSelectedKeys={['compact']}>
            <MenuItem id="comfortable">Comfortable</MenuItem>
            <MenuItem id="compact">Compact</MenuItem>
          </MenuSection>
        </Menu>
      </main>,
    );
    await screen.getByRole('button', { name: 'Options' }).click();
    await expect.element(screen.getByRole('menu')).toBeVisible();
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
  });
});
