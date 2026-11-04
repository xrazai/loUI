import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ActionList } from './ActionList';
import { createDocuments } from './ActionList.fixtures';

const items = createDocuments();

/** The checkbox input is visually hidden: click the label that wraps it, like a pointer user. */
function checkboxLabel(screen: Awaited<ReturnType<typeof renderWithProvider>>, name: string) {
  const input = screen.getByRole('checkbox', { name }).element();
  return input.closest('label') as HTMLLabelElement;
}

describe('ActionList', () => {
  describe('structure', () => {
    it('renders a named grid of rows with title, description and meta', async () => {
      const screen = await renderWithProvider(<ActionList items={items} aria-label="Files" />);
      await expect.element(screen.getByRole('grid', { name: 'Files' })).toBeVisible();
      expect(screen.getByRole('row').elements()).toHaveLength(3);
      await expect.element(screen.getByText('Price list 2026')).toBeVisible();
      await expect.element(screen.getByText('Updated by Bruno')).toBeVisible();
      await expect.element(screen.getByText('2.4 MB')).toBeVisible();
    });

    it('keeps the order given and does not sort', async () => {
      const unsorted = [items[2], items[0]].filter((item) => item !== undefined);
      const screen = await renderWithProvider(<ActionList items={unsorted} aria-label="Files" />);
      const rows = screen.getByRole('row').elements();
      expect(rows[0]?.textContent).toContain('Supplier notes');
    });

    it('names the list with aria-labelledby', async () => {
      const screen = await renderWithProvider(
        <div>
          <h2 id="files-title">Recent files</h2>
          <ActionList items={items} aria-labelledby="files-title" />
        </div>,
      );
      await expect.element(screen.getByRole('grid', { name: 'Recent files' })).toBeVisible();
    });

    it('draws the border only when bordered', async () => {
      const bordered = await renderWithProvider(<ActionList items={items} aria-label="Files" />);
      expect(bordered.container.querySelector('[data-bordered]')).not.toBeNull();
      await bordered.unmount();
      const plain = await renderWithProvider(
        <ActionList items={items} aria-label="Files" bordered={false} />,
      );
      expect(plain.container.querySelector('[data-bordered]')).toBeNull();
    });

    it('has rows at least as tall as the row token', async () => {
      const screen = await renderWithProvider(<ActionList items={items} aria-label="Files" />);
      const rect = screen.getByRole('row').first().element().getBoundingClientRect();
      expect(rect.height).toBeGreaterThanOrEqual(52);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <ActionList ref={ref} items={items} aria-label="Files" className="extra" data-testid="l" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('l');
    });
  });

  describe('keyboard', () => {
    it('is one tab stop; the arrow keys, Home and End move between rows', async () => {
      const screen = await renderWithProvider(
        <>
          <button type="button">Before</button>
          <ActionList items={items} aria-label="Files" />
          <button type="button">After</button>
        </>,
      );
      await userEvent.keyboard('{Tab}{Tab}');
      const rows = screen.getByRole('row').elements();
      expect(document.activeElement).toBe(rows[0]);
      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(rows[1]);
      await userEvent.keyboard('{End}');
      expect(document.activeElement).toBe(rows[2]);
      await userEvent.keyboard('{Home}');
      expect(document.activeElement).toBe(rows[0]);
      await userEvent.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(rows[0]);
    });

    it('reaches the menu button of the row with the right arrow', async () => {
      const screen = await renderWithProvider(
        <>
          <ActionList items={items} aria-label="Files" />
          <button type="button">After</button>
        </>,
      );
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{ArrowRight}');
      await expect
        .element(
          screen.getByRole('button', { name: 'More actions for Contract with Alfa Confecções' }),
        )
        .toHaveFocus();
    });

    it('skips disabled rows', async () => {
      const disabled = items.map((item, index) =>
        index === 1 ? { ...item, isDisabled: true } : item,
      );
      const screen = await renderWithProvider(<ActionList items={disabled} aria-label="Files" />);
      await userEvent.keyboard('{Tab}{ArrowDown}');
      expect(document.activeElement).toBe(screen.getByRole('row').elements()[2]);
    });
  });

  describe('actions', () => {
    it('calls onAction with the item on click and on Enter', async () => {
      const onAction = vi.fn();
      const screen = await renderWithProvider(
        <ActionList items={items} aria-label="Files" onAction={onAction} />,
      );
      await userEvent.click(screen.getByText('Price list 2026'));
      expect(onAction).toHaveBeenLastCalledWith(items[1]);
      screen.getByRole('row').first().element().focus();
      await userEvent.keyboard('{Enter}');
      expect(onAction).toHaveBeenLastCalledWith(items[0]);
    });

    it('opens the row menu without triggering the row action, and runs a menu item', async () => {
      const onAction = vi.fn();
      const onDownload = vi.fn();
      const documents = createDocuments({ onDownload });
      const screen = await renderWithProvider(
        <ActionList items={documents} aria-label="Files" onAction={onAction} />,
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'More actions for Price list 2026' }),
      );
      expect(onAction).not.toHaveBeenCalled();
      await expect.element(screen.getByRole('menu')).toBeVisible();
      await userEvent.click(screen.getByRole('menuitem', { name: 'Download file' }));
      expect(onDownload).toHaveBeenCalledWith('price-list');
      expect(onAction).not.toHaveBeenCalled();
    });

    it('closes the menu with Escape and restores focus to the button', async () => {
      const screen = await renderWithProvider(<ActionList items={items} aria-label="Files" />);
      const button = screen.getByRole('button', {
        name: 'More actions for Contract with Alfa Confecções',
      });
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(button).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect.element(screen.getByRole('menu')).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await expect.element(button).toHaveFocus();
    });

    it('has no menu button for rows without actions', async () => {
      const screen = await renderWithProvider(<ActionList items={items} aria-label="Files" />);
      expect(screen.getByRole('button').elements()).toHaveLength(2);
    });
  });

  describe('selection (checkbox rows)', () => {
    it('renders a named checkbox per row and none by default', async () => {
      const plain = await renderWithProvider(<ActionList items={items} aria-label="Files" />);
      expect(plain.getByRole('checkbox').elements()).toHaveLength(0);
      await plain.unmount();
      const screen = await renderWithProvider(
        <ActionList items={items} aria-label="Files" selectionMode="multiple" />,
      );
      expect(screen.getByRole('checkbox').elements()).toHaveLength(3);
      await expect
        .element(screen.getByRole('checkbox', { name: 'Select Price list 2026' }))
        .toBeVisible();
    });

    it('toggles with Space and with a click, reporting the keys', async () => {
      const onSelectionChange = vi.fn();
      const screen = await renderWithProvider(
        <ActionList
          items={items}
          aria-label="Files"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        />,
      );
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard(' ');
      expect([...(onSelectionChange.mock.lastCall?.[0] as Set<string>)]).toEqual(['contract']);
      await userEvent.click(checkboxLabel(screen, 'Select Price list 2026'));
      expect([...(onSelectionChange.mock.lastCall?.[0] as Set<string>)]).toEqual([
        'contract',
        'price-list',
      ]);
    });

    it('supports defaultSelectedKeys and controlled selectedKeys', async () => {
      const screen = await renderWithProvider(
        <ActionList
          items={items}
          aria-label="Files"
          selectionMode="multiple"
          defaultSelectedKeys={['notes']}
        />,
      );
      const box = screen.getByRole('checkbox', { name: 'Select Supplier notes' }).element();
      expect((box as HTMLInputElement).checked).toBe(true);
      await screen.unmount();
      const controlled = await renderWithProvider(
        <ActionList
          items={items}
          aria-label="Files"
          selectionMode="multiple"
          selectedKeys={new Set(['contract'])}
        />,
      );
      const first = controlled.getByRole('checkbox', {
        name: 'Select Contract with Alfa Confecções',
      });
      expect((first.element() as HTMLInputElement).checked).toBe(true);
    });

    it('keeps Enter and click on the row for the action, with a checkbox and a menu', async () => {
      const onAction = vi.fn();
      const onSelectionChange = vi.fn();
      const screen = await renderWithProvider(
        <ActionList
          items={items}
          aria-label="Files"
          selectionMode="multiple"
          onAction={onAction}
          onSelectionChange={onSelectionChange}
        />,
      );
      await userEvent.click(screen.getByText('Price list 2026'));
      expect(onAction).toHaveBeenLastCalledWith(items[1]);
      expect(onSelectionChange).not.toHaveBeenCalled();
      await userEvent.click(checkboxLabel(screen, 'Select Price list 2026'));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      screen.getByRole('row').first().element().focus();
      await userEvent.keyboard('{Enter}');
      expect(onAction).toHaveBeenLastCalledWith(items[0]);
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it('still runs the row action on click while rows are selected', async () => {
      const onAction = vi.fn();
      const screen = await renderWithProvider(
        <ActionList
          items={items}
          aria-label="Files"
          selectionMode="multiple"
          defaultSelectedKeys={['contract']}
          onAction={onAction}
        />,
      );
      await userEvent.click(screen.getByText('Supplier notes'));
      expect(onAction).toHaveBeenLastCalledWith(items[2]);
      const first = screen.getByRole('checkbox', { name: 'Select Contract with Alfa Confecções' });
      expect((first.element() as HTMLInputElement).checked).toBe(true);
      const third = screen.getByRole('checkbox', { name: 'Select Supplier notes' });
      expect((third.element() as HTMLInputElement).checked).toBe(false);
    });

    it('moves focus to the clicked row, so the keyboard continues from there', async () => {
      const onAction = vi.fn();
      const screen = await renderWithProvider(
        <ActionList
          items={items}
          aria-label="Files"
          selectionMode="multiple"
          defaultSelectedKeys={['contract']}
          onAction={onAction}
        />,
      );
      await userEvent.click(screen.getByText('Price list 2026'));
      const rows = screen.getByRole('row').all();
      expect(rows[1]?.element().contains(document.activeElement)).toBe(true);
      await userEvent.keyboard('{ArrowDown}');
      expect(rows[2]?.element().contains(document.activeElement)).toBe(true);
      await userEvent.keyboard('{Enter}');
      expect(onAction).toHaveBeenLastCalledWith(items[2]);
    });

    it('focuses the clicked row when no row is selected, and the keyboard continues from it', async () => {
      const onAction = vi.fn();
      const screen = await renderWithProvider(
        <ActionList
          items={items}
          aria-label="Files"
          selectionMode="multiple"
          onAction={onAction}
        />,
      );
      await userEvent.click(screen.getByText('Price list 2026'));
      expect(onAction).toHaveBeenCalledTimes(1);
      const rows = screen.getByRole('row').all();
      expect(rows[1]?.element().contains(document.activeElement)).toBe(true);
      await userEvent.keyboard('{ArrowDown}');
      expect(rows[2]?.element().contains(document.activeElement)).toBe(true);
      await userEvent.keyboard('{ArrowUp}{ArrowUp}');
      expect(rows[0]?.element().contains(document.activeElement)).toBe(true);
    });

    it('shows the focus ring on the row that keyboard navigation reaches after a click', async () => {
      const screen = await renderWithProvider(
        <ActionList
          items={items}
          aria-label="Files"
          selectionMode="multiple"
          defaultSelectedKeys={['contract']}
          onAction={vi.fn()}
        />,
      );
      await userEvent.click(screen.getByText('Price list 2026'));
      await userEvent.keyboard('{ArrowDown}');
      const rows = screen.getByRole('row').all();
      expect(rows[2]?.element().hasAttribute('data-focus-visible')).toBe(true);
      expect(rows[1]?.element().hasAttribute('data-focus-visible')).toBe(false);
    });

    it('disables the checkbox of a disabled row', async () => {
      const disabled = items.map((item, index) =>
        index === 1 ? { ...item, isDisabled: true } : item,
      );
      const screen = await renderWithProvider(
        <ActionList items={disabled} aria-label="Files" selectionMode="multiple" />,
      );
      const box = screen.getByRole('checkbox', { name: 'Select Price list 2026' }).element();
      expect((box as HTMLInputElement).disabled).toBe(true);
    });

    it('translates the checkbox name to pt-BR', async () => {
      const screen = await renderWithProvider(
        <ActionList items={items} aria-label="Arquivos" selectionMode="multiple" />,
        { locale: 'pt-BR' },
      );
      await expect
        .element(screen.getByRole('checkbox', { name: 'Selecionar Price list 2026' }))
        .toBeVisible();
    });

    it('has no axe violations with checkboxes, actions and done rows', async () => {
      const rows = items.map((item, index) => (index === 0 ? { ...item, isDone: true } : item));
      const screen = await renderWithProvider(
        <ActionList
          items={rows}
          aria-label="Files"
          selectionMode="multiple"
          defaultSelectedKeys={['contract']}
          onAction={vi.fn()}
        />,
      );
      await expectNoA11yViolations(screen.container);
    });
  });

  describe('done rows', () => {
    it('strikes through the title and adds hidden "Done" text', async () => {
      const rows = items.map((item, index) => (index === 0 ? { ...item, isDone: true } : item));
      const screen = await renderWithProvider(<ActionList items={rows} aria-label="Files" />);
      const row = screen.getByRole('row').first().element();
      expect(row.textContent).toContain('Done');
      expect(screen.getByRole('row').nth(1).element().textContent).not.toContain('Done');
      const title = row.querySelector('[class*="title"]') as HTMLElement;
      expect(getComputedStyle(title).textDecorationLine).toBe('line-through');
    });

    it('translates the hidden text to pt-BR and accepts an override', async () => {
      const rows = items.map((item, index) => (index === 0 ? { ...item, isDone: true } : item));
      const pt = await renderWithProvider(<ActionList items={rows} aria-label="Arquivos" />, {
        locale: 'pt-BR',
      });
      expect(pt.getByRole('row').first().element().textContent).toContain('Concluído');
      await pt.unmount();
      const custom = await renderWithProvider(
        <ActionList items={rows} aria-label="Files" messages={{ done: 'Completed' }} />,
      );
      expect(custom.getByRole('row').first().element().textContent).toContain('Completed');
    });

    it('has no axe violations', async () => {
      const rows = items.map((item) => ({ ...item, isDone: true }));
      const screen = await renderWithProvider(<ActionList items={rows} aria-label="Files" />);
      await expectNoA11yViolations(screen.container);
    });
  });

  describe('empty state', () => {
    it('shows the default empty state', async () => {
      const screen = await renderWithProvider(<ActionList items={[]} aria-label="Files" />);
      await expect.element(screen.getByRole('heading', { name: 'No items found' })).toBeVisible();
    });

    it('shows a custom empty state', async () => {
      const screen = await renderWithProvider(
        <ActionList items={[]} aria-label="Files" emptyState={<p>No files yet</p>} />,
      );
      await expect.element(screen.getByText('No files yet')).toBeVisible();
    });
  });

  describe('messages and locale', () => {
    it('translates the menu button name and the empty state to pt-BR', async () => {
      const screen = await renderWithProvider(<ActionList items={items} aria-label="Arquivos" />, {
        locale: 'pt-BR',
      });
      await expect
        .element(screen.getByRole('button', { name: 'Mais ações para Price list 2026' }))
        .toBeVisible();
      await screen.unmount();
      const empty = await renderWithProvider(<ActionList items={[]} aria-label="Arquivos" />, {
        locale: 'pt-BR',
      });
      await expect
        .element(empty.getByRole('heading', { name: 'Nenhum item encontrado' }))
        .toBeVisible();
    });

    it('accepts provider and instance overrides', async () => {
      const provider = await renderWithProvider(<ActionList items={items} aria-label="Files" />, {
        messages: { ActionList: { moreActions: (title: string) => `Options for ${title}` } },
      });
      await expect
        .element(provider.getByRole('button', { name: 'Options for Price list 2026' }))
        .toBeVisible();
      await provider.unmount();
      const instance = await renderWithProvider(
        <ActionList
          items={items}
          aria-label="Files"
          messages={{ moreActions: (title: string) => `Menu of ${title}` }}
        />,
      );
      await expect
        .element(instance.getByRole('button', { name: 'Menu of Price list 2026' }))
        .toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations by default, with row actions and when empty', async () => {
      const screen = await renderWithProvider(
        <ActionList items={items} aria-label="Files" onAction={vi.fn()} />,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
      const empty = await renderWithProvider(<ActionList items={[]} aria-label="Files" />);
      await expectNoA11yViolations(empty.container);
    });

    it('has no axe violations with an open menu', async () => {
      const screen = await renderWithProvider(<ActionList items={items} aria-label="Files" />);
      await userEvent.click(
        screen.getByRole('button', { name: 'More actions for Price list 2026' }),
      );
      await expect.element(screen.getByRole('menu')).toBeVisible();
      // Axe computes contrast from the rendered colors; wait for the open animation to end.
      await expect.poll(() => document.getAnimations().length).toBe(0);
      await expectNoA11yViolations(document.body);
    });
  });
});
