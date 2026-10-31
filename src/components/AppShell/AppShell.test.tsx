import { createRef, useState } from 'react';
import type { ReactNode } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Sidebar } from '../Sidebar';
import { TopBar } from '../TopBar';
import { AppShell, AppShellNavToggle } from './AppShell';
import type { AppShellProps } from './AppShell';

const sidebar = (
  <Sidebar
    workspace={{ name: 'Northwind', subtitle: 'Production' }}
    value="orders"
    sections={[
      {
        id: 'work',
        title: 'Work',
        items: [
          { value: 'orders', label: 'Orders', href: '#orders' },
          { value: 'customers', label: 'Customers', href: '#customers' },
        ],
      },
    ]}
  />
);

const topBar = (
  <TopBar title="Orders" actions={<button type="button">New order</button>}>
    <AppShellNavToggle />
  </TopBar>
);

function Frame({ width, children }: { width: number; children: ReactNode }) {
  return <div style={{ inlineSize: width, blockSize: 480 }}>{children}</div>;
}

/** A hidden sidebar leaves the accessibility tree, so it cannot be found by role: read its style. */
async function expectSidebar(
  screen: { container: Element },
  visibility: 'visible' | 'hidden',
): Promise<void> {
  await expect
    .poll(() => {
      const aside = screen.container.querySelector('aside[aria-label="Sidebar"]');
      return aside ? getComputedStyle(aside).visibility : 'missing';
    })
    .toBe(visibility);
}

function renderShell(
  width: number,
  props: Partial<AppShellProps> = {},
  options?: Parameters<typeof renderWithProvider>[1],
) {
  return renderWithProvider(
    <Frame width={width}>
      <AppShell data-testid="shell" sidebar={sidebar} topBar={topBar} {...props}>
        <p>Content</p>
      </AppShell>
    </Frame>,
    options,
  );
}

describe('AppShell landmarks and skip link', () => {
  it('renders one main, one banner, the sidebar and no other landmark', async () => {
    const screen = await renderShell(1000);
    await expect.element(screen.getByRole('main')).toBeVisible();
    await expect.element(screen.getByRole('banner')).toBeVisible();
    await expectSidebar(screen, 'visible');
    expect(screen.container.querySelectorAll('main')).toHaveLength(1);
    expect(screen.getByRole('main').element().id).toBe('main');
  });

  it('puts the skip link first and moves focus to main', async () => {
    const screen = await renderShell(1000);
    await userEvent.tab();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    await expect.element(skip).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('main')).toHaveFocus();
  });

  it('honors a custom mainId and can drop the skip link', async () => {
    const custom = await renderShell(1000, { mainId: 'content' });
    expect(custom.getByRole('main').element().id).toBe('content');
    expect(
      custom.getByRole('link', { name: 'Skip to main content' }).element().getAttribute('href'),
    ).toBe('#content');
    await custom.unmount();

    const none = await renderShell(1000, { skipLink: false });
    expect(none.container.querySelector('a[href="#main"]')).toBeNull();
  });

  it('adds a labelled detail aside', async () => {
    const screen = await renderShell(1000, { detail: <p>Order 1048</p> });
    await expect.element(screen.getByRole('complementary', { name: 'Details' })).toBeVisible();
    const renamed = await renderShell(1000, { detail: <p>x</p>, detailLabel: 'Order details' });
    await expect
      .element(renamed.getByRole('complementary', { name: 'Order details' }))
      .toBeVisible();
  });
});

