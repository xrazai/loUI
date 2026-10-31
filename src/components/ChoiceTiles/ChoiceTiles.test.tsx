import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ChoiceTiles } from './ChoiceTiles';
import type { ChoiceTilesProps } from './ChoiceTiles';

const options = [
  { value: 'pickup', label: 'Pick up', meta: 'Free' },
  { value: 'standard', label: 'Standard', meta: '3-5 days' },
  { value: 'express', label: 'Express', meta: '1 day' },
  { value: 'freight', label: 'Freight' },
];

function Example(props: Partial<ChoiceTilesProps>) {
  return (
    <>
      <button type="button">Before</button>
      <ChoiceTiles label="Delivery" options={options} {...props} />
      <button type="button">After</button>
    </>
  );
}

describe('ChoiceTiles', () => {
  describe('rendering and ARIA', () => {
    it('is a radio group named by its label', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('radiogroup', { name: 'Delivery' })).toBeVisible();
      expect(screen.getByRole('radio').elements()).toHaveLength(4);
    });

    it('can be named by aria-label or aria-labelledby', async () => {
      const screen = await renderWithProvider(
        <>
          <ChoiceTiles aria-label="Shipping" options={options} />
          <span id="x">Pickup method</span>
          <ChoiceTiles aria-labelledby="x" options={options} />
        </>,
      );
      await expect.element(screen.getByRole('radiogroup', { name: 'Shipping' })).toBeVisible();
      await expect.element(screen.getByRole('radiogroup', { name: 'Pickup method' })).toBeVisible();
    });

    it('includes the meta line in the name of the option', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('radio', { name: 'Standard 3-5 days' })).toBeVisible();
    });

    it('starts on defaultValue and shows no selection otherwise', async () => {
      const screen = await renderWithProvider(
        <>
          <ChoiceTiles label="A" options={options} defaultValue="express" />
          <ChoiceTiles label="B" options={options} />
        </>,
      );
      const a = screen.getByRole('radiogroup', { name: 'A' });
      await expect.element(a.getByRole('radio', { name: /Express/ })).toBeChecked();
      const b = screen.getByRole('radiogroup', { name: 'B' });
      expect(b.getByRole('radio', { checked: true }).elements()).toHaveLength(0);
    });

    it('limits the columns and collapses on narrow containers', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 600 }} data-testid="wide">
          <ChoiceTiles label="Wide" options={options} columns={4} />
          <div style={{ inlineSize: 200 }}>
            <ChoiceTiles label="Narrow" options={options} columns={4} />
          </div>
        </div>,
      );
      const tops = (name: string) =>
        new Set(
          screen
            .getByRole('radiogroup', { name })
            .getByRole('radio')
            .elements()
            .map((element) => element.closest('label')?.getBoundingClientRect().top),
        ).size;
      expect(tops('Wide')).toBe(1);
      expect(tops('Narrow')).toBeGreaterThan(1);
    });

    it('uses the size tokens for the tile height', async () => {
      const screen = await renderWithProvider(
        <>
          <ChoiceTiles label="Large" options={options} />
          <ChoiceTiles label="Medium" options={options} size="md" />
        </>,
      );
      const height = (name: string) =>
        screen
          .getByRole('radiogroup', { name })
          .getByRole('radio')
          .first()
          .element()
          .closest('label')
          ?.getBoundingClientRect().height ?? 0;
      expect(height('Large')).toBeGreaterThanOrEqual(48);
      expect(height('Medium')).toBeGreaterThanOrEqual(40);
      expect(height('Medium')).toBeLessThan(height('Large'));
    });

    it('shows the description and the error', async () => {
      const screen = await renderWithProvider(
        <Example description="Pick one." isInvalid errorMessage="Choose a delivery method." />,
      );
      await expect.element(screen.getByText('Pick one.')).toBeVisible();
      await expect.element(screen.getByText('Choose a delivery method.')).toBeVisible();
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <ChoiceTiles
          ref={ref}
          label="Delivery"
          options={options}
          className="extra"
          data-testid="t"
        />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('t');
    });
  });

  describe('boundary contrast', () => {
    function luminance(rgb: string): number {
      const channels = (/rgba?\((\d+), (\d+), (\d+)/.exec(rgb) ?? []).slice(1, 4).map(Number);
      const [r = 0, g = 0, b = 0] = channels.map((value) => {
        const c = value / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    function ratio(a: string, b: string): number {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
    }

    it('keeps unselected and hovered tile borders at 3:1 against the page', async () => {
      const screen = await renderWithProvider(<Example />);
      const tile = screen
        .getByRole('radio', { name: /Pick up/ })
        .element()
        .closest('label');
      if (!tile) throw new Error('tile not found');
      const background = getComputedStyle(tile).backgroundColor;
      expect(ratio(getComputedStyle(tile).borderTopColor, background)).toBeGreaterThanOrEqual(3);
      await userEvent.hover(tile);
      expect(ratio(getComputedStyle(tile).borderTopColor, background)).toBeGreaterThanOrEqual(3);
    });
  });

  describe('keyboard contract', () => {
    it('has a single tab stop', async () => {
      const screen = await renderWithProvider(<Example defaultValue="standard" />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('radio', { name: /Standard/ })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('moves and selects with the arrows, wrapping at the ends', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      await userEvent.keyboard('{Tab}{Tab}');
      await expect.element(screen.getByRole('radio', { name: /Pick up/ })).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('radio', { name: /Standard/ })).toBeChecked();
      expect(onChange).toHaveBeenLastCalledWith('standard');
      await userEvent.keyboard('{ArrowDown}');
      await expect.element(screen.getByRole('radio', { name: /Express/ })).toBeChecked();
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
      await expect.element(screen.getByRole('radio', { name: /Pick up/ })).toBeChecked();
      await userEvent.keyboard('{ArrowUp}');
      await expect.element(screen.getByRole('radio', { name: 'Freight' })).toBeChecked();
    });

    it('selects the focused tile with Space', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}{Tab}');
      await userEvent.keyboard(' ');
      await expect.element(screen.getByRole('radio', { name: /Pick up/ })).toBeChecked();
    });

    it('skips disabled tiles', async () => {
      const screen = await renderWithProvider(
        <Example
          options={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B', isDisabled: true },
            { value: 'c', label: 'C' },
          ]}
        />,
      );
      await userEvent.keyboard('{Tab}{Tab}');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('radio', { name: 'C' })).toBeChecked();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('follows clicks when uncontrolled', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      await userEvent.click(screen.getByText('Express'));
      await expect.element(screen.getByRole('radio', { name: /Express/ })).toBeChecked();
      expect(onChange).toHaveBeenCalledWith('express');
    });

    it('stays put when controlled and the parent does not update', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example value="pickup" onChange={onChange} />);
      await userEvent.click(screen.getByText('Express'));
      expect(onChange).toHaveBeenCalledWith('express');
      await expect.element(screen.getByRole('radio', { name: /Pick up/ })).toBeChecked();
    });

    it('follows a state owned by the parent', async () => {
      function Parent() {
        const [value, setValue] = useState('pickup');
        return <Example value={value} onChange={setValue} />;
      }
      const screen = await renderWithProvider(<Parent />);
      await userEvent.click(screen.getByText('Freight'));
      await expect.element(screen.getByRole('radio', { name: 'Freight' })).toBeChecked();
    });
  });

  describe('i18n', () => {
    it('takes the required marker from the Field catalog, with a provider override', async () => {
      const screen = await renderWithProvider(<Example isRequired />, {
        locale: 'pt-BR',
        messages: { Field: { requiredMark: '(obrigatorio)' } },
      });
      await expect.element(screen.getByText('(obrigatorio)')).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example defaultValue="standard" description="Pick one." />
          <ChoiceTiles aria-label="Size" size="md" options={options} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when focused, disabled, invalid or with a disabled tile (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example defaultValue="standard" />
          <ChoiceTiles label="Off" options={options} isDisabled defaultValue="pickup" />
          <ChoiceTiles
            label="Some off"
            options={[
              { value: 'a', label: 'A' },
              { value: 'b', label: 'B', isDisabled: true },
            ]}
          />
          <ChoiceTiles label="Bad" options={options} isInvalid errorMessage="Choose one." />
        </main>,
      );
      await userEvent.keyboard('{Tab}{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
