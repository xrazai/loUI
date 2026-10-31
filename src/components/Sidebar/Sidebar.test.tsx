import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { StarIcon } from '../Icon';
import { Sidebar } from './Sidebar';
import type { SidebarProps } from './Sidebar';

const baseProps: SidebarProps = {
  workspace: { name: 'Northwind', subtitle: 'Production' },
  value: 'orders',
  sections: [
    {
      id: 'work',
      title: 'Work',
      items: [
        {
          value: 'orders',
          label: 'Orders',
          href: '#orders',
          icon: StarIcon,
          count: 3,
          countLabel: '3 pending',
          countTone: 'warning',
        },
        { value: 'customers', label: 'Customers', href: '#customers' },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [{ value: 'help', label: 'Help' }],
    },
  ],
};

function renderSidebar(
  props: Partial<SidebarProps> = {},
  options?: Parameters<typeof renderWithProvider>[1],
) {
  return renderWithProvider(
    <div style={{ blockSize: 480, display: 'flex' }}>
      <Sidebar {...baseProps} {...props} />
    </div>,
    options,
  );
}

describe('Sidebar', () => {
  describe('structure', () => {
    it('is a named aside with one labelled nav per section', async () => {
      const screen = await renderSidebar();
      await expect.element(screen.getByRole('complementary', { name: 'Sidebar' })).toBeVisible();
      await expect.element(screen.getByRole('navigation', { name: 'Work' })).toBeVisible();
      await expect.element(screen.getByRole('navigation', { name: 'Account' })).toBeVisible();
      expect(screen.getByRole('navigation').elements()).toHaveLength(2);
    });

    it('names a captioned section by its caption and shows the caption in uppercase', async () => {
      const screen = await renderSidebar();
      const nav = screen.getByRole('navigation', { name: 'Work' }).element();
      const caption = nav.querySelector('[id]') as HTMLElement;
      expect(caption.textContent).toBe('Work');
      expect(getComputedStyle(caption).textTransform).toBe('uppercase');
    });

    it('lists items as list items of their navigation', async () => {
      const screen = await renderSidebar();
      expect(
        screen.getByRole('navigation', { name: 'Work' }).getByRole('listitem').elements(),
      ).toHaveLength(2);
    });

    it('is as wide as the sidebar token and scrolls on its own', async () => {
      const many = Array.from({ length: 30 }, (_, index) => ({
        value: `i${String(index)}`,
        label: `Item ${String(index)}`,
        href: `#i${String(index)}`,
      }));
      const screen = await renderSidebar({ sections: [{ id: 'm', title: 'Many', items: many }] });
      const aside = screen.getByRole('complementary').element();
      expect(aside.getBoundingClientRect().width).toBe(240);
      expect(getComputedStyle(aside).overflowY).toBe('auto');
      expect(aside.scrollHeight).toBeGreaterThan(aside.clientHeight);
    });

    it('shows the workspace initial from the name, or the given one', async () => {
      const first = await renderSidebar({ workspace: { name: 'northwind' } });
      expect(first.container.textContent).toContain('N');
      await first.unmount();
      const given = await renderSidebar({ workspace: { name: 'Northwind', initial: 'X' } });
      expect(given.container.querySelector('[aria-hidden="true"]')?.textContent).toBe('X');
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLElement>();
      await renderWithProvider(
        <Sidebar {...baseProps} ref={ref} className="extra" data-testid="s" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('ASIDE');
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('s');
    });
  });

  describe('active item and events', () => {
    it('marks only the matching item with aria-current="page"', async () => {
      const screen = await renderSidebar();
      expect(
        screen
          .getByRole('link', { name: 'Orders 3 pending' })
          .element()
          .getAttribute('aria-current'),
      ).toBe('page');
      expect(
        screen.getByRole('link', { name: 'Customers' }).element().hasAttribute('aria-current'),
      ).toBe(false);
    });

    it('calls onChange with the pressed item value (link and button items)', async () => {
      const onChange = vi.fn();
      const screen = await renderSidebar({ onChange });
      await userEvent.click(screen.getByRole('link', { name: 'Customers' }));
      expect(onChange).toHaveBeenLastCalledWith('customers');
      await userEvent.click(screen.getByRole('button', { name: 'Help' }));
      expect(onChange).toHaveBeenLastCalledWith('help');
    });
  });

  describe('status, footer and user', () => {
    it('renders the status as text with a decorative dot', async () => {
      const screen = await renderSidebar({
        status: { tone: 'warning', title: 'Sync delayed', meta: 'Last sync', value: '2 min ago' },
      });
      const status = screen.getByRole('status');
      expect(status.element().textContent).toContain('Sync delayed');
      expect(status.element().textContent).toContain('2 min ago');
      expect(status.element().querySelector('[aria-hidden="true"]')).not.toBeNull();
    });

    it('renders the user without repeating the name for assistive technology', async () => {
      const screen = await renderSidebar({ user: { name: 'Ana Souza', role: 'Owner' } });
      expect(screen.getByRole('img').elements()).toHaveLength(0);
      expect(screen.container.textContent).toContain('Ana Souza');
      expect(screen.container.textContent).toContain('Owner');
    });

    it('keeps focus order: sections top to bottom, then the footer', async () => {
      const screen = await renderSidebar({
        footer: <a href="#help-center">Help center</a>,
        user: { name: 'Ana Souza' },
      });
      const expected = ['Orders 3 pending', 'Customers', 'Help', 'Help center'];
      for (const name of expected) {
        await userEvent.keyboard('{Tab}');
        const role = name === 'Help' ? 'button' : 'link';
        await expect.element(screen.getByRole(role, { name })).toHaveFocus();
      }
    });
  });

  describe('messages', () => {
    it('translates the landmark name to pt-BR, and accepts provider and instance overrides', async () => {
      const pt = await renderSidebar({}, { locale: 'pt-BR' });
      await expect.element(pt.getByRole('complementary', { name: 'Barra lateral' })).toBeVisible();
      await pt.unmount();

      const provider = await renderSidebar({}, { messages: { Sidebar: { label: 'Main menu' } } });
      await expect
        .element(provider.getByRole('complementary', { name: 'Main menu' }))
        .toBeVisible();
      await provider.unmount();

      const instance = await renderSidebar(
        { messages: { label: 'Primary' } },
        { messages: { Sidebar: { label: 'Main menu' } } },
      );
      await expect.element(instance.getByRole('complementary', { name: 'Primary' })).toBeVisible();
    });

    it('lets aria-label win over the catalog', async () => {
      const screen = await renderSidebar({ 'aria-label': 'Workspace navigation' });
      await expect
        .element(screen.getByRole('complementary', { name: 'Workspace navigation' }))
        .toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with every block present (axe)', async () => {
      const screen = await renderWithProvider(
        <div style={{ blockSize: 560, display: 'flex' }}>
          <Sidebar
            {...baseProps}
            status={{ title: 'All systems operational', meta: 'Last sync', value: '2 min ago' }}
            footer={<a href="#help-center">Help center</a>}
            user={{ name: 'Ana Souza', role: 'ana@example.com' }}
          />
        </div>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when an item is focused (axe)', async () => {
      const screen = await renderSidebar();
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
