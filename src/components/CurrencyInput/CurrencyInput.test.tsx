import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { borderContrast } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Inline } from '../Inline';
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

describe('CurrencyInput events and placeholder', () => {
  it('shows the placeholder while null, focused or not, in the tertiary text colour', async () => {
    const screen = await renderWithProvider(<Price placeholder="$49.90" />);
    const field = screen.getByRole('textbox');
    const element = field.element() as HTMLInputElement;
    await expect.element(field).toHaveValue('');
    expect(element.matches(':placeholder-shown')).toBe(true);
    const color = getComputedStyle(element, '::placeholder').color;
    expect(color).not.toBe(getComputedStyle(element).color);
    await userEvent.click(element);
    expect(element.matches(':placeholder-shown')).toBe(true);
    await userEvent.keyboard('1');
    await expect.element(field).toHaveValue('$0.01');
    expect(element.matches(':placeholder-shown')).toBe(false);
  });

  it('shows the placeholder again when the field is emptied', async () => {
    const screen = await renderWithProvider(<Price placeholder="$49.90" defaultValue={500} />);
    const element = screen.getByRole('textbox').element() as HTMLInputElement;
    expect(element.matches(':placeholder-shown')).toBe(false);
    await userEvent.click(element);
    await userEvent.keyboard('{Control>}a{/Control}{Delete}');
    expect(element.matches(':placeholder-shown')).toBe(true);
  });

  it('hides the placeholder for 0, which is a value', async () => {
    const screen = await renderWithProvider(<Price placeholder="$49.90" value={0} />);
    const element = screen.getByRole('textbox').element() as HTMLInputElement;
    expect(element.value).toBe('$0.00');
    expect(element.matches(':placeholder-shown')).toBe(false);
  });

  it('calls onFocus, onBlur and onKeyDown, and keeps typing and the caret working', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();
    const screen = await renderWithProvider(
      <Price onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} defaultValue={100} />,
    );
    const element = screen.getByRole('textbox').element() as HTMLInputElement;
    await userEvent.click(element);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(element.selectionStart).toBe(element.value.length);
    await userEvent.keyboard('5');
    expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: '5' }));
    expect(element.value).toBe('$10.05');
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('delivers the last typed value to onChange before onBlur runs', async () => {
    const order: string[] = [];
    const screen = await renderWithProvider(
      <Price
        onChange={(value) => order.push(`change:${String(value)}`)}
        onBlur={() => order.push('blur')}
      />,
    );
    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.keyboard('12');
    await userEvent.tab();
    expect(order).toEqual(['change:1', 'change:12', 'blur']);
  });

  it('stops a key the handler prevented, and lets every other key keep bubbling', async () => {
    const onKeyDown = vi.fn((event: { key: string; preventDefault: () => void }) => {
      if (event.key === 'Enter') event.preventDefault();
    });
    const outer = vi.fn();
    const screen = await renderWithProvider(
      // eslint-disable-next-line jsx-a11y-x/no-static-element-interactions -- observes bubbling only
      <div
        onKeyDown={(event) => {
          outer(event.key);
        }}
      >
        <Price onKeyDown={onKeyDown} />
      </div>,
    );
    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.keyboard('7{Enter}');
    expect(outer).toHaveBeenCalledWith('7');
    expect(outer).not.toHaveBeenCalledWith('Enter');
  });
});

