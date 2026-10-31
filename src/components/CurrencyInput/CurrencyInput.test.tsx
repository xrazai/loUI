import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { borderContrast } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { CurrencyInput } from './CurrencyInput';
import type { CurrencyInputProps } from './CurrencyInput';

function Price(props: Partial<CurrencyInputProps>) {
  return <CurrencyInput label="Price" currency="USD" {...props} />;
}

async function paste(element: Element, text: string) {
  const data = new DataTransfer();
  data.setData('text', text);
  element.dispatchEvent(
    new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
  );
  await Promise.resolve();
}

describe('CurrencyInput', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('shows the amount in minor units formatted for the currency, in mono, right-aligned', async () => {
    const screen = await renderWithProvider(<Price defaultValue={123456} />);
    const field = screen.getByRole('textbox', { name: 'Price' });
    await expect.element(field).toHaveValue('$1,234.56');
    const style = getComputedStyle(field.element());
    expect(style.fontFamily).toContain('Geist Mono');
    expect(style.textAlign).toMatch(/end|right/);
  });

  it('shifts digits in from the right and out with Backspace', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Price onChange={onChange} />);
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('123');
    await expect.element(field).toHaveValue('$1.23');
    expect(onChange).toHaveBeenLastCalledWith(123);
    await userEvent.keyboard('456');
    await expect.element(field).toHaveValue('$1,234.56');
    expect(onChange).toHaveBeenLastCalledWith(123456);
    await userEvent.keyboard('{Backspace}');
    await expect.element(field).toHaveValue('$123.45');
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');
    await expect.element(field).toHaveValue('$0.12');
    await userEvent.keyboard('{Backspace}{Backspace}');
    await expect.element(field).toHaveValue('$0.00');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('ignores letters and symbols while typing', async () => {
    const screen = await renderWithProvider(<Price />);
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('a1,b.2$ 5');
    await expect.element(field).toHaveValue('$1.25');
  });

  it('keeps the caret at the end: clicking in the middle and typing still appends', async () => {
    const screen = await renderWithProvider(<Price defaultValue={100} />);
    const field = screen.getByRole('textbox');
    const element = field.element() as HTMLInputElement;
    await userEvent.click(field);
    await expect.poll(() => element.selectionStart).toBe(element.value.length);
    element.setSelectionRange(1, 1);
    await expect.poll(() => element.selectionStart).toBe(element.value.length);
    await userEvent.keyboard('7');
    await expect.element(field).toHaveValue('$10.07');
    expect(element.selectionStart).toBe(element.value.length);
    expect(element.selectionEnd).toBe(element.value.length);
  });

  it('can be emptied: null is different from 0', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Price defaultValue={500} onChange={onChange} />);
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('{Control>}a{/Control}{Delete}');
    await expect.element(field).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('formats per currency and locale: BRL in pt-BR, JPY without fraction, KWD with three, EUR after the number in de-DE', async () => {
    const brl = await renderWithProvider(
      <Price label="Preço" currency="BRL" defaultValue={123456} />,
      { locale: 'pt-BR' },
    );
    await expect
      .element(brl.getByRole('textbox', { name: 'Preço' }))
      .toHaveValue('R$\u00a01.234,56');
    await brl.unmount();
    const jpy = await renderWithProvider(<Price currency="JPY" defaultValue={1234} />);
    await expect.element(jpy.getByRole('textbox')).toHaveValue('\u00a51,234');
    await userEvent.click(jpy.getByRole('textbox'));
    await userEvent.keyboard('5');
    await expect.element(jpy.getByRole('textbox')).toHaveValue('\u00a512,345');
    await jpy.unmount();
    const kwd = await renderWithProvider(<Price currency="KWD" defaultValue={1234567} />);
    await expect.element(kwd.getByRole('textbox')).toHaveValue('KWD\u00a01,234.567');
    await kwd.unmount();
    const eur = await renderWithProvider(<Price currency="EUR" defaultValue={1000} />, {
      locale: 'de-DE',
    });
    await expect.element(eur.getByRole('textbox')).toHaveValue('10,00\u00a0\u20ac');
    await userEvent.click(eur.getByRole('textbox'));
    await userEvent.keyboard('5');
    await expect.element(eur.getByRole('textbox')).toHaveValue('100,05\u00a0\u20ac');
  });

  it('shifts a digit out even when the caret is after a trailing symbol (de-DE)', async () => {
    const screen = await renderWithProvider(<Price currency="EUR" defaultValue={1234} />, {
      locale: 'de-DE',
    });
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('{Backspace}');
    await expect.poll(() => (field.element() as HTMLInputElement).value).toMatch(/^1,23/);
    await userEvent.keyboard('{Backspace}{Backspace}');
    await expect.poll(() => (field.element() as HTMLInputElement).value).toMatch(/^0,01/);
  });

  it('handles large values exactly and stops at maxDigits', async () => {
    const screen = await renderWithProvider(<Price defaultValue={999_999_999_999_999} />);
    const field = screen.getByRole('textbox');
    await expect.element(field).toHaveValue('$9,999,999,999,999.99');
    await userEvent.click(field);
    await userEvent.keyboard('1');
    await expect.element(field).toHaveValue('$9,999,999,999,999.99');
    await screen.unmount();
    const limited = await renderWithProvider(<Price maxDigits={4} />);
    const small = limited.getByRole('textbox');
    await userEvent.click(small);
    await userEvent.keyboard('123456');
    await expect.element(small).toHaveValue('$12.34');
  });

  it('rejects negatives by default and flips the sign with minus when allowed', async () => {
    const plain = await renderWithProvider(<Price />);
    await userEvent.click(plain.getByRole('textbox'));
    await userEvent.keyboard('-5');
    await expect.element(plain.getByRole('textbox')).toHaveValue('$0.05');
    await plain.unmount();
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Price allowNegative defaultValue={1234} onChange={onChange} />,
    );
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('-');
    await expect.element(field).toHaveValue('-$12.34');
    expect(onChange).toHaveBeenLastCalledWith(-1234);
    await userEvent.keyboard('5');
    await expect.element(field).toHaveValue('-$123.45');
    await userEvent.keyboard('-');
    await expect.element(field).toHaveValue('$123.45');
  });

  it('shows a lone minus as negative zero without losing it on the first digit', async () => {
    const screen = await renderWithProvider(<Price allowNegative />);
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('-');
    await expect.element(field).toHaveValue('-$0.00');
    await userEvent.keyboard('9');
    await expect.element(field).toHaveValue('-$0.09');
  });

  it('pastes decimals the way people write them', async () => {
    const screen = await renderWithProvider(<Price />);
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await paste(field.element(), '1,234.5');
    await expect.element(field).toHaveValue('$1,234.50');
    await paste(field.element(), '12,50');
    await expect.element(field).toHaveValue('$12.50');
    await paste(field.element(), '$ 99');
    await expect.element(field).toHaveValue('$99.00');
    await paste(field.element(), 'nothing here');
    await expect.element(field).toHaveValue('$99.00');
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [value, setValue] = useState<number | null>(250);
      return (
        <>
          <Price value={value} onChange={setValue} />
          <button
            type="button"
            onClick={() => {
              setValue(99_999);
            }}
          >
            Set
          </button>
        </>
      );
    }
    const controlled = await renderWithProvider(<Controlled />);
    const field = controlled.getByRole('textbox');
    await expect.element(field).toHaveValue('$2.50');
    await userEvent.click(field);
    await userEvent.keyboard('1');
    await expect.element(field).toHaveValue('$25.01');
    await controlled.getByRole('button', { name: 'Set' }).click();
    await expect.element(field).toHaveValue('$999.99');
    await controlled.unmount();
    const uncontrolled = await renderWithProvider(<Price defaultValue={5} />);
    await expect.element(uncontrolled.getByRole('textbox')).toHaveValue('$0.05');
  });

  it('submits the integer minor units under name, never the formatted text', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Price name="price" defaultValue={123456} />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('price')).toBe('123456');
    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.keyboard('7');
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('price')).toBe('1234567');
    expect([...(data?.keys() ?? [])]).toEqual(['price']);
  });

  it('is required: no error before a submit attempt, error after', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Price name="price" isRequired errorMessage="Enter a price." />
        <button type="submit">Save</button>
      </form>,
    );
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Enter a price.');
    await expect.element(screen.getByRole('textbox')).toHaveFocus();
  });

  it('marks the field invalid when controlled and links the description and the error', async () => {
    const screen = await renderWithProvider(
      <Price isInvalid errorMessage="Too expensive." description="Per unit." />,
    );
    const field = screen.getByRole('textbox');
    await expect.element(field).toHaveAccessibleDescription(/Per unit./);
    await expect.element(field).toHaveAccessibleDescription(/Too expensive\./);
    expect(field.element().getAttribute('aria-invalid')).toBe('true');
  });

  it('disables, makes read-only, and does not submit while disabled', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Price name="price" defaultValue={100} isDisabled />
        <button type="submit">Save</button>
      </form>,
    );
    await expect.element(screen.getByRole('textbox')).toBeDisabled();
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.has('price')).toBe(false);
    await screen.unmount();
    const readOnly = await renderWithProvider(<Price defaultValue={100} isReadOnly />);
    await userEvent.click(readOnly.getByRole('textbox'));
    await userEvent.keyboard('5');
    await expect.element(readOnly.getByRole('textbox')).toHaveValue('$1.00');
  });

  it('keeps the border at 3:1 and the focus ring when the consumer passes onFocus and onBlur', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const screen = await renderWithProvider(<Price onFocus={onFocus} onBlur={onBlur} />);
    const field = screen.getByRole('textbox').element();
    const box = field.parentElement as HTMLElement;
    expect(borderContrast(box)).toBeGreaterThanOrEqual(3);
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(getComputedStyle(box).boxShadow).not.toBe('none');
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('forwards className, ref and inputRef; warns without an accessible name', async () => {
    const ref = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();
    await renderWithProvider(<Price className="extra" ref={ref} inputRef={inputRef} />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(inputRef.current?.tagName).toBe('INPUT');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = { currency: 'USD' } as unknown as Parameters<typeof CurrencyInput>[0];
    await renderWithProvider(<CurrencyInput {...props} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Input needs an accessible name'));
  });

  describe('axe', () => {
    it('has no violations: empty, filled, described, required, invalid, disabled, read-only, pt-BR', async () => {
      const screen = await renderWithProvider(
        <main>
          <Price label="Empty" />
          <Price label="Filled" defaultValue={123456} />
          <Price label="Described" description="Per unit." />
          <Price label="Required" isRequired />
          <Price label="Invalid" isInvalid errorMessage="Too expensive." />
          <Price label="Disabled" isDisabled defaultValue={100} />
          <Price label="Read-only" isReadOnly defaultValue={100} />
          <Price label="Preço" currency="BRL" defaultValue={100} />
          <CurrencyInput aria-label="Unlabelled" currency="USD" />
        </main>,
        { locale: 'pt-BR' },
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
