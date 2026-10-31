import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Icon, PlusIcon } from '../Icon';
import { Kbd } from '../Kbd';
import { Button } from './Button';

const height = (el: Element) => el.getBoundingClientRect().height;
const width = (el: Element) => el.getBoundingClientRect().width;

/** WCAG contrast ratio between two opaque `rgb()` computed colors. */
function contrast(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const [r = 0, g = 0, b = 0] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((channel) => {
      const value = Number(channel) / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

describe('Button', () => {
  describe('rendering', () => {
    it('renders a native button of type "button" named by its label', async () => {
      const screen = await renderWithProvider(<Button>Create order</Button>);
      const button = screen.getByRole('button', { name: 'Create order' });
      await expect.element(button).toBeInTheDocument();
      expect(button.element().tagName).toBe('BUTTON');
      expect(button.element().getAttribute('type')).toBe('button');
    });

    it('supports type="submit" inside a form', async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => {
        event.preventDefault();
      });
      const screen = await renderWithProvider(
        <form
          onSubmit={(event) => {
            onSubmit(event.nativeEvent);
          }}
        >
          <Button type="submit">Save</Button>
        </form>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it.each(['primary', 'secondary', 'ghost', 'danger', 'danger-solid'] as const)(
      'exposes variant %s as a data attribute',
      async (variant) => {
        const screen = await renderWithProvider(<Button variant={variant}>Label</Button>);
        expect(screen.getByRole('button').element().getAttribute('data-variant')).toBe(variant);
      },
    );

    it('defaults to the secondary variant and md size', async () => {
      const screen = await renderWithProvider(<Button>Label</Button>);
      const el = screen.getByRole('button').element();
      expect(el.getAttribute('data-variant')).toBe('secondary');
      expect(el.getAttribute('data-size')).toBe('md');
    });

    it.each([
      ['sm', 32],
      ['md', 40],
      ['lg', 48],
    ] as const)('size %s is %i px tall (control tokens)', async (size, px) => {
      const screen = await renderWithProvider(<Button size={size}>Label</Button>);
      expect(height(screen.getByRole('button').element())).toBe(px);
    });

    it('keeps the 24px minimum target on every size', async () => {
      const screen = await renderWithProvider(<Button size="sm">x</Button>);
      const rect = screen.getByRole('button').element().getBoundingClientRect();
      expect(rect.height).toBeGreaterThanOrEqual(24);
      expect(rect.width).toBeGreaterThanOrEqual(24);
    });

    it('renders leading and trailing slots around the label', async () => {
      const screen = await renderWithProvider(
        <Button
          leading={<Icon icon={PlusIcon} size="sm" data-testid="lead" />}
          trailing={<span data-testid="trail">⌘K</span>}
        >
          Create order
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Create order ⌘K' });
      const text = button.element().textContent;
      expect(text).toBe('Create order⌘K');
      const lead = button.element().querySelector('[data-testid="lead"]');
      const trail = button.element().querySelector('[data-testid="trail"]');
      expect(lead && trail).toBeTruthy();
      expect(lead?.compareDocumentPosition(trail as Element)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    it('stretches to the container with fullWidth', async () => {
      const screen = await renderWithProvider(
        <div style={{ width: 320 }}>
          <Button fullWidth>Label</Button>
        </div>,
      );
      expect(width(screen.getByRole('button').element())).toBe(320);
    });

    it('wraps long labels instead of overflowing', async () => {
      const screen = await renderWithProvider(
        <div style={{ width: 160 }}>
          <Button>Create order and notify the customer and the warehouse</Button>
        </div>,
      );
      const el = screen.getByRole('button').element();
      expect(width(el)).toBeLessThanOrEqual(160);
      expect(height(el)).toBeGreaterThan(40);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLButtonElement>();
      await renderWithProvider(
        <Button ref={ref} className="extra" data-testid="b" aria-describedby="hint">
          Label
        </Button>,
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('b');
      expect(ref.current?.getAttribute('aria-describedby')).toBe('hint');
    });
  });

  describe('styling states are CSS', () => {
    it('dims the primary button on hover through the brightness token', async () => {
      const screen = await renderWithProvider(<Button variant="primary">Label</Button>);
      const button = screen.getByRole('button');
      expect(getComputedStyle(button.element()).filter).toBe('none');
      await userEvent.hover(button);
      // RAC sets `data-hovered` after the pointer event is handled, so poll instead of reading once.
      await expect.poll(() => getComputedStyle(button.element()).filter).toBe('brightness(0.88)');
    });

    it('does not apply hover styling to a disabled button', async () => {
      const screen = await renderWithProvider(
        <Button variant="primary" isDisabled>
          Label
        </Button>,
      );
      const button = screen.getByRole('button');
      await userEvent.hover(button, { force: true });
      expect(getComputedStyle(button.element()).filter).toBe('none');
    });

    it('shows the focus ring only for keyboard focus', async () => {
      const screen = await renderWithProvider(<Button>Label</Button>);
      const button = screen.getByRole('button').element();
      await userEvent.click(screen.getByRole('button'));
      expect(button.hasAttribute('data-focus-visible')).toBe(false);
      button.blur();
      await userEvent.keyboard('{Tab}');
      expect(button.hasAttribute('data-focus-visible')).toBe(true);
      expect(getComputedStyle(button).boxShadow).not.toBe('none');
    });
  });

  describe('keyboard and pointer contract', () => {
    it('is a single tab stop activated by Enter and Space', async () => {
      const onPress = vi.fn();
      const screen = await renderWithProvider(<Button onPress={onPress}>Label</Button>);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button')).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onPress).toHaveBeenCalledTimes(1);
      await userEvent.keyboard(' ');
      expect(onPress).toHaveBeenCalledTimes(2);
    });

    it('presses on click', async () => {
      const onPress = vi.fn();
      const screen = await renderWithProvider(<Button onPress={onPress}>Label</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('ignores presses and skips the tab order when disabled', async () => {
      const onPress = vi.fn();
      const screen = await renderWithProvider(
        <>
          <Button isDisabled onPress={onPress}>
            Disabled
          </Button>
          <Button>Next</Button>
        </>,
      );
      expect(screen.getByRole('button', { name: 'Disabled' }).element()).toHaveProperty(
        'disabled',
        true,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Disabled' }), { force: true });
      expect(onPress).not.toHaveBeenCalled();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    });

    it('dims a disabled button with the disabled opacity token', async () => {
      const screen = await renderWithProvider(<Button isDisabled>Label</Button>);
      expect(getComputedStyle(screen.getByRole('button').element()).opacity).toBe('0.35');
    });
  });

  describe('pending', () => {
    it('keeps its width, stays focusable and ignores presses', async () => {
      const onPress = vi.fn();
      const view = await renderWithProvider(<Button onPress={onPress}>Save changes</Button>);
      const idleWidth = width(view.getByRole('button').element());
      await view.rerender(
        <Button onPress={onPress} isPending>
          Save changes
        </Button>,
      );
      const button = view.getByRole('button');
      expect(width(button.element())).toBe(idleWidth);
      expect(button.element().getAttribute('aria-disabled')).toBe('true');
      expect(button.element().hasAttribute('data-pending')).toBe(true);
      await userEvent.keyboard('{Tab}');
      await expect.element(button).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await userEvent.click(button, { force: true });
      expect(onPress).not.toHaveBeenCalled();
    });

    it('renders a named spinner inside the busy button', async () => {
      const screen = await renderWithProvider(<Button isPending>Save changes</Button>);
      const button = screen.getByRole('button', { name: /Save changes/ }).element();
      const bar = screen.getByRole('progressbar', { name: 'Loading' }).element();
      expect(button.contains(bar)).toBe(true);
    });

    it('translates the spinner name to pt-BR', async () => {
      const screen = await renderWithProvider(<Button isPending>Salvar</Button>, {
        locale: 'pt-BR',
      });
      await expect
        .element(screen.getByRole('progressbar', { name: 'Carregando' }))
        .toBeInTheDocument();
    });

    it('accepts a provider override of the busy message', async () => {
      const screen = await renderWithProvider(<Button isPending>Save</Button>, {
        messages: { Spinner: { loading: 'Saving' } },
      });
      await expect.element(screen.getByRole('progressbar', { name: 'Saving' })).toBeInTheDocument();
    });

    it('does not submit a form while pending', async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => {
        event.preventDefault();
      });
      const screen = await renderWithProvider(
        <form
          onSubmit={(event) => {
            onSubmit(event.nativeEvent);
          }}
        >
          <input aria-label="Name" />
          <input aria-label="Email" />
          <Button type="submit" isPending>
            Save
          </Button>
        </form>,
      );
      await userEvent.click(screen.getByRole('textbox', { name: 'Name' }));
      await userEvent.keyboard('{Enter}');
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations in every variant and size', async () => {
      const screen = await renderWithProvider(
        <main>
          {(['primary', 'secondary', 'ghost', 'danger', 'danger-solid'] as const).map((variant) =>
            (['sm', 'md', 'lg'] as const).map((size) => (
              <Button key={`${variant}-${size}`} variant={variant} size={size}>
                {`${variant} ${size}`}
              </Button>
            )),
          )}
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('keeps a Kbd hint readable on the primary and danger-solid fills', async () => {
      // Regression: the keycap kept its light text color on the light primary fill (2.13:1).
      const screen = await renderWithProvider(
        <main>
          <Button variant="primary" trailing={<Kbd keys={['N']} />}>
            Create order
          </Button>
          <Button variant="danger-solid" trailing={<Kbd keys={['D']} />}>
            Delete order
          </Button>
        </main>,
      );
      for (const key of screen.container.querySelectorAll('kbd')) {
        const button = key.closest('button');
        if (!button) throw new Error('Kbd is not inside a button');
        const ratio = contrast(
          getComputedStyle(key).color,
          getComputedStyle(button).backgroundColor,
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations with icons', async () => {
      const screen = await renderWithProvider(
        <main>
          <Button leading={<Icon icon={PlusIcon} size="sm" />}>Create order</Button>
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when disabled', async () => {
      const screen = await renderWithProvider(
        <main>
          <Button isDisabled>Disabled</Button>
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when pending', async () => {
      const screen = await renderWithProvider(
        <main>
          <Button isPending variant="primary">
            Save changes
          </Button>
          <Button isPending variant="danger-solid">
            Delete order
          </Button>
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when focused', async () => {
      const screen = await renderWithProvider(
        <main>
          <Button variant="primary">Focus me</Button>
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
