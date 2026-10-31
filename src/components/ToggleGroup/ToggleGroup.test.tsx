import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { StarIcon } from '../Icon';
import { Toggle } from '../Toggle';
import { ToggleGroup } from './ToggleGroup';
import type { ToggleGroupProps } from './ToggleGroup';

function Example(props: Partial<ToggleGroupProps>) {
  return (
    <>
      <button type="button">Before</button>
      <ToggleGroup aria-label="Text formatting" {...props}>
        <Toggle id="bold">Bold</Toggle>
        <Toggle id="italic">Italic</Toggle>
        <Toggle id="underline">Underline</Toggle>
      </ToggleGroup>
      <button type="button">After</button>
    </>
  );
}

describe('ToggleGroup', () => {
  describe('rendering and ARIA (multiple)', () => {
    it('is a named toolbar of buttons with aria-pressed', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeVisible();
      const bold = screen.getByRole('button', { name: 'Bold' });
      expect(bold.element().getAttribute('aria-pressed')).toBe('false');
      expect(screen.getByRole('button', { name: /Bold|Italic|Underline/ }).elements()).toHaveLength(
        3,
      );
    });

    it('starts with defaultValue pressed', async () => {
      const screen = await renderWithProvider(<Example defaultValue={['bold', 'underline']} />);
      await expect
        .element(screen.getByRole('button', { name: 'Bold' }))
        .toHaveAttribute('aria-pressed', 'true');
      await expect
        .element(screen.getByRole('button', { name: 'Italic' }))
        .toHaveAttribute('aria-pressed', 'false');
      await expect
        .element(screen.getByRole('button', { name: 'Underline' }))
        .toHaveAttribute('aria-pressed', 'true');
    });

    it('can be named by another element', async () => {
      const screen = await renderWithProvider(
        <>
          <span id="g">Filters</span>
          <ToggleGroup aria-labelledby="g">
            <Toggle id="a">A</Toggle>
          </ToggleGroup>
        </>,
      );
      await expect.element(screen.getByRole('toolbar', { name: 'Filters' })).toBeVisible();
    });

    it('hands variant and size down to toggles, which can still override them', async () => {
      const screen = await renderWithProvider(
        <ToggleGroup aria-label="Group" variant="ghost" size="sm">
          <Toggle id="a">A</Toggle>
          <Toggle id="b" variant="secondary" size="lg">
            B
          </Toggle>
        </ToggleGroup>,
      );
      const a = screen.getByRole('button', { name: 'A' }).element();
      const b = screen.getByRole('button', { name: 'B' }).element();
      expect([a.getAttribute('data-variant'), a.getAttribute('data-size')]).toEqual([
        'ghost',
        'sm',
      ]);
      expect([b.getAttribute('data-variant'), b.getAttribute('data-size')]).toEqual([
        'secondary',
        'lg',
      ]);
    });

    it('lays toggles out in a column when vertical', async () => {
      const screen = await renderWithProvider(<Example orientation="vertical" />);
      const bold = screen.getByRole('button', { name: 'Bold' }).element().getBoundingClientRect();
      const italic = screen
        .getByRole('button', { name: 'Italic' })
        .element()
        .getBoundingClientRect();
      expect(italic.top).toBeGreaterThan(bold.bottom - 1);
      expect(screen.getByRole('toolbar').element().getAttribute('aria-orientation')).toBe(
        'vertical',
      );
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <ToggleGroup ref={ref} aria-label="Group" className="extra" data-testid="g">
          <Toggle id="a">A</Toggle>
        </ToggleGroup>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('g');
    });
  });

  describe('keyboard contract', () => {
    it('has a single tab stop and moves with the arrow keys', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Bold' })).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('button', { name: 'Italic' })).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}{ArrowRight}');
      await expect.element(screen.getByRole('button', { name: 'Underline' })).toHaveFocus();
      await userEvent.keyboard('{ArrowLeft}');
      await expect.element(screen.getByRole('button', { name: 'Italic' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('moves with the vertical arrow keys when vertical', async () => {
      const screen = await renderWithProvider(<Example orientation="vertical" />);
      await userEvent.keyboard('{Tab}{Tab}');
      await userEvent.keyboard('{ArrowDown}');
      await expect.element(screen.getByRole('button', { name: 'Italic' })).toHaveFocus();
      await userEvent.keyboard('{ArrowUp}');
      await expect.element(screen.getByRole('button', { name: 'Bold' })).toHaveFocus();
    });

    it('presses several toggles independently with Space and Enter', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      await userEvent.keyboard('{Tab}{Tab} ');
      expect(onChange).toHaveBeenLastCalledWith(['bold']);
      await userEvent.keyboard('{ArrowRight}{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(['bold', 'italic']);
      await expect
        .element(screen.getByRole('button', { name: 'Bold' }))
        .toHaveAttribute('aria-pressed', 'true');
      await userEvent.keyboard('{ArrowLeft} ');
      expect(onChange).toHaveBeenLastCalledWith(['italic']);
    });

    it('skips disabled toggles', async () => {
      const screen = await renderWithProvider(
        <ToggleGroup aria-label="Group">
          <Toggle id="a">A</Toggle>
          <Toggle id="b" isDisabled>
            B
          </Toggle>
          <Toggle id="c">C</Toggle>
        </ToggleGroup>,
      );
      await userEvent.keyboard('{Tab}{ArrowRight}');
      await expect.element(screen.getByRole('button', { name: 'C' })).toHaveFocus();
    });

    it('disables every toggle with isDisabled', async () => {
      const screen = await renderWithProvider(<Example isDisabled />);
      await expect.element(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
      await expect.element(screen.getByRole('button', { name: 'Underline' })).toBeDisabled();
    });
  });

  describe('single selection', () => {
    it('is a radio group where pressing another toggle releases the first', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example selectionMode="single" defaultValue={['bold']} onChange={onChange} />,
      );
      await expect
        .element(screen.getByRole('radiogroup', { name: 'Text formatting' }))
        .toBeVisible();
      await expect.element(screen.getByRole('radio', { name: 'Bold' })).toBeChecked();
      await userEvent.click(screen.getByRole('radio', { name: 'Italic' }));
      expect(onChange).toHaveBeenLastCalledWith(['italic']);
      await expect.element(screen.getByRole('radio', { name: 'Bold' })).not.toBeChecked();
    });

    it('can become empty unless disallowEmptySelection is set', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example selectionMode="single" defaultValue={['bold']} onChange={onChange} />,
      );
      await userEvent.click(screen.getByRole('radio', { name: 'Bold' }));
      expect(onChange).toHaveBeenLastCalledWith([]);
      await screen.unmount();

      const locked = vi.fn();
      const second = await renderWithProvider(
        <Example
          selectionMode="single"
          defaultValue={['bold']}
          onChange={locked}
          disallowEmptySelection
        />,
      );
      await userEvent.click(second.getByRole('radio', { name: 'Bold' }));
      expect(locked).not.toHaveBeenCalled();
      await expect.element(second.getByRole('radio', { name: 'Bold' })).toBeChecked();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('follows clicks when uncontrolled', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.click(screen.getByRole('button', { name: 'Italic' }));
      await expect
        .element(screen.getByRole('button', { name: 'Italic' }))
        .toHaveAttribute('aria-pressed', 'true');
    });

    it('stays put when controlled and the parent does not update', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example value={['bold']} onChange={onChange} />);
      await userEvent.click(screen.getByRole('button', { name: 'Italic' }));
      expect(onChange).toHaveBeenCalledWith(['bold', 'italic']);
      await expect
        .element(screen.getByRole('button', { name: 'Italic' }))
        .toHaveAttribute('aria-pressed', 'false');
    });

    it('follows a state owned by the parent', async () => {
      function Parent() {
        const [value, setValue] = useState<string[]>([]);
        return (
          <>
            <Example value={value} onChange={setValue} />
            <p>Pressed: {value.join(', ') || 'none'}</p>
          </>
        );
      }
      const screen = await renderWithProvider(<Parent />);
      await userEvent.click(screen.getByRole('button', { name: 'Underline' }));
      await userEvent.click(screen.getByRole('button', { name: 'Bold' }));
      await expect.element(screen.getByText('Pressed: underline, bold')).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example defaultValue={['italic']} />
          <ToggleGroup aria-label="Icons" variant="ghost">
            <Toggle id="fav" icon={StarIcon} label="Favorite" />
            <Toggle id="pin" icon={StarIcon} label="Pinned" />
          </ToggleGroup>
          <ToggleGroup aria-label="Mode" selectionMode="single" orientation="vertical">
            <Toggle id="a">A</Toggle>
            <Toggle id="b">B</Toggle>
          </ToggleGroup>
        </main>,
      );
      await userEvent.keyboard('{Tab}{Tab}');
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when disabled (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example isDisabled defaultValue={['bold']} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
