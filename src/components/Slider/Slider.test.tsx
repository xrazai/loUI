import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Slider } from './Slider';
import type { SliderProps } from './Slider';

function Discount(props: Partial<SliderProps>) {
  return <Slider label="Discount" defaultValue={20} {...props} />;
}

describe('Slider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('is a native range input named by its label, showing the value next to it', async () => {
    const screen = await renderWithProvider(<Discount />);
    const slider = screen.getByRole('slider', { name: 'Discount' });
    expect(slider.element().tagName).toBe('INPUT');
    expect(slider.element().getAttribute('type')).toBe('range');
    await expect.element(slider).toHaveValue('20');
    expect(screen.container.querySelector('output')?.textContent).toBe('20');
  });

  it('follows the keyboard contract: arrows, PageUp/PageDown, Home/End', async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const screen = await renderWithProvider(
      <Discount onChange={onChange} onChangeEnd={onChangeEnd} />,
    );
    const slider = screen.getByRole('slider');
    await userEvent.tab();
    await expect.element(slider).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(slider).toHaveValue('21');
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(slider).toHaveValue('22');
    await userEvent.keyboard('{ArrowLeft}{ArrowDown}');
    await expect.element(slider).toHaveValue('20');
    await userEvent.keyboard('{PageUp}');
    await expect.element(slider).toHaveValue('30');
    await userEvent.keyboard('{PageDown}{PageDown}{PageDown}');
    await expect.element(slider).toHaveValue('0');
    await userEvent.keyboard('{End}');
    await expect.element(slider).toHaveValue('100');
    await userEvent.keyboard('{Home}');
    await expect.element(slider).toHaveValue('0');
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(onChangeEnd).toHaveBeenCalled();
  });

  it('honors min, max and step, and never goes out of range', async () => {
    const screen = await renderWithProvider(
      <Discount minValue={10} maxValue={50} step={10} defaultValue={30} />,
    );
    const slider = screen.getByRole('slider');
    expect(slider.element().getAttribute('min')).toBe('10');
    expect(slider.element().getAttribute('max')).toBe('50');
    expect(slider.element().getAttribute('step')).toBe('10');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(slider).toHaveValue('40');
    await userEvent.keyboard('{End}{ArrowRight}');
    await expect.element(slider).toHaveValue('50');
    await userEvent.keyboard('{Home}{ArrowLeft}');
    await expect.element(slider).toHaveValue('10');
  });

  it('formats the value with the locale and exposes it as aria-valuetext', async () => {
    const options = { minValue: 0, maxValue: 1, step: 0.05 };
    const en = await renderWithProvider(
      <Discount {...options} formatOptions={{ style: 'percent' }} defaultValue={0.5} />,
    );
    await expect.element(en.getByRole('slider')).toHaveAttribute('aria-valuetext', '50%');
    expect(en.container.querySelector('output')?.textContent).toBe('50%');
    await en.unmount();
    const pt = await renderWithProvider(
      <Discount
        {...options}
        formatOptions={{ style: 'decimal', minimumFractionDigits: 2 }}
        defaultValue={0.5}
      />,
      { locale: 'pt-BR' },
    );
    expect(pt.container.querySelector('output')?.textContent).toBe('0,50');
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [value, setValue] = useState(35);
      return (
        <>
          <Slider label="Discount" value={value} onChange={setValue} />
          <button
            type="button"
            onClick={() => {
              setValue(80);
            }}
          >
            Set 80
          </button>
        </>
      );
    }
    const controlled = await renderWithProvider(<Controlled />);
    const slider = controlled.getByRole('slider');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(slider).toHaveValue('36');
    await controlled.getByRole('button', { name: 'Set 80' }).click();
    await expect.element(slider).toHaveValue('80');
    await controlled.unmount();
    const uncontrolled = await renderWithProvider(<Discount defaultValue={70} />);
    await expect.element(uncontrolled.getByRole('slider')).toHaveValue('70');
  });

  it('submits name and value with the form', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Discount name="discount" defaultValue={25} />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('discount')).toBe('25');
    screen.getByRole('slider').element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('discount')).toBe('26');
  });

  it('can be disabled', async () => {
    const screen = await renderWithProvider(<Discount isDisabled />);
    await expect.element(screen.getByRole('slider')).toBeDisabled();
    expect(screen.container.querySelector('[data-disabled]')).not.toBeNull();
  });

  it('links the description and supports aria-label without a visible label', async () => {
    const screen = await renderWithProvider(
      <>
        <Discount description="Applied to the whole order." />
        <Slider aria-label="Volume" defaultValue={3} maxValue={10} />
      </>,
    );
    await expect
      .element(screen.getByRole('slider', { name: 'Discount' }))
      .toHaveAccessibleDescription('Applied to the whole order.');
    await expect.element(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('gives the thumb a hit area of at least 24px', async () => {
    const screen = await renderWithProvider(<Discount />);
    const thumb = screen.getByRole('slider').element().closest('[class*="thumb"]');
    const box = thumb?.getBoundingClientRect();
    expect(box?.width).toBeGreaterThanOrEqual(24);
    expect(box?.height).toBeGreaterThanOrEqual(24);
  });

  it('centers the thumb on the rail and moves it with the value', async () => {
    const screen = await renderWithProvider(<Discount defaultValue={0} />);
    const root = screen.container;
    const rail = root.querySelector('[class*="rail"]')?.getBoundingClientRect();
    const thumb = screen.getByRole('slider').element().closest('[class*="thumb"]');
    const at0 = thumb?.getBoundingClientRect();
    expect(
      rail && at0 && Math.abs(at0.top + at0.height / 2 - (rail.top + rail.height / 2)),
    ).toBeLessThan(1.5);
    await userEvent.tab();
    await userEvent.keyboard('{End}');
    const at100 = thumb?.getBoundingClientRect();
    expect(at100 && at0 && at100.left).toBeGreaterThan(at0?.left ?? 0);
    expect(rail && at100 && Math.abs(at100.left + at100.width / 2 - rail.right)).toBeLessThan(1.5);
  });

  it('keeps a visible focus ring on the thumb', async () => {
    const screen = await renderWithProvider(<Discount />);
    await userEvent.tab();
    const thumb = screen.getByRole('slider').element().closest('[class*="thumb"]');
    expect(thumb && getComputedStyle(thumb).boxShadow).not.toBe('none');
  });

  it('forwards className and ref; warns without an accessible name', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<Discount className="extra" ref={ref} />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = {} as unknown as Parameters<typeof Slider>[0];
    await renderWithProvider(<Slider {...props} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Slider needs an accessible name'));
  });

  describe('axe', () => {
    it('has no violations: default, formatted, described, disabled, aria-label only', async () => {
      const screen = await renderWithProvider(
        <main>
          <Discount label="Default" />
          <Discount
            label="Formatted"
            minValue={0}
            maxValue={1}
            step={0.1}
            defaultValue={0.3}
            formatOptions={{ style: 'percent' }}
          />
          <Discount label="Described" description="Applied to the whole order." />
          <Discount label="Disabled" isDisabled />
          <Slider aria-label="Unlabelled" defaultValue={5} maxValue={10} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