describe('AppShell layout', () => {
  it('fills its parent and keeps the page from scrolling', async () => {
    const screen = await renderShell(1000);
    const box = screen.getByTestId('shell').element().getBoundingClientRect();
    expect(box.width).toBe(1000);
    expect(box.height).toBe(480);
    expect(getComputedStyle(screen.getByTestId('shell').element()).overflow).toBe('hidden');
  });

  it('scrolls main on its own, below a fixed top bar', async () => {
    const screen = await renderWithProvider(
      <Frame width={1000}>
        <AppShell sidebar={sidebar} topBar={topBar}>
          {Array.from({ length: 60 }, (_, index) => (
            <p key={index}>Row {index}</p>
          ))}
        </AppShell>
      </Frame>,
    );
    const main = screen.getByRole('main').element();
    const header = screen.getByRole('banner').element();
    const before = header.getBoundingClientRect().top;
    expect(main.scrollHeight).toBeGreaterThan(main.clientHeight);
    main.scrollTop = 300;
    expect(main.scrollTop).toBe(300);
    expect(header.getBoundingClientRect().top).toBe(before);
    expect(document.documentElement.scrollTop).toBe(0);
  });

  it('makes a scrolling main keyboard focusable, and only then', async () => {
    const long = await renderWithProvider(
      <Frame width={1000}>
        <AppShell sidebar={sidebar} topBar={topBar}>
          {Array.from({ length: 60 }, (_, index) => (
            <p key={index}>Row {index}</p>
          ))}
        </AppShell>
      </Frame>,
    );
    await expect.poll(() => long.getByRole('main').element().getAttribute('tabindex')).toBe('0');
    await long.unmount();

    const short = await renderShell(1000);
    await expect.poll(() => short.getByRole('main').element().getAttribute('tabindex')).toBeNull();
  });

  it('pads main unless padded is false', async () => {
    const padded = await renderShell(1000);
    expect(getComputedStyle(padded.getByRole('main').element()).paddingInlineStart).toBe('24px');
    await padded.unmount();
    const flush = await renderShell(1000, { padded: false });
    expect(getComputedStyle(flush.getByRole('main').element()).paddingInlineStart).toBe('0px');
  });

  it('shows the sidebar in the flow and the detail pane beside main from the md breakpoint', async () => {
    const screen = await renderShell(1000, { detail: <p>Order 1048</p> });
    const sidebarBox = screen
      .getByRole('complementary', { name: 'Sidebar' })
      .element()
      .getBoundingClientRect();
    const mainBox = screen.getByRole('main').element().getBoundingClientRect();
    const detailBox = screen
      .getByRole('complementary', { name: 'Details' })
      .element()
      .getBoundingClientRect();
    expect(sidebarBox.width).toBe(240);
    expect(mainBox.left).toBeGreaterThanOrEqual(sidebarBox.right);
    expect(detailBox.width).toBe(360);
    expect(detailBox.left).toBeGreaterThanOrEqual(mainBox.right);
    // The menu button is for narrow screens only.
    const toggle = screen.container.querySelector('button[aria-controls]') as HTMLElement;
    expect(getComputedStyle(toggle.parentElement as Element).display).toBe('none');
  });

  it('moves the detail pane under main below the md breakpoint', async () => {
    const screen = await renderShell(600, { detail: <p>Order 1048</p> });
    const mainBox = screen.getByRole('main').element().getBoundingClientRect();
    const detailBox = screen
      .getByRole('complementary', { name: 'Details' })
      .element()
      .getBoundingClientRect();
    expect(detailBox.top).toBeGreaterThanOrEqual(mainBox.bottom);
    expect(detailBox.left).toBe(mainBox.left);
  });

  it('switches layout exactly at the --ds-breakpoint-md token', async () => {
    const wide = await renderShell(768);
    const token = getComputedStyle(wide.getByTestId('shell').element())
      .getPropertyValue('--ds-breakpoint-md')
      .trim();
    expect(token).toBe('768px');
    const wideNav = wide.getByRole('complementary', { name: 'Sidebar' }).element()
      .parentElement as HTMLElement;
    expect(getComputedStyle(wideNav).position).toBe('static');
    await wide.unmount();

    const narrow = await renderShell(767);
    const narrowNav = (narrow.container.querySelector('aside[aria-label="Sidebar"]') as HTMLElement)
      .parentElement as HTMLElement;
    expect(getComputedStyle(narrowNav).position).toBe('absolute');
  });
});

