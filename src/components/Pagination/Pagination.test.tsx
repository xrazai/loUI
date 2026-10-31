import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  describe('structure', () => {
    it('is a named navigation with a list of buttons', async () => {
      const screen = await renderWithProvider(<Pagination pageCount={10} />);
      await expect.element(screen.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Previous page' })).toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Next page' })).toBeVisible();
    });

    it('marks only the current page with aria-current="page"', async () => {
      const screen = await renderWithProvider(<Pagination pageCount={10} defaultPage={5} />);
      const current = screen.container.querySelectorAll('[aria-current="page"]');
      expect(current).toHaveLength(1);
      expect(current[0]?.getAttribute('aria-label')).toBe('Page 5');
      expect(current[0]?.textContent).toBe('5');
    });

    it('collapses a long list with hidden ellipses', async () => {
      const screen = await renderWithProvider(<Pagination pageCount={100} defaultPage={50} />);
      const names = screen
        .getByRole('button')
        .elements()
        .map((button) => button.getAttribute('aria-label'));
      expect(names).toEqual([
        'Previous page',
        'Page 1',
        'Page 49',
        'Page 50',
        'Page 51',
        'Page 100',
        'Next page',
      ]);
      const ellipses = screen.container.querySelectorAll('li[aria-hidden="true"]');
      expect(ellipses).toHaveLength(2);
    });

    it('clamps the current page into range', async () => {
      const screen = await renderWithProvider(<Pagination pageCount={3} page={9} />);
      expect(
        screen.container.querySelector('[aria-current="page"]')?.getAttribute('aria-label'),
      ).toBe('Page 3');
    });

    it('keeps the page buttons at the 32px control size', async () => {
      const screen = await renderWithProvider(<Pagination pageCount={3} />);
      const rect = screen.getByRole('button', { name: 'Page 1' }).element().getBoundingClientRect();
      expect(rect.height).toBe(32);
      expect(rect.width).toBeGreaterThanOrEqual(32);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <Pagination ref={ref} pageCount={3} className="extra" data-testid="p" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('p');
    });
  });

  describe('summary text', () => {
    it('shows the item range when total and pageSize are given', async () => {
      const screen = await renderWithProvider(<Pagination total={42} pageSize={10} />);
      expect(screen.getByRole('status').element().textContent).toBe('1–10 of 42');
    });

    it('derives the page count from total and pageSize', async () => {
      const screen = await renderWithProvider(<Pagination total={42} pageSize={10} />);
      await expect.element(screen.getByRole('button', { name: 'Page 5' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Page 6' }).elements()).toHaveLength(0);
    });

    it('clips the last range to the total', async () => {
      const screen = await renderWithProvider(
        <Pagination total={42} pageSize={10} defaultPage={5} />,
      );
      expect(screen.getByRole('status').element().textContent).toBe('41–42 of 42');
    });

    it('says there are no results for an empty list', async () => {
      const screen = await renderWithProvider(<Pagination total={0} pageSize={10} />);
      expect(screen.getByRole('status').element().textContent).toBe('No results');
    });

    it('shows "Page n of m" when only the page count is known', async () => {
      const screen = await renderWithProvider(<Pagination pageCount={8} defaultPage={3} />);
      expect(screen.getByRole('status').element().textContent).toBe('Page 3 of 8');
    });

    it('announces the new range politely when the page changes', async () => {
      const screen = await renderWithProvider(<Pagination total={42} pageSize={10} />);
      const status = screen.getByRole('status').element();
      expect(status.getAttribute('aria-live')).toBe('polite');
      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      expect(screen.getByRole('status').element()).toBe(status);
      expect(status.textContent).toBe('11–20 of 42');
    });
  });

  describe('interaction', () => {
    it('goes to the pressed page and to the previous and next pages', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Pagination pageCount={10} onChange={onChange} />);
      await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
      expect(onChange).toHaveBeenLastCalledWith(2);
      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      expect(onChange).toHaveBeenLastCalledWith(3);
      await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
      expect(onChange).toHaveBeenLastCalledWith(2);
    });

    it('does not call onChange for the page that is already current', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Pagination pageCount={10} onChange={onChange} />);
      await userEvent.click(screen.getByRole('button', { name: 'Page 1' }));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables previous on the first page and next on the last', async () => {
      const first = await renderWithProvider(<Pagination pageCount={3} />);
      await expect.element(first.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      await expect.element(first.getByRole('button', { name: 'Next page' })).toBeEnabled();
      await first.unmount();
      const last = await renderWithProvider(<Pagination pageCount={3} defaultPage={3} />);
      await expect.element(last.getByRole('button', { name: 'Next page' })).toBeDisabled();
    });

    it('moves focus to the current page when the pressed button becomes disabled', async () => {
      const screen = await renderWithProvider(<Pagination pageCount={3} defaultPage={2} />);
      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      await expect.element(screen.getByRole('button', { name: 'Page 3' })).toHaveFocus();
      await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
      await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
      await expect.element(screen.getByRole('button', { name: 'Page 1' })).toHaveFocus();
    });

    it('is operated from the keyboard', async () => {
      const screen = await renderWithProvider(<Pagination pageCount={5} defaultPage={2} />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Previous page' })).toHaveFocus();
      await userEvent.keyboard('{Tab}{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Page 2' })).toHaveFocus();
      await userEvent.keyboard('{Tab}{Enter}');
      expect(screen.container.querySelector('[aria-current="page"]')?.textContent).toBe('3');
      await userEvent.keyboard(' ');
      expect(screen.container.querySelector('[aria-current="page"]')?.textContent).toBe('3');
    });
  });

  describe('controlled and uncontrolled', () => {
    it('stays put when controlled and the parent does not update', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Pagination pageCount={5} page={1} onChange={onChange} />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
      expect(onChange).toHaveBeenCalledWith(3);
      expect(screen.container.querySelector('[aria-current="page"]')?.textContent).toBe('1');
    });

    it('follows a state owned by the parent', async () => {
      function Parent() {
        const [page, setPage] = useState(1);
        return <Pagination pageCount={5} page={page} onChange={setPage} />;
      }
      const screen = await renderWithProvider(<Parent />);
      await userEvent.click(screen.getByRole('button', { name: 'Page 4' }));
      expect(screen.container.querySelector('[aria-current="page"]')?.textContent).toBe('4');
    });
  });

  describe('messages and locale', () => {
    it('translates labels, summary and numbers to pt-BR', async () => {
      const screen = await renderWithProvider(
        <Pagination total={1248} pageSize={10} defaultPage={3} />,
        { locale: 'pt-BR' },
      );
      await expect.element(screen.getByRole('navigation', { name: 'Paginação' })).toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Página anterior' })).toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Próxima página' })).toBeVisible();
      expect(screen.getByRole('status').element().textContent).toBe('21–30 de 1.248');
    });

    it('accepts provider and instance overrides', async () => {
      const provider = await renderWithProvider(<Pagination pageCount={3} />, {
        messages: { Pagination: { next: 'Go forward' } },
      });
      await expect.element(provider.getByRole('button', { name: 'Go forward' })).toBeVisible();
      await provider.unmount();

      const instance = await renderWithProvider(
        <Pagination pageCount={3} messages={{ next: 'Onward' }} />,
        { messages: { Pagination: { next: 'Go forward' } } },
      );
      await expect.element(instance.getByRole('button', { name: 'Onward' })).toBeVisible();
    });

    it('flips the previous and next chevrons in right-to-left locales', async () => {
      const ltr = await renderWithProvider(<Pagination pageCount={3} defaultPage={2} />);
      const ltrPrevious = ltr.getByRole('button', { name: 'Previous page' }).element().innerHTML;
      await ltr.unmount();
      const rtl = await renderWithProvider(<Pagination pageCount={3} defaultPage={2} />, {
        locale: 'ar',
      });
      const rtlPrevious = rtl.getByRole('button', { name: 'Previous page' }).element().innerHTML;
      expect(rtlPrevious).not.toBe(ltrPrevious);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Pagination total={1248} pageSize={10} defaultPage={50} />
          <Pagination pageCount={3} />
          <Pagination total={0} pageSize={10} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when a page button is focused (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Pagination pageCount={10} defaultPage={5} />
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
