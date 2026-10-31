import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { SkipLink } from './SkipLink';

function Page({ targetId }: { targetId?: string }) {
  return (
    <>
      <SkipLink {...(targetId === undefined ? {} : { targetId })} />
      <nav aria-label="Primary">
        <a href="#orders">Orders</a>
      </nav>
      <main id={targetId ?? 'main'}>
        <h1>Orders</h1>
      </main>
    </>
  );
}

describe('SkipLink', () => {
  describe('rendering', () => {
    it('is a link to #main named by the default message', async () => {
      const screen = await renderWithProvider(<Page />);
      const link = screen.getByRole('link', { name: 'Skip to main content' });
      expect(link.element().getAttribute('href')).toBe('#main');
    });

    it('is visually hidden until it is focused', async () => {
      const screen = await renderWithProvider(<Page />);
      const link = screen.getByRole('link', { name: 'Skip to main content' }).element();
      expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1);
      expect(getComputedStyle(link).clipPath).not.toBe('none');
      await userEvent.keyboard('{Tab}');
      await expect
        .element(screen.getByRole('link', { name: 'Skip to main content' }))
        .toHaveFocus();
      const rect = link.getBoundingClientRect();
      expect(rect.width).toBeGreaterThan(40);
      expect(rect.height).toBeGreaterThan(20);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(getComputedStyle(link).clipPath).toBe('none');
      expect(getComputedStyle(link).zIndex).toBe('60');
    });

    it('hides again when it loses focus', async () => {
      const screen = await renderWithProvider(<Page />);
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Tab}');
      const link = screen.getByRole('link', { name: 'Skip to main content' }).element();
      expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    });

    it('is the first focusable element in a page that follows the guidance', async () => {
      const screen = await renderWithProvider(<Page />);
      await userEvent.keyboard('{Tab}');
      await expect
        .element(screen.getByRole('link', { name: 'Skip to main content' }))
        .toHaveFocus();
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLAnchorElement>();
      await renderWithProvider(<SkipLink ref={ref} className="extra" data-testid="s" />);
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('s');
    });
  });

  describe('behavior', () => {
    it('moves focus to the main content on Enter without changing the URL hash', async () => {
      const before = window.location.hash;
      const screen = await renderWithProvider(<Page />);
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Enter}');
      await expect.element(screen.getByRole('main')).toHaveFocus();
      expect(window.location.hash).toBe(before);
    });

    it('does not leave a tabindex on the target after it loses focus', async () => {
      const screen = await renderWithProvider(<Page />);
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Enter}');
      expect(screen.getByRole('main').element().getAttribute('tabindex')).toBe('-1');
      await userEvent.keyboard('{Tab}');
      expect(screen.getByRole('main').element().hasAttribute('tabindex')).toBe(false);
    });

    it('jumps to a custom target', async () => {
      const screen = await renderWithProvider(<Page targetId="content" />);
      expect(
        screen.getByRole('link', { name: 'Skip to main content' }).element().getAttribute('href'),
      ).toBe('#content');
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Enter}');
      await expect.element(screen.getByRole('main')).toHaveFocus();
    });

    it('keeps an existing tabindex on the target', async () => {
      const screen = await renderWithProvider(
        <>
          <SkipLink />
          {/* eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex -- the test checks that an existing tabindex is kept */}
          <main id="main" tabIndex={0}>
            Content
          </main>
        </>,
      );
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('{Tab}');
      expect(screen.getByRole('main').element().getAttribute('tabindex')).toBe('0');
    });

    it('calls the consumer onClick and lets it cancel the jump', async () => {
      const onClick = vi.fn((event: { preventDefault: () => void }) => {
        event.preventDefault();
      });
      const screen = await renderWithProvider(
        <>
          <SkipLink onClick={onClick} />
          <main id="main">Content</main>
        </>,
      );
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('main').element()).not.toBe(document.activeElement);
    });
  });

  describe('messages', () => {
    it('translates the default text to pt-BR, and accepts overrides and custom children', async () => {
      const pt = await renderWithProvider(<SkipLink />, { locale: 'pt-BR' });
      await expect
        .element(pt.getByRole('link', { name: 'Pular para o conteúdo principal' }))
        .toBeInTheDocument();
      await pt.unmount();

      const provider = await renderWithProvider(<SkipLink />, {
        messages: { SkipLink: { label: 'Jump to content' } },
      });
      await expect
        .element(provider.getByRole('link', { name: 'Jump to content' }))
        .toBeInTheDocument();
      await provider.unmount();

      const instance = await renderWithProvider(<SkipLink messages={{ label: 'Skip' }} />, {
        messages: { SkipLink: { label: 'Jump to content' } },
      });
      await expect.element(instance.getByRole('link', { name: 'Skip' })).toBeInTheDocument();
      await instance.unmount();

      const custom = await renderWithProvider(<SkipLink>Skip to the results</SkipLink>);
      await expect
        .element(custom.getByRole('link', { name: 'Skip to the results' }))
        .toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations hidden and focused (axe)', async () => {
      const screen = await renderWithProvider(<Page />);
      await expectNoA11yViolations(screen.container);
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
