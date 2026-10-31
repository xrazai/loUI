import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Icon, StarIcon } from '../Icon';
import { Toggle } from './Toggle';

const height = (el: Element) => el.getBoundingClientRect().height;
const width = (el: Element) => el.getBoundingClientRect().width;

describe('Toggle', () => {
  describe('rendering and ARIA', () => {
    it('is a native button with aria-pressed, named by its label', async () => {
      const screen = await renderWithProvider(<Toggle>Show archived</Toggle>);
      const button = screen.getByRole('button', { name: 'Show archived' });
      expect(button.element().tagName).toBe('BUTTON');
      expect(button.element().getAttribute('aria-pressed')).toBe('false');
    });

    it('starts pressed with defaultSelected', async () => {
      const screen = await renderWithProvider(<Toggle defaultSelected>Bold</Toggle>);
      await expect
        .element(screen.getByRole('button', { name: 'Bold' }))
        .toHaveAttribute('aria-pressed', 'true');
    });

    it('requires a label for an icon-only toggle and uses it as the name', async () => {
      const screen = await renderWithProvider(<Toggle icon={StarIcon} label="Favorite" />);
      const button = screen.getByRole('button', { name: 'Favorite' });
      await expect.element(button).toBeVisible();
      expect(button.element().querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders a leading node before the label', async () => {
      const screen = await renderWithProvider(
        <Toggle leading={<Icon icon={StarIcon} size="sm" />}>Starred</Toggle>,
      );
      const button = screen.getByRole('button', { name: 'Starred' }).element();
      expect(button.querySelector('svg')).not.toBeNull();
      expect(button.textContent).toBe('Starred');
    });

    it('uses the control heights from the size tokens', async () => {
      const screen = await renderWithProvider(
        <>
          <Toggle size="sm">Small</Toggle>
          <Toggle size="md">Medium</Toggle>
          <Toggle size="lg">Large</Toggle>
        </>,
      );
      expect(height(screen.getByRole('button', { name: 'Small' }).element())).toBe(32);
      expect(height(screen.getByRole('button', { name: 'Medium' }).element())).toBe(40);
      expect(height(screen.getByRole('button', { name: 'Large' }).element())).toBe(48);
    });

    it('makes an icon-only toggle a square of the control height', async () => {
      const screen = await renderWithProvider(
        <>
          <Toggle icon={StarIcon} label="Small star" size="sm" />
          <Toggle icon={StarIcon} label="Large star" size="lg" />
        </>,
      );
      const small = screen.getByRole('button', { name: 'Small star' }).element();
      const large = screen.getByRole('button', { name: 'Large star' }).element();
      expect([width(small), height(small)]).toEqual([32, 32]);
      expect([width(large), height(large)]).toEqual([48, 48]);
    });

    it('exposes variant and size as data attributes', async () => {
      const screen = await renderWithProvider(
        <Toggle variant="ghost" size="sm">
          Ghost
        </Toggle>,
      );
      const button = screen.getByRole('button', { name: 'Ghost' }).element();
      expect(button.getAttribute('data-variant')).toBe('ghost');
      expect(button.getAttribute('data-size')).toBe('sm');
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLButtonElement>();
      await renderWithProvider(
        <Toggle ref={ref} className="extra" id="t1" data-testid="toggle">
          Bold
        </Toggle>,
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.id).toBe('t1');
      expect(ref.current?.getAttribute('data-testid')).toBe('toggle');
    });

    it('shows the label in a tooltip on keyboard focus when tooltip is set', async () => {
      const screen = await renderWithProvider(<Toggle icon={StarIcon} label="Favorite" tooltip />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('tooltip')).toHaveTextContent('Favorite');
    });
  });

  describe('keyboard and pointer', () => {
    it('toggles with Space and Enter', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Toggle onChange={onChange}>Bold</Toggle>);
      const button = screen.getByRole('button', { name: 'Bold' });
      await userEvent.keyboard('{Tab}');
      await expect.element(button).toHaveFocus();
      await userEvent.keyboard(' ');
      await expect.element(button).toHaveAttribute('aria-pressed', 'true');
      expect(onChange).toHaveBeenLastCalledWith(true);
      await userEvent.keyboard('{Enter}');
      await expect.element(button).toHaveAttribute('aria-pressed', 'false');
      expect(onChange).toHaveBeenLastCalledWith(false);
    });

    it('toggles on click', async () => {
      const screen = await renderWithProvider(<Toggle>Bold</Toggle>);
      const button = screen.getByRole('button', { name: 'Bold' });
      await userEvent.click(button);
      await expect.element(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('ignores press and focus when disabled', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <>
          <Toggle isDisabled onChange={onChange}>
            Locked
          </Toggle>
          <button type="button">After</button>
        </>,
      );
      await expect.element(screen.getByRole('button', { name: 'Locked' })).toBeDisabled();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('stays put when controlled and the parent does not update', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Toggle isSelected={false} onChange={onChange}>
          Bold
        </Toggle>,
      );
      const button = screen.getByRole('button', { name: 'Bold' });
      await userEvent.click(button);
      expect(onChange).toHaveBeenCalledWith(true);
      await expect.element(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('follows a state owned by the parent', async () => {
      function Parent() {
        const [on, setOn] = useState(false);
        return (
          <Toggle isSelected={on} onChange={setOn}>
            Bold
          </Toggle>
        );
      }
      const screen = await renderWithProvider(<Parent />);
      const button = screen.getByRole('button', { name: 'Bold' });
      await userEvent.click(button);
      await expect.element(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations in every variant, size and state (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Toggle>Secondary</Toggle>
          <Toggle defaultSelected>Pressed</Toggle>
          <Toggle variant="ghost">Ghost</Toggle>
          <Toggle variant="ghost" defaultSelected>
            Ghost pressed
          </Toggle>
          <Toggle size="sm">Small</Toggle>
          <Toggle size="lg" isDisabled>
            Disabled
          </Toggle>
          <Toggle icon={StarIcon} label="Favorite" />
          <Toggle icon={StarIcon} label="Favorite pinned" defaultSelected variant="ghost" />
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
