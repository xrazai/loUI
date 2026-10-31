import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { contrastRatio } from '../../utils/color';
import { Alert } from './Alert';
import type { AlertTone } from './Alert';

const TONES: AlertTone[] = ['info', 'success', 'warning', 'danger'];

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

describe('Alert', () => {
  it('renders the title and the text', async () => {
    const screen = await renderWithProvider(
      <Alert title="Scheduled maintenance">Sunday, 02:00 to 03:00 UTC.</Alert>,
    );
    await expect.element(screen.getByText('Scheduled maintenance')).toBeVisible();
    await expect.element(screen.getByText('Sunday, 02:00 to 03:00 UTC.')).toBeVisible();
  });

  it('works without a title or without text', async () => {
    const screen = await renderWithProvider(
      <>
        <Alert>Only text</Alert>
        <Alert title="Only title" />
      </>,
    );
    await expect.element(screen.getByText('Only text')).toBeVisible();
    await expect.element(screen.getByText('Only title')).toBeVisible();
  });

  describe('live region semantics', () => {
    it('is a polite status by default', async () => {
      const screen = await renderWithProvider(<Alert title="Saved" />);
      await expect.element(screen.getByRole('status')).toBeVisible();
      expect(screen.getByRole('alert').elements()).toHaveLength(0);
    });

    it('is an alert only when urgent', async () => {
      const screen = await renderWithProvider(
        <Alert tone="danger" urgent title="Payment declined" />,
      );
      await expect.element(screen.getByRole('alert')).toBeVisible();
      expect(screen.getByRole('status').elements()).toHaveLength(0);
    });

    it('does not make a danger alert urgent by itself', async () => {
      const screen = await renderWithProvider(<Alert tone="danger" title="Payment declined" />);
      expect(screen.getByRole('alert').elements()).toHaveLength(0);
      await expect.element(screen.getByRole('status')).toBeVisible();
    });

    it('has no role when announce is false', async () => {
      const screen = await renderWithProvider(<Alert announce={false} title="Static notice" />);
      expect(screen.getByRole('status').elements()).toHaveLength(0);
      expect(screen.getByRole('alert').elements()).toHaveLength(0);
    });
  });

  it.each(TONES)(
    'prefixes the %s alert with a visually hidden tone name and a decorative icon',
    async (tone) => {
      const names = {
        info: 'Information',
        success: 'Success',
        warning: 'Warning',
        danger: 'Error',
      };
      const screen = await renderWithProvider(<Alert tone={tone} title="Title" />);
      const root = screen.getByRole('status').element();
      expect(root.textContent).toContain(`${names[tone]} Title`);
      const svg = root.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(root.getAttribute('data-tone')).toBe(tone);
    },
  );

  it.each(TONES)('keeps text contrast at 4.5:1 or more on the %s tint', async (tone) => {
    const screen = await renderWithProvider(
      <Alert tone={tone} title="Title">
        Detail text
      </Alert>,
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
      <Alert title="Payment declined" action={<a href="#card">Update card</a>} />,
    );
    await expect.element(screen.getByRole('link', { name: 'Update card' })).toBeVisible();
  });

  describe('dismiss', () => {
    it('has no dismiss button without onDismiss', async () => {
      const screen = await renderWithProvider(<Alert title="Saved" />);
      expect(screen.getByRole('button').elements()).toHaveLength(0);
    });

    it('calls onDismiss from the button, with the pointer and the keyboard', async () => {
      const onDismiss = vi.fn();
      const screen = await renderWithProvider(<Alert title="Saved" onDismiss={onDismiss} />);
      const button = screen.getByRole('button', { name: 'Dismiss alert' });
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
      const screen = await renderWithProvider(<Alert title="Saved" onDismiss={() => undefined} />);
      const rect = screen
        .getByRole('button', { name: 'Dismiss alert' })
        .element()
        .getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(24);
      expect(rect.height).toBeGreaterThanOrEqual(24);
    });
  });

  describe('messages', () => {
    it('uses the pt-BR catalog', async () => {
      const screen = await renderWithProvider(
        <Alert tone="danger" title="Pagamento recusado" onDismiss={() => undefined} />,
        { locale: 'pt-BR' },
      );
      await expect.element(screen.getByRole('button', { name: 'Dispensar alerta' })).toBeVisible();
      expect(screen.getByRole('status').element().textContent).toContain('Erro Pagamento recusado');
    });

    it('applies provider and instance overrides', async () => {
      const provider = await renderWithProvider(
        <Alert title="Saved" onDismiss={() => undefined} />,
        {
          messages: { Alert: { dismiss: 'Close notice' } },
        },
      );
      await expect.element(provider.getByRole('button', { name: 'Close notice' })).toBeVisible();
      await provider.unmount();

      const instance = await renderWithProvider(
        <Alert title="Saved" onDismiss={() => undefined} messages={{ dismiss: 'Hide' }} />,
        { messages: { Alert: { dismiss: 'Close notice' } } },
      );
      await expect.element(instance.getByRole('button', { name: 'Hide' })).toBeVisible();
    });
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<Alert ref={ref} className="extra" id="a1" title="Saved" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('a1');
  });

  it('has no axe violations in any tone or configuration', async () => {
    const screen = await renderWithProvider(
      <main>
        {TONES.map((tone) => (
          <Alert
            key={tone}
            tone={tone}
            title={`${tone} title`}
            action={<a href="#more">Learn more</a>}
            onDismiss={() => undefined}
          >
            Detail for the {tone} alert.
          </Alert>
        ))}
        <Alert tone="danger" urgent title="Urgent" />
        <Alert announce={false}>Static notice</Alert>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