describe('CurrencyInput fullWidth', () => {
  async function renderRow(props: { fullWidth?: boolean }) {
    return renderWithProvider(
      <div style={{ inlineSize: 700 }}>
        <Inline gap={2} wrap={false}>
          <Price {...props} />
          <button type="button">Apply</button>
        </Inline>
      </div>,
    );
  }

  it('takes the free space of an Inline row, and not by default', async () => {
    const rowOf = (screen: { container: Element }) =>
      (screen.container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    const plain = await renderRow({});
    const plainField = rowOf(plain).children[0] as HTMLElement;
    expect(plainField.hasAttribute('data-full-width')).toBe(false);
    const plainWidth = plainField.getBoundingClientRect().width;
    await plain.unmount();
    const full = await renderRow({ fullWidth: true });
    const row = rowOf(full);
    const field = row.querySelector('[data-full-width]') as HTMLElement;
    const button = row.lastElementChild as HTMLElement;
    expect(field.getAttribute('data-full-width')).toBe('true');
    expect(field.getBoundingClientRect().width).toBeGreaterThanOrEqual(plainWidth);
    expect(button.getBoundingClientRect().right).toBeCloseTo(700, 0);
    expect(field.getBoundingClientRect().right).toBeLessThanOrEqual(
      button.getBoundingClientRect().left + 0.5,
    );
  });
});

describe('CurrencyInput amount entry mode', () => {
  async function typeInto(props: Partial<CurrencyInputProps>, text: string, locale = 'en-US') {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Price entryMode="amount" onChange={onChange} {...props} />,
      { locale },
    );
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard(text);
    return { field, onChange, screen };
  }

  it('reads digits as whole units and formats on blur', async () => {
    const { field, onChange } = await typeInto({ currency: 'BRL' }, '200', 'pt-BR');
    expect(onChange).toHaveBeenLastCalledWith(20000);
    await expect.element(field).toHaveValue('200');
    await userEvent.tab();
    expect((field.element() as HTMLInputElement).value.replace(/\s/g, ' ')).toBe('R$ 200,00');
  });

  it('keeps what is typed readable mid-typing', async () => {
    const { field } = await typeInto({ currency: 'BRL' }, '200,', 'pt-BR');
    await expect.element(field).toHaveValue('200,');
    await userEvent.keyboard('5');
    await expect.element(field).toHaveValue('200,5');
  });

  it('parses decimals per locale: "12,5" pt-BR, "12.50" en-US, "1.234,56" pt-BR', async () => {
    const a = await typeInto({ currency: 'BRL' }, '12,5', 'pt-BR');
    expect(a.onChange).toHaveBeenLastCalledWith(1250);
  });

  it('parses "12.50" in en-US', async () => {
    const { onChange } = await typeInto({}, '12.50');
    expect(onChange).toHaveBeenLastCalledWith(1250);
  });

  it('pastes grouped "1.234,56" in pt-BR', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Price entryMode="amount" currency="BRL" onChange={onChange} />,
      { locale: 'pt-BR' },
    );
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await paste(field.element(), '1.234,56');
    expect(onChange).toHaveBeenLastCalledWith(123456);
  });

  it('D-M2: typing "12.905" in pt-BR keeps 12,90 instead of regrouping to 12.905,00', async () => {
    const { onChange, field } = await typeInto({ currency: 'BRL' }, '12.90', 'pt-BR');
    expect(onChange).toHaveBeenLastCalledWith(1290);
    onChange.mockClear();
    await userEvent.keyboard('5');
    await expect.element(field).toHaveValue('12.90');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('D-M2: no keystroke ever reports a larger order of magnitude while a fraction is typed', async () => {
    const { onChange } = await typeInto({ currency: 'BRL' }, '12.9005', 'pt-BR');
    const values = onChange.mock.calls.map(([value]) => value as number);
    expect(Math.max(...values)).toBe(1290);
  });

  it('D-M2: the foreign mark keeps its reading in en-US too ("12,50" then "7")', async () => {
    const { onChange, field } = await typeInto({}, '12,507');
    await expect.element(field).toHaveValue('12,50');
    expect(onChange).toHaveBeenLastCalledWith(1250);
  });

  it('JPY has no fraction', async () => {
    const { onChange, field } = await typeInto({ currency: 'JPY' }, '1500');
    expect(onChange).toHaveBeenLastCalledWith(1500);
    await userEvent.keyboard('.');
    await expect.element(field).toHaveValue('1500');
  });

  it('ignores fraction digits beyond the currency and a second decimal mark', async () => {
    const { onChange, field } = await typeInto({}, '12.567');
    await expect.element(field).toHaveValue('12.56');
    expect(onChange).toHaveBeenLastCalledWith(1256);
    await userEvent.keyboard('.');
    await expect.element(field).toHaveValue('12.56');
  });

  it('respects maxDigits counted in minor units (5 digits is 999.99)', async () => {
    const { onChange, field } = await typeInto({ maxDigits: 5 }, '1234.567');
    await expect.element(field).toHaveValue('123.56');
    expect(onChange).toHaveBeenLastCalledWith(12356);
  });

  it('Backspace edits the text and select all + Delete gives null', async () => {
    const { onChange, field } = await typeInto({}, '12.5');
    await userEvent.keyboard('{Backspace}');
    await expect.element(field).toHaveValue('12.');
    expect(onChange).toHaveBeenLastCalledWith(1200);
    await userEvent.keyboard('{Control>}a{/Control}{Delete}');
    await expect.element(field).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('selects the amount on focus so typing replaces it', async () => {
    const { field, onChange } = await typeInto({ defaultValue: 123456 }, '7');
    await expect.element(field).toHaveValue('7');
    expect(onChange).toHaveBeenLastCalledWith(700);
  });

  it('pastes with the smart paste', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Price entryMode="amount" onChange={onChange} />);
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await paste(field.element(), '1,234.50');
    expect(onChange).toHaveBeenLastCalledWith(123450);
    await expect.element(field).toHaveValue('1234.50');
  });

  it('supports negative amounts and submits integer minor units', async () => {
    const { field, screen } = await typeInto({ allowNegative: true, name: 'adj' }, '-3.5');
    await expect.element(field).toHaveValue('-3.5');
    const hidden = screen.container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.value).toBe('-350');
  });

  it('keeps cents mode as the default', async () => {
    const { onChange } = await typeInto({ entryMode: 'cents' }, '200');
    expect(onChange).toHaveBeenLastCalledWith(200);
  });

  it('has no axe violations while editing', async () => {
    const { screen } = await typeInto({ placeholder: '$0.00' }, '12.5');
    await expectNoA11yViolations(screen.container);
  });
});

