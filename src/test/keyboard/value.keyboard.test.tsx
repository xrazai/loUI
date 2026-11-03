/**
 * Keyboard contract: Slider, NumberField (stepper), CurrencyInput.
 * Spec: AGENTS.md section 8, rows "Slider" (arrows step, PageUp/PageDown large step, Home/End
 * min/max) and "Number field (stepper)" (textbox with aria-roledescription "Number field"; up/down
 * step; PageUp/PageDown step; Home/End min/max; typing allowed) (TEST-004).
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ColorField } from '../../components/ColorField';
import { CurrencyInput } from '../../components/CurrencyInput';
import { NumberField } from '../../components/NumberField';
import { Slider } from '../../components/Slider';
import { renderWithProvider } from '../render';
import { expectFocus, press, tabOrder } from './contract';

function Around({ children }: { children: React.ReactNode }) {
  return (
    <>
      <button type="button">Before</button>
      {children}
      <button type="button">After</button>
    </>
  );
}

describe('keyboard contract: slider', () => {
  async function arrive(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
    const screen = await renderWithProvider(
      <Around>
        <Slider label="Discount" defaultValue={20} {...props} />
      </Around>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await expectFocus('Discount');
    return screen.getByRole('slider');
  }

  it('is one Tab stop', async () => {
    await renderWithProvider(
      <Around>
        <Slider label="Discount" defaultValue={20} />
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual(['Discount', 'After']);
  });

  it('Right/Up increase and Left/Down decrease by one step', async () => {
    const slider = await arrive();
    await press('{ArrowRight}');
    await expect.element(slider).toHaveValue('21');
    await press('{ArrowUp}');
    await expect.element(slider).toHaveValue('22');
    await press('{ArrowLeft}');
    await expect.element(slider).toHaveValue('21');
    await press('{ArrowDown}');
    await expect.element(slider).toHaveValue('20');
  });

  it('PageUp and PageDown move by the large step', async () => {
    const slider = await arrive();
    await press('{PageUp}');
    await expect.element(slider).toHaveValue('30');
    await press('{PageDown}{PageDown}');
    await expect.element(slider).toHaveValue('10');
  });

  it('Home and End jump to the minimum and maximum', async () => {
    const slider = await arrive();
    await press('{End}');
    await expect.element(slider).toHaveValue('100');
    await press('{Home}');
    await expect.element(slider).toHaveValue('0');
  });

  it('never leaves the range and honors the step', async () => {
    const slider = await arrive({ minValue: 10, maxValue: 50, step: 10, defaultValue: 30 });
    await press('{ArrowRight}');
    await expect.element(slider).toHaveValue('40');
    await press('{End}{ArrowRight}');
    await expect.element(slider).toHaveValue('50');
    await press('{Home}{ArrowLeft}');
    await expect.element(slider).toHaveValue('10');
  });

  it('reports every keyboard change through onChange', async () => {
    const onChange = vi.fn();
    await arrive({ onChange });
    await press('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(21);
    await press('{End}');
    expect(onChange).toHaveBeenLastCalledWith(100);
  });
});

describe('keyboard contract: number field', () => {
  async function arrive(props: Partial<React.ComponentProps<typeof NumberField>> = {}) {
    const screen = await renderWithProvider(
      <Around>
        <NumberField label="Quantity" defaultValue={5} minValue={0} maxValue={10} {...props} />
      </Around>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await expectFocus('Quantity');
    return screen.getByRole('textbox');
  }

  it('is a textbox described as a "Number field" (React Aria avoids spinbutton on purpose)', async () => {
    const field = await arrive();
    expect(field.element().getAttribute('aria-roledescription')).toBe('Number field');
  });

  it('the field is one Tab stop (the stepper buttons are not in the Tab order)', async () => {
    await renderWithProvider(
      <Around>
        <NumberField label="Quantity" defaultValue={5} minValue={0} maxValue={10} />
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual(['Quantity', 'After']);
  });

  it('Up/Down step the value', async () => {
    const field = await arrive();
    await press('{ArrowUp}');
    await expect.element(field).toHaveValue('6');
    await press('{ArrowDown}{ArrowDown}');
    await expect.element(field).toHaveValue('4');
  });

  it('PageUp/PageDown step the value (by one step, like the arrows)', async () => {
    const field = await arrive({ defaultValue: 50, minValue: 0, maxValue: 100 });
    await press('{PageUp}');
    await expect.element(field).toHaveValue('51');
    await press('{PageDown}{PageDown}');
    await expect.element(field).toHaveValue('49');
  });

  it('Home and End jump to the minimum and maximum', async () => {
    const field = await arrive();
    await press('{Home}');
    await expect.element(field).toHaveValue('0');
    await press('{End}');
    await expect.element(field).toHaveValue('10');
  });

  it('clamps at the limits', async () => {
    const field = await arrive({ defaultValue: 10 });
    await press('{ArrowUp}');
    await expect.element(field).toHaveValue('10');
    await press('{Home}{ArrowDown}');
    await expect.element(field).toHaveValue('0');
  });

  it('typing is allowed and Enter commits the typed value', async () => {
    const onChange = vi.fn();
    const field = await arrive({ onChange });
    await press('{Control>}a{/Control}7{Enter}');
    await expect.element(field).toHaveValue('7');
    expect(onChange).toHaveBeenLastCalledWith(7);
  });
});

describe('keyboard contract: colour field', () => {
  async function arrive() {
    const screen = await renderWithProvider(
      <Around>
        <ColorField label="Hex" defaultValue="#000010" />
      </Around>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await expectFocus('Hex');
    return screen.getByRole('textbox');
  }

  it('is one Tab stop', async () => {
    await renderWithProvider(
      <Around>
        <ColorField label="Hex" defaultValue="#000010" />
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual(['Hex', 'After']);
  });

  it('Up/Down step the hex value', async () => {
    const field = await arrive();
    await press('{ArrowUp}');
    await expect.element(field).toHaveValue('#000011');
    await press('{ArrowDown}{ArrowDown}');
    await expect.element(field).toHaveValue('#00000F');
  });

  it('typing is allowed and Enter commits a normalised #RRGGBB', async () => {
    const field = await arrive();
    await press('{Control>}a{/Control}#abc{Enter}');
    await expect.element(field).toHaveValue('#AABBCC');
  });
});

describe('keyboard contract: currency input', () => {
  it('is one Tab stop and typing digits shifts them in from the right', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Around>
        <CurrencyInput label="Price" currency="USD" onChange={onChange} />
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['Price']);
    await press('123');
    await expect.element(screen.getByRole('textbox', { name: 'Price' })).toHaveValue('$1.23');
    expect(onChange).toHaveBeenLastCalledWith(123);
    expect(await tabOrder(1)).toEqual(['After']);
  });

  it('Backspace removes the last digit and letters are ignored', async () => {
    const screen = await renderWithProvider(
      <Around>
        <CurrencyInput label="Price" currency="USD" defaultValue={12345} />
      </Around>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await press('abc{Backspace}');
    await expect.element(screen.getByRole('textbox', { name: 'Price' })).toHaveValue('$12.34');
  });
});
