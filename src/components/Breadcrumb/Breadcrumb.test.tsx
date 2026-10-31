import { createRef } from 'react';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { DSProvider } from '../../providers/DSProvider';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Breadcrumb } from './Breadcrumb';

const items = [
  { label: 'Orders', href: '#orders' },
  { label: 'Northwind Traders', href: '#northwind' },
  { label: 'ORD-1048' },
];

describe('Breadcrumb', () => {
  describe('structure', () => {
    it('is a named navigation landmark with an ordered list', async () => {
      const screen = await renderWithProvider(<Breadcrumb items={items} />);
      await expect.element(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
      const list = screen.getByRole('list').element();
      expect(list.tagName).toBe('OL');
      expect(screen.getByRole('listitem').elements()).toHaveLength(3);
    });

    it('renders ancestors as links and the last item as the current page', async () => {
      const screen = await renderWithProvider(<Breadcrumb items={items} />);
      expect(screen.getByRole('link').elements()).toHaveLength(2);
      const current = screen.getByText('ORD-1048').element();
      expect(current.getAttribute('aria-current')).toBe('page');
      expect(current.closest('a')).toBeNull();
    });

    it('hides the separators from assistive technology', async () => {
      const screen = await renderWithProvider(<Breadcrumb items={items} />);
      const separators = screen.container.querySelectorAll('svg');
      expect(separators).toHaveLength(2);
      for (const separator of separators) {
        expect(separator.getAttribute('aria-hidden')).toBe('true');
      }
    });

    it('renders no link for a single item', async () => {
      const screen = await renderWithProvider(<Breadcrumb items={[{ label: 'Orders' }]} />);
      expect(screen.getByRole('link').elements()).toHaveLength(0);
      expect(screen.container.querySelectorAll('svg')).toHaveLength(0);
    });

    it('truncates a long trail to its container without wrapping', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 300 }}>
          <Breadcrumb
            items={[
              { label: 'Purchase orders awaiting approval', href: '#a' },
              {
                label: 'Supplier: Stationery and Accessories International Trading Company',
                href: '#b',
              },
              { label: 'ORD-1048 line items with partial shipment and credit note' },
            ]}
          />
        </div>,
      );
      const nav = screen.getByRole('navigation').element();
      expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth);
      expect(screen.getByRole('list').element().getBoundingClientRect().height).toBeLessThan(40);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLElement>();
      await renderWithProvider(
        <Breadcrumb ref={ref} items={items} className="extra" data-testid="b" />,
      );
      expect(ref.current?.tagName).toBe('NAV');
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('b');
    });
  });

  describe('interaction', () => {
    it('visits the ancestor links in order with Tab and skips the current page', async () => {
      const screen = await renderWithProvider(
        <>
          <Breadcrumb items={items} />
          <button type="button">After</button>
        </>,
      );
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('link', { name: 'Orders' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('link', { name: 'Northwind Traders' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('navigates through the DSProvider router', async () => {
      const navigate = vi.fn();
      const screen = await render(
        <DSProvider navigate={navigate}>
          <Breadcrumb items={[{ label: 'Orders', href: '/orders' }, { label: 'ORD-1048' }]} />
        </DSProvider>,
      );
      await userEvent.click(screen.getByRole('link', { name: 'Orders' }));
      expect(navigate).toHaveBeenCalledWith('/orders', undefined);
    });
  });

  describe('messages', () => {
    it('translates the landmark name to pt-BR, and accepts provider and instance overrides', async () => {
      const pt = await renderWithProvider(<Breadcrumb items={items} />, { locale: 'pt-BR' });
      await expect
        .element(pt.getByRole('navigation', { name: 'Trilha de navegação' }))
        .toBeVisible();
      await pt.unmount();

      const provider = await renderWithProvider(<Breadcrumb items={items} />, {
        messages: { Breadcrumb: { label: 'You are here' } },
      });
      await expect
        .element(provider.getByRole('navigation', { name: 'You are here' }))
        .toBeVisible();
      await provider.unmount();

      const instance = await renderWithProvider(
        <Breadcrumb items={items} messages={{ label: 'Path' }} />,
        { messages: { Breadcrumb: { label: 'You are here' } } },
      );
      await expect.element(instance.getByRole('navigation', { name: 'Path' })).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Breadcrumb items={items} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when a link is focused (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Breadcrumb items={items} />
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
