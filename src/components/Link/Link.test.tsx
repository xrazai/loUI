import { createRef } from 'react';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { DSProvider } from '../../providers/DSProvider';
import { Link } from './Link';

describe('Link', () => {
  describe('rendering', () => {
    it('renders a real anchor named by its text', async () => {
      const screen = await renderWithProvider(<Link href="#pricing">Pricing details</Link>);
      const link = screen.getByRole('link', { name: 'Pricing details' });
      await expect.element(link).toBeInTheDocument();
      expect(link.element().tagName).toBe('A');
      expect(link.element().getAttribute('href')).toBe('#pricing');
    });

    it('underlines inline links so color is not the only cue (WCAG 1.4.1)', async () => {
      const screen = await renderWithProvider(<Link href="#x">Details</Link>);
      const style = getComputedStyle(screen.getByRole('link').element());
      expect(style.textDecorationLine).toBe('underline');
      expect(style.color).toBe('rgb(138, 180, 255)');
    });

    it('drops the underline for standalone links and restores it on hover', async () => {
      const screen = await renderWithProvider(
        <Link href="#x" variant="standalone">
          View all
        </Link>,
      );
      const link = screen.getByRole('link');
      expect(getComputedStyle(link.element()).textDecorationLine).toBe('none');
      await userEvent.hover(link);
      expect(getComputedStyle(link.element()).textDecorationLine).toBe('underline');
    });

    it('restores the underline of standalone links on keyboard focus', async () => {
      const screen = await renderWithProvider(
        <Link href="#x" variant="standalone">
          View all
        </Link>,
      );
      await userEvent.keyboard('{Tab}');
      expect(getComputedStyle(screen.getByRole('link').element()).textDecorationLine).toBe(
        'underline',
      );
    });

    it('inherits the font of the surrounding text', async () => {
      const screen = await renderWithProvider(
        <p style={{ fontSize: '21px' }}>
          Read <Link href="#x">the guide</Link>
        </p>,
      );
      expect(getComputedStyle(screen.getByRole('link').element()).fontSize).toBe('21px');
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLAnchorElement>();
      await renderWithProvider(
        <Link ref={ref} href="#x" className="extra" data-testid="l" aria-describedby="hint">
          Details
        </Link>,
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('l');
      expect(ref.current?.getAttribute('aria-describedby')).toBe('hint');
    });
  });

  describe('external links', () => {
    it('sets rel for target="_blank" and keeps consumer rel tokens', async () => {
      const screen = await renderWithProvider(
        <>
          <Link href="https://example.com" target="_blank">
            Docs
          </Link>
          <Link href="https://example.com/a" target="_blank" rel="nofollow">
            Partner
          </Link>
        </>,
      );
      expect(screen.getByRole('link', { name: /Docs/ }).element().getAttribute('rel')).toBe(
        'noopener noreferrer',
      );
      expect(
        screen
          .getByRole('link', { name: /Partner/ })
          .element()
          .getAttribute('rel'),
      ).toBe('nofollow noopener noreferrer');
    });

    it('does not touch rel for same-tab links', async () => {
      const screen = await renderWithProvider(<Link href="#x">Details</Link>);
      expect(screen.getByRole('link').element().hasAttribute('rel')).toBe(false);
      expect(screen.getByRole('link').element().querySelector('svg')).toBeNull();
    });

    it('announces that the link opens a new tab and shows a decorative icon', async () => {
      const screen = await renderWithProvider(
        <Link href="https://example.com" target="_blank">
          Docs
        </Link>,
      );
      await expect
        .element(screen.getByRole('link', { name: 'Docs (opens in a new tab)' }))
        .toBeInTheDocument();
      expect(
        screen.getByRole('link').element().querySelector('svg')?.getAttribute('aria-hidden'),
      ).toBe('true');
    });

    it('translates the note to pt-BR and accepts overrides', async () => {
      const pt = await renderWithProvider(
        <Link href="https://example.com" target="_blank">
          Documentação
        </Link>,
        { locale: 'pt-BR' },
      );
      await expect
        .element(pt.getByRole('link', { name: 'Documentação (abre em uma nova aba)' }))
        .toBeInTheDocument();
      await pt.unmount();

      const provider = await renderWithProvider(
        <Link href="https://example.com" target="_blank">
          Docs
        </Link>,
        { messages: { Link: { opensInNewTab: '(new tab)' } } },
      );
      await expect
        .element(provider.getByRole('link', { name: 'Docs (new tab)' }))
        .toBeInTheDocument();
      await provider.unmount();

      const instance = await renderWithProvider(
        <Link href="https://example.com" target="_blank" messages={{ opensInNewTab: '(tab)' }}>
          Docs
        </Link>,
        { messages: { Link: { opensInNewTab: '(new tab)' } } },
      );
      await expect.element(instance.getByRole('link', { name: 'Docs (tab)' })).toBeInTheDocument();
    });
  });

  describe('keyboard and routing', () => {
    it('is focused with Tab and pressed with Enter', async () => {
      const onPress = vi.fn();
      const screen = await renderWithProvider(
        <Link href="#x" onPress={onPress}>
          Details
        </Link>,
      );
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('link')).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('navigates through the DSProvider router instead of reloading', async () => {
      const navigate = vi.fn();
      const screen = await render(
        <DSProvider navigate={navigate} useHref={(href) => `/app${href}`}>
          <Link href="/orders">Orders</Link>
        </DSProvider>,
      );
      const link = screen.getByRole('link', { name: 'Orders' });
      expect(link.element().getAttribute('href')).toBe('/app/orders');
      await userEvent.click(link);
      expect(navigate).toHaveBeenCalledWith('/orders', undefined);
    });

    it('is aria-disabled and ignores presses when disabled', async () => {
      const onPress = vi.fn();
      const screen = await renderWithProvider(
        <Link href="#x" isDisabled onPress={onPress}>
          Details
        </Link>,
      );
      const link = screen.getByRole('link');
      expect(link.element().getAttribute('aria-disabled')).toBe('true');
      await userEvent.click(link, { force: true });
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (inline, standalone, external, disabled)', async () => {
      const screen = await renderWithProvider(
        <main>
          <p>
            Read the <Link href="#a">pricing details</Link> first.
          </p>
          <Link href="#b" variant="standalone">
            View all orders
          </Link>
          <Link href="https://example.com" target="_blank">
            Documentation
          </Link>
          <Link href="#c" isDisabled>
            Unavailable
          </Link>
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when focused', async () => {
      const screen = await renderWithProvider(
        <main>
          <p>
            Read the <Link href="#a">pricing details</Link> first.
          </p>
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
