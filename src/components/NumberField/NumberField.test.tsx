import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Inline } from '../Inline';
import { borderContrast } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { NumberField } from './NumberField';
import type { NumberFieldProps } from './NumberField';

function Quantity(props: Partial<NumberFieldProps>) {
  return <NumberField label="Quantity" defaultValue={5} minValue={0} maxValue={10} {...props} />;
}

describe('NumberField', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('is a text input with the "Number field" role description, named by its label', async () => {
    const screen = await renderWithProvider(<Quantity description="Pieces per box." />);
    const field = screen.getByRole('textbox', { name: 'Quantity' });
    await expect.element(field).toHaveValue('5');
    expect(field.element().getAttribute('aria-roledescription')).toBe('Number field');
    expect(field.element().getAttribute('inputmode')).toBe('numeric');
    await expect.element(field).toHaveAccessibleDescription('Pieces per box.');
  });

  it('steps with the buttons, named from messages, and disables them at the limits', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Quantity defaultValue={9} onChange={onChange} />);
    const field = screen.getByRole('textbox');
    const increase = screen.getByRole('button', { name: /Increase/ });
    const decrease = screen.getByRole('button', { name: /Decrease/ });
    await increase.click();
    await expect.element(field).toHaveValue('10');
    expect(onChange).toHaveBeenLastCalledWith(10);
    await expect.element(increase).toBeDisabled();
    await decrease.click();
    await expect.element(field).toHaveValue('9');
  });

  it('follows the spinbutton keyboard contract (arrows, PageUp/PageDown, Home/End)', async () => {
    const screen = await renderWithProvider(<Quantity />);
    const field = screen.getByRole('textbox');
    await userEvent.tab();
    await expect.element(field).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(field).toHaveValue('6');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect.element(field).toHaveValue('4');
    await userEvent.keyboard('{PageUp}');
    await expect.element(field).toHaveValue('5');
    await userEvent.keyboard('{PageDown}');
    await expect.element(field).toHaveValue('4');
    await userEvent.keyboard('{Home}');
    await expect.element(field).toHaveValue('0');
    await userEvent.keyboard('{End}');
    await expect.element(field).toHaveValue('10');
  });

  it('allows typing, commits on blur and clamps to the limits', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Quantity onChange={onChange} />);
    const field = screen.getByRole('textbox');
    await field.fill('7');
    await userEvent.tab();
    await expect.element(field).toHaveValue('7');
    expect(onChange).toHaveBeenLastCalledWith(7);
    await field.fill('42');
    await userEvent.keyboard('{Enter}');
    await expect.element(field).toHaveValue('10');
  });

  it('respects step, snapping typed values', async () => {
    const screen = await renderWithProvider(<Quantity step={0.5} defaultValue={1} />);
    const field = screen.getByRole('textbox');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(field).toHaveValue('1.5');
    await field.fill('2.3');
    await userEvent.tab();
    await expect.element(field).toHaveValue('2.5');
  });

  it('formats and parses with the locale of the provider', async () => {
    const screen = await renderWithProvider(
      <Quantity
        label="Largura"
        defaultValue={1234.5}
        minValue={0}
        maxValue={100000}
        formatOptions={{ minimumFractionDigits: 1 }}
      />,
      { locale: 'pt-BR' },
    );
    const field = screen.getByRole('textbox');
    await expect.element(field).toHaveValue('1.234,5');
    await field.fill('2.000,5');
    await userEvent.tab();
    await expect.element(field).toHaveValue('2.000,5');
  });

  it('shows a suffix and a placeholder when empty', async () => {
    const screen = await renderWithProvider(
      <NumberField label="Length" suffix="m" placeholder="0" minValue={0} />,
    );
    expect(screen.container.textContent).toContain('m');
    await expect.element(screen.getByRole('textbox')).toHaveAttribute('placeholder', '0');
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [value, setValue] = useState(3);
      return (
        <>
          <Quantity value={value} onChange={setValue} />
          <button
            type="button"
            onClick={() => {
              setValue(8);
            }}
          >
            Set 8
          </button>
        </>
      );
    }
    const controlled = await renderWithProvider(<Controlled />);
    const field = controlled.getByRole('textbox');
    await controlled.getByRole('button', { name: /Increase/ }).click();
    await expect.element(field).toHaveValue('4');
    await controlled.getByRole('button', { name: 'Set 8' }).click();
    await expect.element(field).toHaveValue('8');
    await controlled.unmount();
    const uncontrolled = await renderWithProvider(<Quantity defaultValue={2} />);
    await expect.element(uncontrolled.getByRole('textbox')).toHaveValue('2');
  });

  it('submits name and the raw number with the form', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Quantity name="quantity" defaultValue={1234.5} maxValue={5000} />
        <button type="submit">Save</button>
      </form>,
      { locale: 'pt-BR' },
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('quantity')).toBe('1234.5');
  });

  it('is required: no error before a submit attempt, error after', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <NumberField label="Quantity" name="quantity" isRequired errorMessage="Enter a quantity." />
        <button type="submit">Save</button>
      </form>,
    );
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Enter a quantity.');
    await expect.element(screen.getByRole('textbox')).toHaveFocus();
  });

  it('marks the field invalid when controlled and links the error', async () => {
    const screen = await renderWithProvider(<Quantity isInvalid errorMessage="Too many." />);
    const field = screen.getByRole('textbox');
    await expect.element(field).toHaveAccessibleDescription('Too many.');
    expect(field.element().getAttribute('aria-invalid')).toBe('true');
  });

  it('takes the button names from messages: pt-BR, provider and instance override', async () => {
    const ptBR = await renderWithProvider(<Quantity label="Quantidade" />, { locale: 'pt-BR' });
    await expect.element(ptBR.getByRole('button', { name: /Diminuir/ })).toBeInTheDocument();
    await expect.element(ptBR.getByRole('button', { name: /Aumentar/ })).toBeInTheDocument();
    await ptBR.unmount();
    const provider = await renderWithProvider(<Quantity />, {
      messages: { NumberField: { increase: 'More' } },
    });
    await expect.element(provider.getByRole('button', { name: /More/ })).toBeInTheDocument();
    await provider.unmount();
    const instance = await renderWithProvider(<Quantity messages={{ decrease: 'Fewer' }} />);
    await expect.element(instance.getByRole('button', { name: /Fewer/ })).toBeInTheDocument();
  });

  it('disables and makes read-only', async () => {
    const disabled = await renderWithProvider(<Quantity isDisabled />);
    await expect.element(disabled.getByRole('textbox')).toBeDisabled();
    await expect.element(disabled.getByRole('button', { name: /Increase/ })).toBeDisabled();
    await disabled.unmount();
    const readOnly = await renderWithProvider(<Quantity isReadOnly />);
    const field = readOnly.getByRole('textbox');
    await expect.element(field).toHaveAttribute('readonly');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(field).toHaveValue('5');
  });

  it('renders the sizes at 32, 40 and 48px, steppers included', async () => {
    const screen = await renderWithProvider(
      <>
        <Quantity label="Small" size="sm" />
        <Quantity label="Medium" />
        <Quantity label="Large" size="lg" />
      </>,
    );
    const heights = ['Small', 'Medium', 'Large'].map((name) => {
      const input = screen.getByRole('textbox', { name }).element();
      const group = input.closest('[role="group"]') as HTMLElement;
      return [...group.children].map((child) => child.getBoundingClientRect().height);
    });
    expect(heights).toEqual([
      [32, 32, 32],
      [40, 40, 40],
      [48, 48, 48],
    ]);
  });

  it('keeps the box border at 3:1 and shows the focus ring on the box', async () => {
    const screen = await renderWithProvider(<Quantity />);
    const box = screen.getByRole('textbox').element().parentElement as HTMLElement;
    expect(borderContrast(box)).toBeGreaterThanOrEqual(3);
    await userEvent.tab();
    expect(getComputedStyle(box).boxShadow).not.toBe('none');
    expect(borderContrast(box)).toBeGreaterThanOrEqual(3);
  });

  it('keeps the focus ring when the consumer passes onFocus and onBlur', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const screen = await renderWithProvider(<Quantity onFocus={onFocus} onBlur={onBlur} />);
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    const box = screen.getByRole('textbox').element().parentElement as HTMLElement;
    expect(getComputedStyle(box).boxShadow).not.toBe('none');
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('forwards className, ref and inputRef; warns without an accessible name', async () => {
    const ref = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();
    await renderWithProvider(<Quantity className="extra" ref={ref} inputRef={inputRef} />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(inputRef.current?.tagName).toBe('INPUT');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = {} as unknown as Parameters<typeof NumberField>[0];
    await renderWithProvider(<NumberField {...props} />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('NumberField needs an accessible name'),
    );
  });

  describe('axe', () => {
    it('has no violations: default, suffix, described, required, invalid, disabled, read-only', async () => {
      const screen = await renderWithProvider(
        <main>
          <Quantity label="Default" />
          <Quantity label="With suffix" suffix="m" />
          <Quantity label="Described" description="Pieces per box." />
          <Quantity label="Required" isRequired />
          <Quantity label="Invalid" isInvalid errorMessage="Too many." />
          <Quantity label="Disabled" isDisabled />
          <Quantity label="Read-only" isReadOnly />
          <NumberField aria-label="Unlabelled" defaultValue={1} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});

describe('NumberField fullWidth', () => {
  async function renderRow(props: { fullWidth?: boolean }) {
    return renderWithProvider(
      <div style={{ inlineSize: 700 }}>
        <Inline gap={2} wrap="nowrap">
          <NumberField label="Quantity" {...props} />
          <button type="button">Apply</button>
        </Inline>
      </div>,
    );
  }

  it('takes the free space of an Inline row, and not by default', async () => {
    const plain = await renderRow({});
    const plainRoot = plain.container.querySelector('[data-size]') as HTMLElement;
    expect(plainRoot.hasAttribute('data-full-width')).toBe(false);
    const plainWidth = plainRoot.getBoundingClientRect().width;
    await plain.unmount();
    const full = await renderRow({ fullWidth: true });
    const root = full.container.querySelector('[data-full-width="true"]') as HTMLElement;
    const button = full.container.querySelector('button:last-of-type') as HTMLElement;
    expect(root.getBoundingClientRect().width).toBeGreaterThan(plainWidth);
    expect(button.getBoundingClientRect().right).toBeCloseTo(700, 0);
  });
});
