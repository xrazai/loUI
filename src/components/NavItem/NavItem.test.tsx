import { createRef } from 'react';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { DSProvider } from '../../providers/DSProvider';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { StarIcon } from '../Icon';
import { NavItem } from './NavItem';

describe('NavItem', () => {
  describe('rendering', () => {
    it('renders a real link with the label and a decorative icon', async () => {
      const screen = await renderWithProvider(
        <NavItem href="#orders" icon={StarIcon}>
          Orders
        </NavItem>,
      );
      const link = screen.getByRole('link', { name: 'Orders' });
      expect(link.element().tagName).toBe('A');
      expect(link.element().getAttribute('href')).toBe('#orders');
      expect(link.element().querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders a button when there is only onPress', async () => {
      const onPress = vi.fn();
      const screen = await renderWithProvider(<NavItem onPress={onPress}>Log out</NavItem>);
      const button = screen.getByRole('button', { name: 'Log out' });
      expect(button.element().tagName).toBe('BUTTON');
      await userEvent.click(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('marks only the active item with aria-current="page"', async () => {
      const screen = await renderWithProvider(
        <>
          <NavItem href="#a" isActive>
            Orders
          </NavItem>
          <NavItem href="#b">Customers</NavItem>
          <NavItem isActive onPress={() => undefined}>
            Reports
          </NavItem>
        </>,
      );
      expect(
        screen.getByRole('link', { name: 'Orders' }).element().getAttribute('aria-current'),
      ).toBe('page');
      expect(
        screen.getByRole('link', { name: 'Customers' }).element().hasAttribute('aria-current'),
      ).toBe(false);
      expect(
        screen.getByRole('button', { name: 'Reports' }).element().getAttribute('aria-current'),
      ).toBe('page');
    });

    it('draws the active item raised with a 2px ink bar, and a dimmed inactive icon', async () => {
      const screen = await renderWithProvider(
        <>
          <NavItem href="#a" icon={StarIcon} isActive>
            Active
          </NavItem>
          <NavItem href="#b" icon={StarIcon}>
            Inactive
          </NavItem>
        </>,
      );
      const active = screen.getByRole('link', { name: 'Active' }).element();
      const inactive = screen.getByRole('link', { name: 'Inactive' }).element();
      expect(getComputedStyle(active).backgroundColor).toBe('rgb(24, 24, 27)');
      const bar = getComputedStyle(active, '::before');
      expect(bar.width).toBe('2px');
      expect(bar.backgroundColor).toBe('rgb(237, 237, 234)');
      expect(getComputedStyle(inactive, '::before').content).toBe('none');
      expect(getComputedStyle(inactive.querySelector('svg') as Element).opacity).toBe('0.7');
      expect(getComputedStyle(active.querySelector('svg') as Element).opacity).toBe('1');
    });

    it('keeps the item height at the item token', async () => {
      const screen = await renderWithProvider(<NavItem href="#a">Orders</NavItem>);
      expect(screen.getByRole('link').element().getBoundingClientRect().height).toBe(36);
    });

    it('truncates a long label instead of wrapping', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 120 }}>
          <NavItem href="#a" count={3} countLabel="3 pending">
            Purchase orders awaiting supplier confirmation
          </NavItem>
        </div>,
      );
      expect(screen.getByRole('link').element().getBoundingClientRect().height).toBe(36);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLElement>();
      await renderWithProvider(
        <NavItem ref={ref} href="#a" className="extra" data-testid="n" aria-describedby="hint">
          Orders
        </NavItem>,
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('n');
      expect(ref.current?.getAttribute('aria-describedby')).toBe('hint');
    });

    it('forwards the ref to the button when there is no href', async () => {
      const ref = createRef<HTMLElement>();
      await renderWithProvider(
        <NavItem ref={ref} onPress={() => undefined}>
          Orders
        </NavItem>,
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('count', () => {
    it('adds the count label to the accessible name instead of the bare number', async () => {
      const screen = await renderWithProvider(
        <NavItem href="#a" count={3} countLabel="3 pending" countTone="warning">
          Orders
        </NavItem>,
      );
      await expect.element(screen.getByRole('link', { name: 'Orders 3 pending' })).toBeVisible();
      expect(screen.getByRole('link').element().textContent).toContain('3');
    });

    it('formats numeric counts for the active locale (pt-BR)', async () => {
      const screen = await renderWithProvider(
        <NavItem href="#a" count={1248} countLabel="1.248 pendentes">
          Pedidos
        </NavItem>,
        { locale: 'pt-BR' },
      );
      expect(screen.getByRole('link').element().textContent).toContain('1.248');
    });

    it('falls back to a generic spoken label and translates it (pt-BR, provider, instance)', async () => {
      const en = await renderWithProvider(
        <NavItem href="#a" count={3}>
          Orders
        </NavItem>,
      );
      await expect.element(en.getByRole('link', { name: 'Orders Count: 3' })).toBeVisible();
      await en.unmount();

      const pt = await renderWithProvider(
        <NavItem href="#a" count={3}>
          Pedidos
        </NavItem>,
        { locale: 'pt-BR' },
      );
      await expect.element(pt.getByRole('link', { name: 'Pedidos Quantidade: 3' })).toBeVisible();
      await pt.unmount();

      const provider = await renderWithProvider(
        <NavItem href="#a" count={3}>
          Orders
        </NavItem>,
        { messages: { NavItem: { count: (value: string) => `${value} new` } } },
      );
      await expect.element(provider.getByRole('link', { name: 'Orders 3 new' })).toBeVisible();
      await provider.unmount();

      const instance = await renderWithProvider(
        <NavItem href="#a" count={3} messages={{ count: (value: string) => `${value} fresh` }}>
          Orders
        </NavItem>,
        { messages: { NavItem: { count: (value: string) => `${value} new` } } },
      );
      await expect.element(instance.getByRole('link', { name: 'Orders 3 fresh' })).toBeVisible();
    });

    it('shows no pill for a count of 0', async () => {
      const screen = await renderWithProvider(
        <NavItem href="#a" count={0} countLabel="0 pending">
          Orders
        </NavItem>,
      );
      await expect.element(screen.getByRole('link', { name: 'Orders' })).toBeVisible();
    });
  });

  describe('keyboard and routing', () => {
    it('is reached with Tab and activated with Enter (link) and Enter or Space (button)', async () => {
      const onLink = vi.fn();
      const onButton = vi.fn();
      const screen = await renderWithProvider(
        <>
          <NavItem href="#a" onPress={onLink}>
            Link
          </NavItem>
          <NavItem onPress={onButton}>Button</NavItem>
        </>,
      );
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('link', { name: 'Link' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onLink).toHaveBeenCalledTimes(1);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Button' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      expect(onButton).toHaveBeenCalledTimes(2);
    });

    it('navigates through the DSProvider router', async () => {
      const navigate = vi.fn();
      const screen = await render(
        <DSProvider navigate={navigate}>
          <NavItem href="/orders">Orders</NavItem>
        </DSProvider>,
      );
      await userEvent.click(screen.getByRole('link', { name: 'Orders' }));
      expect(navigate).toHaveBeenCalledWith('/orders', undefined);
    });

    it('ignores presses when disabled', async () => {
      const onPress = vi.fn();
      const screen = await renderWithProvider(
        <NavItem href="#a" isDisabled onPress={onPress}>
          Orders
        </NavItem>,
      );
      const link = screen.getByRole('link');
      expect(link.element().getAttribute('aria-disabled')).toBe('true');
      await userEvent.click(link, { force: true });
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for links, buttons, counts and the active item (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <nav aria-label="Main">
            <NavItem href="#a" icon={StarIcon} isActive>
              Orders
            </NavItem>
            <NavItem href="#b" icon={StarIcon} count={3} countLabel="3 pending" countTone="warning">
              Customers
            </NavItem>
            <NavItem href="#c" count={2} countLabel="2 late" countTone="danger">
              Late
            </NavItem>
            <NavItem href="#d" count={9} countLabel="9 open" countTone="accent">
              Open
            </NavItem>
            <NavItem href="#e" count={5} countLabel="5 done" countTone="success">
              Done
            </NavItem>
            <NavItem onPress={() => undefined}>Help</NavItem>
            <NavItem href="#f" isDisabled>
              Archived
            </NavItem>
          </nav>
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when focused (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <nav aria-label="Main">
            <NavItem href="#a" isActive count={3} countLabel="3 pending">
              Orders
            </NavItem>
          </nav>
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