describe('CurrencyInput pointer and keyboard focus (QA-005)', () => {
  const locales = [
    { locale: 'en-US', currency: 'USD', typed: '300', amount: 30000 },
    { locale: 'pt-BR', currency: 'BRL', typed: '300', amount: 30000 },
  ] as const;

  for (const { locale, currency, typed, amount } of locales) {
    it(`amount mode (${locale}): a pointer click selects the value, so typing replaces it`, async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Price entryMode="amount" currency={currency} defaultValue={123456} onChange={onChange} />,
        { locale },
      );
      const field = screen.getByRole('textbox');
      await userEvent.click(field);
      const element = field.element() as HTMLInputElement;
      expect([element.selectionStart, element.selectionEnd]).toEqual([0, element.value.length]);
      await userEvent.keyboard(typed);
      expect(onChange).toHaveBeenLastCalledWith(amount);
    });

    it(`amount mode (${locale}): keyboard focus selects the value too`, async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Price entryMode="amount" currency={currency} defaultValue={123456} onChange={onChange} />,
        { locale },
      );
      await userEvent.tab();
      const element = screen.getByRole('textbox').element() as HTMLInputElement;
      expect([element.selectionStart, element.selectionEnd]).toEqual([0, element.value.length]);
      await userEvent.keyboard(typed);
      expect(onChange).toHaveBeenLastCalledWith(amount);
    });

    it(`cents mode (${locale}): a pointer click keeps the caret at the end, so digits append`, async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Price currency={currency} defaultValue={123456} onChange={onChange} />,
        { locale },
      );
      const field = screen.getByRole('textbox');
      await userEvent.click(field);
      const element = field.element() as HTMLInputElement;
      expect(element.selectionStart).toBe(element.value.length);
      expect(element.selectionEnd).toBe(element.value.length);
      await userEvent.keyboard('7');
      expect(onChange).toHaveBeenLastCalledWith(1234567);
    });

    it(`cents mode (${locale}): clicking into the middle of the text still appends at the end`, async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Price currency={currency} defaultValue={123456} onChange={onChange} />,
        { locale },
      );
      const field = screen.getByRole('textbox');
      await userEvent.click(field);
      await userEvent.click(field, { position: { x: 4, y: 8 } });
      await userEvent.keyboard('7');
      expect(onChange).toHaveBeenLastCalledWith(1234567);
    });
  }

  for (const { locale, currency, typed, amount } of locales) {
    it(`amount mode (${locale}): clicking a field that is already focused keeps the amount selected`, async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Price entryMode="amount" currency={currency} defaultValue={33333} onChange={onChange} />,
        { locale },
      );
      const field = screen.getByRole('textbox');
      await userEvent.tab();
      // The left end of the box is blank (the text is right-aligned): the old caret landed at 0.
      await userEvent.click(field, { position: { x: 2, y: 8 } });
      const element = field.element() as HTMLInputElement;
      expect([element.selectionStart, element.selectionEnd]).toEqual([0, element.value.length]);
      await userEvent.keyboard(typed);
      expect(element.value).toBe('300');
      expect(onChange).toHaveBeenLastCalledWith(amount);
    });

    it(`cents mode (${locale}): clicking a field that is already focused still appends`, async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Price currency={currency} defaultValue={33333} onChange={onChange} />,
        { locale },
      );
      const field = screen.getByRole('textbox');
      await userEvent.tab();
      await userEvent.click(field, { position: { x: 2, y: 8 } });
      await userEvent.keyboard(typed);
      expect(onChange).toHaveBeenLastCalledWith(33333300);
    });
  }

  it('amount mode: after the first edit a click places the caret normally', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Price entryMode="amount" defaultValue={123456} onChange={onChange} />,
    );
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('12');
    await userEvent.click(field, { position: { x: 2, y: 8 } });
    const element = field.element() as HTMLInputElement;
    expect(element.selectionStart).toBe(element.selectionEnd);
    await userEvent.keyboard('9');
    expect(element.value).toBe('912');
  });

  it('amount mode: a mouse selection made after focus is kept and typing replaces only it', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Price entryMode="amount" defaultValue={123456} onChange={onChange} />,
    );
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    const element = field.element() as HTMLInputElement;
    expect(element.value).toBe('1234.56');
    element.setSelectionRange(0, 2);
    await userEvent.keyboard('9');
    expect(element.value).toBe('934.56');
    expect(onChange).toHaveBeenLastCalledWith(93456);
  });
});
