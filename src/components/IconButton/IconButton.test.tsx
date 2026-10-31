import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { PlusIcon } from '../Icon';
import { IconButton } from './IconButton';

const rect = (el: Element) => el.getBoundingClientRect();

describe('IconButton', () => {
  it('is a native button named by `label` through aria-label, with no title', async () => {
    const screen = await renderWithProvider(<IconButton label="Add order" icon={PlusIcon} />);
    const button = screen.getByRole('button', { name: 'Add order' });
    await expect.element(button).toBeInTheDocument();
    expect(button.element().tagName).toBe('BUTTON');
    expect(button.element().getAttribute('type')).toBe('button');
    expect(button.element().getAttribute('aria-label')).toBe('Add order');
    expect(button.element().hasAttribute('title')).toBe(false);
  });

  it('requires a label at the type level', () => {
    // @ts-expect-error `label` is required: an icon-only control needs an accessible name.
    const missing = <IconButton icon={PlusIcon} />;
    expect(missing).toBeTruthy();
  });

  it('draws a decorative SVG icon, not a text glyph', async () => {
    const screen = await renderWithProvider(<IconButton label="Add order" icon={PlusIcon} />);
    const button = screen.getByRole('button').element();
    const svg = button.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(button.textContent).toBe('');
  });

  it.each([
    ['sm', 32, 14],
    ['md', 40, 18],
    ['lg', 48, 20],
  ] as const)('size %s is a %i px square with a %i px icon', async (size, px, iconPx) => {
    const screen = await renderWithProvider(
      <IconButton label="Add order" icon={PlusIcon} size={size} />,
    );
    const button = screen.getByRole('button').element();
    expect(rect(button).width).toBe(px);
    expect(rect(button).height).toBe(px);
    expect(rect(button.querySelector('svg') as SVGSVGElement).width).toBe(iconPx);
  });

  it('keeps at least the minimum 24px target at every size', async () => {
    const screen = await renderWithProvider(
      <IconButton label="Add order" icon={PlusIcon} size="sm" />,
    );
    const box = rect(screen.getByRole('button').element());
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
  });

  it.each(['secondary', 'ghost'] as const)('exposes variant %s', async (variant) => {
    const screen = await renderWithProvider(
      <IconButton label="Add order" icon={PlusIcon} variant={variant} />,
    );
    expect(screen.getByRole('button').element().getAttribute('data-variant')).toBe(variant);
  });

  it('changes the ghost background on hover through CSS', async () => {
    const screen = await renderWithProvider(
      <IconButton label="Add order" icon={PlusIcon} variant="ghost" />,
    );
    const button = screen.getByRole('button');
    expect(getComputedStyle(button.element()).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await userEvent.hover(button);
    // The background fades in over --ds-duration, so poll until it settles.
    await expect
      .poll(() => getComputedStyle(button.element()).backgroundColor)
      .not.toBe('rgba(0, 0, 0, 0)');
  });

  it('is activated by Enter and Space and is a single tab stop', async () => {
    const onPress = vi.fn();
    const screen = await renderWithProvider(
      <IconButton label="Add order" icon={PlusIcon} onPress={onPress} />,
    );
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('ignores presses and leaves the tab order when disabled', async () => {
    const onPress = vi.fn();
    const screen = await renderWithProvider(
      <IconButton label="Add order" icon={PlusIcon} isDisabled onPress={onPress} />,
    );
    await userEvent.click(screen.getByRole('button'), { force: true });
    expect(onPress).not.toHaveBeenCalled();
    expect(getComputedStyle(screen.getByRole('button').element()).opacity).toBe('0.35');
  });

  it('merges className, forwards the ref and passes other props through', async () => {
    const ref = createRef<HTMLButtonElement>();
    await renderWithProvider(
      <IconButton
        ref={ref}
        label="Add order"
        icon={PlusIcon}
        className="extra"
        data-testid="ib"
        aria-describedby="hint"
      />,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.getAttribute('data-testid')).toBe('ib');
    expect(ref.current?.getAttribute('aria-describedby')).toBe('hint');
  });

  it('uses the label as given, so consumers translate it', async () => {
    const screen = await renderWithProvider(
      <IconButton label="Adicionar pedido" icon={PlusIcon} />,
      {
        locale: 'pt-BR',
      },
    );
    await expect.element(screen.getByRole('button', { name: 'Adicionar pedido' })).toBeVisible();
  });

  it('has no axe violations in every variant, size and state', async () => {
    const screen = await renderWithProvider(
      <main>
        {(['secondary', 'ghost'] as const).map((variant) =>
          (['sm', 'md', 'lg'] as const).map((size) => (
            <IconButton
              key={`${variant}-${size}`}
              label={`Add order ${variant} ${size}`}
              icon={PlusIcon}
              variant={variant}
              size={size}
            />
          )),
        )}
        <IconButton label="Disabled action" icon={PlusIcon} isDisabled />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });

  it('has no axe violations when focused', async () => {
    const screen = await renderWithProvider(
      <main>
        <IconButton label="Add order" icon={PlusIcon} />
      </main>,
    );
    await userEvent.keyboard('{Tab}');
    await expectNoA11yViolations(screen.container);
  });
});
