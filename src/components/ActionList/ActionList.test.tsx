import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ActionList } from './ActionList';
import { createDocuments } from './ActionList.fixtures';

const items = createDocuments();

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
      await expectNoA11yViolations(document.body);
    });
  });
});
