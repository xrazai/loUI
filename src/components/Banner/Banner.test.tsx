import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { contrastRatio } from '../../utils/color';
import { Banner } from './Banner';
import type { BannerTone } from './Banner';

const TONES: BannerTone[] = ['info', 'success', 'warning', 'danger'];

/** Paints the colors over each other on a canvas and returns the opaque result as hex. */
function composite(layers: string[]): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is not available');
  for (const layer of layers) {
    context.fillStyle = layer;
    context.fillRect(0, 0, 1, 1);
  }
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

describe('Banner', () => {
  it('renders the title and the text', async () => {
    const screen = await renderWithProvider(
      <Banner title="Scheduled maintenance">Sunday, 02:00 to 03:00 UTC.</Banner>,
    );
    await expect.element(screen.getByText('Scheduled maintenance')).toBeVisible();
    await expect.element(screen.getByText('Sunday, 02:00 to 03:00 UTC.')).toBeVisible();
  });

  it('works without a title or without text', async () => {
    const screen = await renderWithProvider(
      <>
        <Banner>Only text</Banner>
        <Banner title="Only title" />
      </>,
    );
    await expect.element(screen.getByText('Only text')).toBeVisible();
    await expect.element(screen.getByText('Only title')).toBeVisible();
  });

  describe('live region semantics', () => {
    it('has no role by default: a banner is part of the page from the start', async () => {
      const screen = await renderWithProvider(<Banner title="Maintenance" />);
      expect(screen.getByRole('status').elements()).toHaveLength(0);
      expect(screen.getByRole('alert').elements()).toHaveLength(0);
    });

    it('is a polite status when announce is set', async () => {
      const screen = await renderWithProvider(<Banner announce title="Back online" />);
      await expect.element(screen.getByRole('status')).toBeVisible();
    });

    it('is an alert only when urgent, even with announce', async () => {
      const screen = await renderWithProvider(
        <Banner tone="danger" urgent announce title="Connection lost" />,
      );
      await expect.element(screen.getByRole('alert')).toBeVisible();
      expect(screen.getByRole('status').elements()).toHaveLength(0);
    });

    it('does not make a danger banner urgent by itself', async () => {
      const screen = await renderWithProvider(<Banner tone="danger" title="Payment declined" />);
      expect(screen.getByRole('alert').elements()).toHaveLength(0);
    });
  });

  it.each(TONES)(
    'prefixes the %s banner with a visually hidden tone name and a decorative icon',
    async (tone) => {
      const names = {
        info: 'Information',
        success: 'Success',
        warning: 'Warning',
        danger: 'Error',
      };
      const screen = await renderWithProvider(<Banner announce tone={tone} title="Title" />);
      const root = screen.getByRole('status').element();
      expect(root.textContent).toContain(`${names[tone]} Title`);
      expect(root.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(root.getAttribute('data-tone')).toBe(tone);
    },
  );

  it.each(TONES)('keeps text contrast at 4.5:1 or more on the %s tint', async (tone) => {
    const screen = await renderWithProvider(
      <Banner announce tone={tone} title="Title">
        Detail text
      </Banner>,
    );
    const root = screen.getByRole('status').element();
    const surface = getComputedStyle(document.body).backgroundColor;
    const background = composite([surface, getComputedStyle(root).backgroundColor]);
    for (const text of ['Title', 'Detail text']) {
      const color = getComputedStyle(screen.getByText(text).element()).color;
      expect(contrastRatio(composite([background, color]), background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('renders the action slot', async () => {
    const screen = await renderWithProvider(
      <Banner title="Payment declined" action={<a href="#card">Update card</a>} />,
    );
    await expect.element(screen.getByRole('link', { name: 'Update card' })).toBeVisible();
  });

  describe('dismiss', () => {
    it('has no dismiss button without onDismiss', async () => {
      const screen = await renderWithProvider(<Banner title="Saved" />);
      expect(screen.getByRole('button').elements()).toHaveLength(0);
    });

    it('calls onDismiss from the button, with the pointer and the keyboard', async () => {
      const onDismiss = vi.fn();
      const screen = await renderWithProvider(<Banner title="Saved" onDismiss={onDismiss} />);
      const button = screen.getByRole('button', { name: 'Dismiss banner' });
      await userEvent.tab();
      await expect.element(button).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onDismiss).toHaveBeenCalledTimes(1);
      await userEvent.keyboard(' ');
      expect(onDismiss).toHaveBeenCalledTimes(2);
      await button.click();
      expect(onDismiss).toHaveBeenCalledTimes(3);
    });

    it('makes the dismiss button a target of at least 24 by 24 pixels', async () => {
      const screen = await renderWithProvider(<Banner title="Saved" onDismiss={() => undefined} />);
      const rect = screen
        .getByRole('button', { name: 'Dismiss banner' })
        .element()
        .getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(24);
      expect(rect.height).toBeGreaterThanOrEqual(24);
    });
  });

  describe('messages', () => {
    it('uses the pt-BR catalog', async () => {
      const screen = await renderWithProvider(
        <Banner announce tone="danger" title="Pagamento recusado" onDismiss={() => undefined} />,
        { locale: 'pt-BR' },
      );
      await expect.element(screen.getByRole('button', { name: 'Dispensar faixa' })).toBeVisible();
      expect(screen.getByRole('status').element().textContent).toContain('Erro Pagamento recusado');
    });

    it('applies provider and instance overrides', async () => {
      const provider = await renderWithProvider(
        <Banner title="Saved" onDismiss={() => undefined} />,
        { messages: { Banner: { dismiss: 'Close notice' } } },
      );
      await expect.element(provider.getByRole('button', { name: 'Close notice' })).toBeVisible();
      await provider.unmount();

      const instance = await renderWithProvider(
        <Banner title="Saved" onDismiss={() => undefined} messages={{ dismiss: 'Hide' }} />,
        { messages: { Banner: { dismiss: 'Close notice' } } },
      );
      await expect.element(instance.getByRole('button', { name: 'Hide' })).toBeVisible();
    });
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<Banner ref={ref} className="extra" id="b1" title="Saved" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('b1');
  });

  it('has no axe violations in any tone or configuration', async () => {
    const screen = await renderWithProvider(
      <main>
        {TONES.map((tone) => (
          <Banner
            key={tone}
            tone={tone}
            title={`${tone} title`}
            action={<a href="#more">Learn more</a>}
            onDismiss={() => undefined}
          >
            Detail for the {tone} banner.
          </Banner>
        ))}
        <Banner tone="danger" urgent title="Urgent" />
        <Banner announce>Announced banner</Banner>
        <Banner>Static banner</Banner>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
