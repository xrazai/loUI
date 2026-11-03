import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Legend } from './Legend';
import type { LegendItem } from './Legend';

const items: LegendItem[] = [
  { id: 'online', label: 'Online', value: '40' },
  { id: 'store', label: 'Store', value: '30' },
  { id: 'phone', label: 'Phone', value: '10' },
];

describe('Legend', () => {
  describe('structure', () => {
    it('is a named list with one item per series, in order', async () => {
      const screen = await renderWithProvider(<Legend items={items} />);
      await expect.element(screen.getByRole('list', { name: 'Legend' })).toBeVisible();
      const rows = screen.getByRole('listitem').elements();
      expect(rows.map((row) => row.textContent)).toEqual(['Online40', 'Store30', 'Phone10']);
    });

    it('lets the consumer name the list', async () => {
      const screen = await renderWithProvider(<Legend items={items} aria-label="Channels" />);
      await expect.element(screen.getByRole('list', { name: 'Channels' })).toBeVisible();
    });

    it('draws a decorative swatch per item, following the ramp and hatching from the fifth', async () => {
      const many: LegendItem[] = Array.from({ length: 6 }, (_, index) => ({
        id: String(index),
        label: `Series ${String(index + 1)}`,
      }));
      const screen = await renderWithProvider(<Legend items={many} />);
      const swatches = [...screen.container.querySelectorAll('li > span[aria-hidden="true"]')];
      expect(swatches).toHaveLength(6);
      expect(swatches.map((swatch) => swatch.getAttribute('data-ramp'))).toEqual([
        '0',
        '1',
        '2',
        '3',
        '0',
        '1',
      ]);
      expect(swatches.map((swatch) => swatch.hasAttribute('data-hatched'))).toEqual([
        false,
        false,
        false,
        false,
        true,
        true,
      ]);
    });

    it('uses an explicit color for the swatch', async () => {
      const screen = await renderWithProvider(
        <Legend items={[{ id: 'paid', label: 'Paid', color: 'var(--ds-success)' }]} />,
      );
      const swatch = screen.container.querySelector('li > span') as HTMLElement;
      expect(swatch.style.getPropertyValue('--ds-legend-color')).toBe('var(--ds-success)');
    });

    it('stacks items when vertical', async () => {
      const screen = await renderWithProvider(<Legend items={items} orientation="vertical" />);
      const list = screen.getByRole('list').element();
      expect(getComputedStyle(list).flexDirection).toBe('column');
    });

    it('spreads rest props and forwards the ref', async () => {
      const ref = createRef<HTMLUListElement>();
      const screen = await renderWithProvider(
        <Legend ref={ref} items={items} data-testid="legend" className="extra" />,
      );
      expect(ref.current).toBe(screen.getByTestId('legend').element());
      expect(ref.current?.classList.contains('extra')).toBe(true);
    });
  });

  describe('interactive', () => {
    it('renders toggle buttons that are pressed while the series is shown', async () => {
      const screen = await renderWithProvider(<Legend items={items} interactive />);
      const buttons = screen.getByRole('button').elements();
      expect(buttons).toHaveLength(3);
      for (const button of buttons) expect(button.getAttribute('aria-pressed')).toBe('true');
    });

    it('hides and shows a series (uncontrolled) and reports the hidden ids', async () => {
      const onHiddenIdsChange = vi.fn();
      const screen = await renderWithProvider(
        <Legend items={items} interactive onHiddenIdsChange={onHiddenIdsChange} />,
      );
      const store = screen.getByRole('button', { name: /Store/ });
      await store.click();
      await expect.element(store).toHaveAttribute('aria-pressed', 'false');
      expect(onHiddenIdsChange).toHaveBeenLastCalledWith(['store']);
      await store.click();
      await expect.element(store).toHaveAttribute('aria-pressed', 'true');
      expect(onHiddenIdsChange).toHaveBeenLastCalledWith([]);
    });

    it('marks a hidden series without relying on color', async () => {
      const screen = await renderWithProvider(
        <Legend items={items} interactive defaultHiddenIds={['store']} />,
      );
      const row = screen.getByRole('listitem').nth(1).element();
      expect(row.hasAttribute('data-off')).toBe(true);
      const label = row.querySelector('span[class*="name"]') as Element;
      expect(getComputedStyle(label).textDecorationLine).toBe('line-through');
    });

    it('can be controlled', async () => {
      function Controlled() {
        const [hidden, setHidden] = useState<string[]>(['phone']);
        return (
          <Legend items={items} interactive hiddenIds={hidden} onHiddenIdsChange={setHidden} />
        );
      }
      const screen = await renderWithProvider(<Controlled />);
      await expect
        .element(screen.getByRole('button', { name: /Phone/ }))
        .toHaveAttribute('aria-pressed', 'false');
      await screen.getByRole('button', { name: /Online/ }).click();
      await expect
        .element(screen.getByRole('button', { name: /Online/ }))
        .toHaveAttribute('aria-pressed', 'false');
    });

    it('describes what pressing does', async () => {
      const screen = await renderWithProvider(<Legend items={items} interactive />);
      const list = screen.getByRole('list').element();
      const description = document.getElementById(list.getAttribute('aria-describedby') ?? '');
      expect(description?.textContent).toBe('Press a series to show or hide it.');
    });

    it('toggles with Space and Enter from the keyboard, one tab stop per item', async () => {
      const screen = await renderWithProvider(<Legend items={items} interactive />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: /Online/ })).toHaveFocus();
      await userEvent.keyboard(' ');
      await expect
        .element(screen.getByRole('button', { name: /Online/ }))
        .toHaveAttribute('aria-pressed', 'false');
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: /Store/ })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect
        .element(screen.getByRole('button', { name: /Store/ }))
        .toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('share', () => {
    const amounts: LegendItem[] = [
      { id: 'a', label: 'Pix', amount: 50 },
      { id: 'b', label: 'Cash', amount: 25 },
      { id: 'c', label: 'Card', amount: 25 },
    ];

    it('prints the share of each item over the sum of the amounts', async () => {
      const screen = await renderWithProvider(<Legend items={amounts} showShare />);
      const rows = screen.getByRole('listitem').elements();
      expect(rows.map((row) => row.textContent)).toEqual(['Pix50%', 'Cash25%', 'Card25%']);
    });

    it('formats the share for the locale and the digits', async () => {
      const screen = await renderWithProvider(
        <Legend
          items={[
            { id: 'a', label: 'A', amount: 1 },
            { id: 'b', label: 'B', amount: 2 },
          ]}
          showShare
          shareDigits={1}
        />,
        { locale: 'pt-BR' },
      );
      const rows = screen.getByRole('listitem').elements();
      expect(rows[0]?.textContent).toContain('33,3');
    });

    it('uses shareOf as the denominator when given', async () => {
      const screen = await renderWithProvider(<Legend items={amounts} showShare shareOf={200} />);
      expect(screen.getByRole('listitem').elements()[0]?.textContent).toBe('Pix25%');
    });

    it('leaves hidden items out of the denominator and prints no share for them', async () => {
      const screen = await renderWithProvider(
        <Legend items={amounts} showShare interactive hiddenIds={['a']} />,
      );
      const rows = screen.getByRole('listitem').elements();
      expect(rows.map((row) => row.textContent)).toEqual(['Pix', 'Cash50%', 'Card50%']);
    });

    it('prints 0% when the denominator is zero and nothing for items without amount', async () => {
      const screen = await renderWithProvider(
        <Legend
          items={[
            { id: 'a', label: 'A', amount: 0 },
            { id: 'b', label: 'B' },
          ]}
          showShare
        />,
      );
      const rows = screen.getByRole('listitem').elements();
      expect(rows.map((row) => row.textContent)).toEqual(['A0%', 'B']);
    });

    it('shows value and share in separate columns and does not adjust rounded shares', async () => {
      const screen = await renderWithProvider(
        <Legend
          orientation="vertical"
          showShare
          items={[
            { id: 'a', label: 'A', amount: 1, value: '1' },
            { id: 'b', label: 'B', amount: 1, value: '1' },
            { id: 'c', label: 'C', amount: 1, value: '1' },
          ]}
        />,
      );
      const rows = screen.getByRole('listitem').elements();
      expect(rows.map((row) => row.textContent)).toEqual(['A133%', 'B133%', 'C133%']);
      expect((rows[0] as Element).querySelectorAll('span')).toHaveLength(4);
    });
  });

  describe('messages', () => {
    it('translates the name and the hint to pt-BR', async () => {
      const screen = await renderWithProvider(<Legend items={items} interactive />, {
        locale: 'pt-BR',
      });
      const list = screen.getByRole('list', { name: 'Legenda' }).element();
      const description = document.getElementById(list.getAttribute('aria-describedby') ?? '');
      expect(description?.textContent).toBe('Pressione uma série para mostrá-la ou ocultá-la.');
    });

    it('takes provider and instance overrides', async () => {
      const screen = await renderWithProvider(<Legend items={items} />, {
        messages: { Legend: { label: 'Series' } },
      });
      await expect.element(screen.getByRole('list', { name: 'Series' })).toBeVisible();
      await screen.rerender(<Legend items={items} messages={{ label: 'Keys' }} />);
      await expect.element(screen.getByRole('list', { name: 'Keys' })).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations as a list', async () => {
      const screen = await renderWithProvider(<Legend items={items} />);
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations with value and share columns', async () => {
      const screen = await renderWithProvider(
        <Legend
          orientation="vertical"
          showShare
          items={[
            { id: 'a', label: 'A', amount: 3, value: '3' },
            { id: 'b', label: 'B', amount: 1, value: '1' },
          ]}
        />,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when interactive with a hidden series', async () => {
      const screen = await renderWithProvider(
        <Legend items={items} interactive defaultHiddenIds={['phone']} />,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