describe('AppShell off-canvas navigation (below md)', () => {
  it('hides the sidebar and shows the menu button', async () => {
    const screen = await renderShell(600);
    await expectSidebar(screen, 'hidden');
    const toggle = screen.getByRole('button', { name: 'Menu' });
    await expect.element(toggle).toBeVisible();
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens with the toggle, moves focus into the panel and inerts the content', async () => {
    const screen = await renderShell(600);
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    await expectSidebar(screen, 'visible');
    await expect
      .poll(() => document.activeElement?.closest('aside')?.getAttribute('aria-label'))
      .toBe('Sidebar');
    const column = screen.getByRole('main').element().parentElement?.parentElement as HTMLElement;
    expect(column.hasAttribute('inert')).toBe(true);
  });

  it('closes with Escape and returns focus to the toggle', async () => {
    const screen = await renderShell(600);
    const toggle = screen.getByRole('button', { name: 'Menu' });
    await toggle.click();
    await expectSidebar(screen, 'visible');
    await userEvent.keyboard('{Escape}');
    await expectSidebar(screen, 'hidden');
    await expect.element(toggle).toHaveFocus();
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes from the close button', async () => {
    const screen = await renderShell(600);
    await screen.getByRole('button', { name: 'Menu' }).click();
    await screen.getByRole('button', { name: 'Close menu' }).click();
    await expectSidebar(screen, 'hidden');
    await expect.element(screen.getByRole('button', { name: 'Menu' })).toHaveFocus();
  });

  it('draws the close control as one-line icon button that does not cover the top bar action (GAP-010)', async () => {
    const screen = await renderShell(375);
    await screen.getByRole('button', { name: 'Menu' }).click();
    await expectSidebar(screen, 'visible');
    const close = screen.getByRole('button', { name: 'Close menu' }).element();
    expect(close.textContent).toBe('');
    expect(close.querySelector('svg')).not.toBeNull();
    const closeBox = close.getBoundingClientRect();
    // A 32px square: it cannot wrap onto two lines.
    expect(closeBox.width).toBe(closeBox.height);
    const nav = close.parentElement?.parentElement as HTMLElement;
    expect(nav.getBoundingClientRect().right).toBeLessThanOrEqual(closeBox.left);
    const action = [...screen.container.querySelectorAll('button')].find(
      (button) => button.textContent === 'New order',
    ) as HTMLElement;
    const actionBox = action.getBoundingClientRect();
    const overlaps =
      closeBox.left < actionBox.right &&
      closeBox.right > actionBox.left &&
      closeBox.top < actionBox.bottom &&
      closeBox.bottom > actionBox.top;
    expect(overlaps).toBe(false);
  });

  it('closes when the scrim is pressed', async () => {
    const onNavOpenChange = vi.fn();
    const screen = await renderShell(600, { onNavOpenChange });
    await screen.getByRole('button', { name: 'Menu' }).click();
    const scrim = screen
      .getByTestId('shell')
      .element()
      .querySelector('[aria-hidden="true"]') as HTMLElement;
    scrim.click();
    await expectSidebar(screen, 'hidden');
    expect(onNavOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('supports a controlled isNavOpen', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <Frame width={600}>
          <AppShell sidebar={sidebar} topBar={topBar} isNavOpen={open} onNavOpenChange={setOpen}>
            <p>Content</p>
          </AppShell>
        </Frame>
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await expectSidebar(screen, 'visible');
    await userEvent.keyboard('{Escape}');
    await expectSidebar(screen, 'hidden');
  });

  it('ignores Escape and the open state at the wide layout', async () => {
    const onNavOpenChange = vi.fn();
    const screen = await renderShell(1000, { defaultNavOpen: true, onNavOpenChange });
    await expectSidebar(screen, 'visible');
    await userEvent.tab();
    await userEvent.keyboard('{Escape}');
    expect(onNavOpenChange).not.toHaveBeenCalled();
    const column = screen.getByRole('main').element().parentElement?.parentElement as HTMLElement;
    expect(column.hasAttribute('inert')).toBe(false);
  });

  it('keeps the sidebar out of the tab order while closed', async () => {
    const screen = await renderShell(600);
    await userEvent.tab();
    await expect.element(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus();
    await userEvent.tab();
    // Next stop is the top bar, not the hidden sidebar links.
    expect(document.activeElement?.closest('aside')).toBeNull();
  });
});

describe('AppShell API', () => {
  it('translates the built-in strings and accepts overrides', async () => {
    const portuguese = await renderShell(600, { detail: <p>x</p> }, { locale: 'pt-BR' });
    await expect.element(portuguese.getByRole('button', { name: 'Menu' })).toBeVisible();
    await expect.element(portuguese.getByRole('complementary', { name: 'Detalhes' })).toBeVisible();
    await expect
      .element(portuguese.getByRole('link', { name: 'Pular para o conteúdo principal' }))
      .toBeInTheDocument();
    await portuguese.unmount();

    const provider = await renderShell(
      600,
      {},
      { messages: { AppShell: { navToggle: 'Navigation' } } },
    );
    await expect.element(provider.getByRole('button', { name: 'Navigation' })).toBeVisible();
    await provider.unmount();

    const instance = await renderShell(600, { messages: { navToggle: 'Sections' } });
    await expect.element(instance.getByRole('button', { name: 'Sections' })).toBeVisible();
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(
      <Frame width={1000}>
        <AppShell ref={ref} className="extra" id="shell">
          <p>Content</p>
        </AppShell>
      </Frame>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('shell');
  });

  it('works without a sidebar or a top bar', async () => {
    const screen = await renderWithProvider(
      <Frame width={600}>
        <AppShell>
          <h1>Alone</h1>
        </AppShell>
      </Frame>,
    );
    await expect.element(screen.getByRole('main')).toBeVisible();
    expect(screen.getByRole('complementary').elements()).toHaveLength(0);
  });

  it('AppShellNavToggle throws a clear error outside AppShell', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderWithProvider(<AppShellNavToggle />)).rejects.toThrow(/inside AppShell/);
    error.mockRestore();
  });
});

describe('AppShell axe', () => {
  it('has no axe violations on a wide screen with a detail pane', async () => {
    const screen = await renderShell(1000, { detail: <p>Order 1048</p> });
    await expectNoA11yViolations(screen.container);
  });

  it('has no axe violations on a narrow screen, closed and open', async () => {
    const screen = await renderShell(400, { detail: <p>Order 1048</p> });
    await expectNoA11yViolations(screen.container);
    await screen.getByRole('button', { name: 'Menu' }).click();
    await expectSidebar(screen, 'visible');
    await expectNoA11yViolations(screen.container);
  });

  it('has no axe violations when main scrolls', async () => {
    const screen = await renderWithProvider(
      <Frame width={1000}>
        <AppShell sidebar={sidebar} topBar={topBar}>
          {Array.from({ length: 60 }, (_, index) => (
            <p key={index}>Row {index}</p>
          ))}
        </AppShell>
      </Frame>,
    );
    await expect.poll(() => screen.getByRole('main').element().getAttribute('tabindex')).toBe('0');
    await expectNoA11yViolations(screen.container);
  });
});
