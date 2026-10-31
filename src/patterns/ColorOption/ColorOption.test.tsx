import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ColorOption } from './ColorOption';
import type { ColorOptionProps } from './ColorOption';

function Example(props: Partial<ColorOptionProps>) {
  return (
    <>
      <button type="button">Before</button>
      <ColorOption color="#1f3a93" label="Navy" {...props} />
      <button type="button">After</button>
    </>
  );
}

describe('ColorOption', () => {
  describe('rendering and ARIA', () => {
    it('is a toggle button named by its label, with a decorative swatch', async () => {
      const screen = await renderWithProvider(<Example />);
      const button = screen.getByRole('button', { name: 'Navy' });
      await expect.element(button).toBeVisible();
      await expect.element(button).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('img').elements()).toHaveLength(0);
    });

    it('exposes the selected state with aria-pressed and a visible check', async () => {
      const screen = await renderWithProvider(<Example defaultSelected />);
      const button = screen.getByRole('button', { name: 'Navy' });
      await expect.element(button).toHaveAttribute('aria-pressed', 'true');
      expect(button.element().querySelector('svg')).not.toBeNull();
    });

    it('shows no check while it is not selected', async () => {
      const screen = await renderWithProvider(<Example />);
      expect(
        screen.getByRole('button', { name: 'Navy' }).element().querySelector('svg'),
      ).toBeNull();
    });

    it('shows the mark in the name instead of the check', async () => {
      const screen = await renderWithProvider(<Example mark="Default" defaultSelected />);
      const button = screen.getByRole('button', { name: 'Navy Default' });
      await expect.element(button).toBeVisible();
      expect(button.element().querySelector('svg')).toBeNull();
    });

    it('paints the swatch with the given color', async () => {
      const screen = await renderWithProvider(<Example color="#ff0000" />);
      const swatch = screen
        .getByRole('button', { name: 'Navy' })
        .element()
        .querySelector('[aria-hidden="true"]');
      expect(getComputedStyle(swatch as Element).backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('truncates a long label instead of overflowing', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 160 }}>
          <ColorOption
            color="#1f3a93"
            label="Midnight navy blue with a very long marketing name"
            mark="Default"
          />
        </div>,
      );
      const button = screen.getByRole('button').element();
      expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLButtonElement>();
      await renderWithProvider(
        <ColorOption ref={ref} color="#fff" label="White" className="extra" data-testid="o" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('o');
    });
  });

  describe('keyboard and pointer', () => {
    it('toggles with click, Enter and Space', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      const button = screen.getByRole('button', { name: 'Navy' });
      await userEvent.click(button);
      expect(onChange).toHaveBeenLastCalledWith(true);
      button.element().focus();
      await userEvent.keyboard('{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(false);
      await userEvent.keyboard(' ');
      expect(onChange).toHaveBeenLastCalledWith(true);
    });

    it('has one tab stop per option', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Navy' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('ignores a disabled option', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example isDisabled onChange={onChange} />);
      await expect.element(screen.getByRole('button', { name: 'Navy' })).toBeDisabled();
      await userEvent.click(screen.getByRole('button', { name: 'Navy' }), { force: true });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('toggles itself when uncontrolled', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.click(screen.getByRole('button', { name: 'Navy' }));
      await expect
        .element(screen.getByRole('button', { name: 'Navy' }))
        .toHaveAttribute('aria-pressed', 'true');
    });

    it('stays put when controlled and the parent does not update', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example isSelected={false} onChange={onChange} />);
      await userEvent.click(screen.getByRole('button', { name: 'Navy' }));
      expect(onChange).toHaveBeenCalledWith(true);
      await expect
        .element(screen.getByRole('button', { name: 'Navy' }))
        .toHaveAttribute('aria-pressed', 'false');
    });

    it('works as several independent options in a group', async () => {
      function Group() {
        const [selected, setSelected] = useState<string[]>(['red']);
        const toggle = (name: string) => (on: boolean) => {
          setSelected((current) => (on ? [...current, name] : current.filter((c) => c !== name)));
        };
        return (
          <div role="group" aria-label="Available colors">
            {[
              ['red', '#c0392b'],
              ['green', '#27ae60'],
            ].map(([name, hex]) => (
              <ColorOption
                key={name}
                color={hex ?? ''}
                label={name ?? ''}
                isSelected={selected.includes(name ?? '')}
                onChange={toggle(name ?? '')}
              />
            ))}
          </div>
        );
      }
      const screen = await renderWithProvider(<Group />);
      await userEvent.click(screen.getByRole('button', { name: 'green' }));
      await expect
        .element(screen.getByRole('button', { name: 'red' }))
        .toHaveAttribute('aria-pressed', 'true');
      await expect
        .element(screen.getByRole('button', { name: 'green' }))
        .toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <div role="group" aria-label="Colors">
            <ColorOption color="#1f3a93" label="Navy" />
            <ColorOption color="#c0392b" label="Brick" defaultSelected />
            <ColorOption color="#27ae60" label="Green" mark="3 left" />
            <ColorOption color="#000000" label="Black" isDisabled />
          </div>
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
