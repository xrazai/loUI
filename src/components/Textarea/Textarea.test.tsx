import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { expectHovered } from '../../test/hover';
import { renderWithProvider } from '../../test/render';
import { borderContrast } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('names the field with its label and links description and aside', async () => {
    const screen = await renderWithProvider(
      <Textarea label="Notes" aside="Optional" description="Plain text only." />,
    );
    const field = screen.getByRole('textbox', { name: 'Notes' });
    await expect.element(field).toBeInTheDocument();
    // The aside is part of the description, not of the name.
    await expect.element(field).toHaveAccessibleDescription('Plain text only. Optional');
  });

  it('shows the required marker hidden from assistive technology and uses native required', async () => {
    const screen = await renderWithProvider(<Textarea label="Notes" isRequired />);
    await expect.element(screen.getByRole('textbox', { name: 'Notes' })).toBeRequired();
    expect(screen.container.querySelector('[aria-hidden="true"]')?.textContent).toBe('*');
  });

  it('shows the error only after a submit attempt and focuses the field', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Textarea label="Notes" name="notes" isRequired errorMessage="Write a note." />
        <button type="submit">Save</button>
      </form>,
    );
    const field = screen.getByRole('textbox', { name: 'Notes' });
    await userEvent.click(field);
    await userEvent.tab();
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Write a note.');
    await expect.element(field).toHaveFocus();
    await expect.element(field).toHaveAccessibleDescription('Write a note.');
  });

  it('marks the field invalid when controlled', async () => {
    const screen = await renderWithProvider(
      <Textarea label="Notes" isInvalid errorMessage="Too short." />,
    );
    await expect
      .element(screen.getByRole('textbox', { name: 'Notes' }))
      .toHaveAttribute('aria-invalid', 'true');
  });

  it('puts name and value in FormData inside a real form', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Textarea label="Notes" name="notes" defaultValue={'a\nb'} />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('notes')).toBe('a\nb');
  });

  it('works uncontrolled and controlled', async () => {
    const onChange = vi.fn();
    const uncontrolled = await renderWithProvider(
      <Textarea label="Notes" defaultValue="a" onChange={onChange} />,
    );
    await userEvent.type(uncontrolled.getByRole('textbox', { name: 'Notes' }), 'b');
    expect(onChange).toHaveBeenLastCalledWith('ba');
    await uncontrolled.unmount();

    function Controlled() {
      const [value, setValue] = useState('x');
      return <Textarea label="Notes" value={value} onChange={setValue} />;
    }
    const controlled = await renderWithProvider(<Controlled />);
    const field = controlled.getByRole('textbox', { name: 'Notes' });
    await userEvent.type(field, 'yz');
    await expect.element(field).toHaveValue('yzx');
  });

  it('keeps the focus ring when the consumer passes onFocus and onBlur', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const screen = await renderWithProvider(
      <Textarea label="Notes" onFocus={onFocus} onBlur={onBlur} />,
    );
    const field = screen.getByRole('textbox', { name: 'Notes' });
    await userEvent.click(field);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(field.element().getAttribute('data-focused')).toBe('true');
    expect(getComputedStyle(field.element()).boxShadow).not.toBe('none');
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
    await expect.poll(() => getComputedStyle(field.element()).boxShadow).toBe('none');
  });

  it('is disabled with a dashed border, and read only keeps its value', async () => {
    const screen = await renderWithProvider(
      <>
        <Textarea label="Disabled" isDisabled defaultValue="x" />
        <Textarea label="Read only" isReadOnly defaultValue="kept" />
      </>,
    );
    const disabled = screen.getByRole('textbox', { name: 'Disabled' });
    await expect.element(disabled).toBeDisabled();
    expect(getComputedStyle(disabled.element()).borderTopStyle).toBe('dashed');
    const readOnly = screen.getByRole('textbox', { name: 'Read only' });
    await userEvent.type(readOnly, 'x');
    await expect.element(readOnly).toHaveValue('kept');
  });

  it('applies the rows and resize options', async () => {
    const screen = await renderWithProvider(
      <>
        <Textarea label="Rows" rows={6} resize="none" />
        <Textarea label="Default" />
      </>,
    );
    const rows = screen.getByRole('textbox', { name: 'Rows' }).element();
    const standard = screen.getByRole('textbox', { name: 'Default' }).element();
    expect(rows.getAttribute('rows')).toBe('6');
    expect(getComputedStyle(rows).resize).toBe('none');
    expect(getComputedStyle(standard).resize).toBe('vertical');
    expect(rows.getBoundingClientRect().height).toBeGreaterThan(
      standard.getBoundingClientRect().height,
    );
  });

  it('grows with its content when autoGrow is set, and shrinks back', async () => {
    const screen = await renderWithProvider(<Textarea label="Notes" autoGrow rows={2} />);
    const field = screen.getByRole('textbox', { name: 'Notes' });
    const initial = field.element().getBoundingClientRect().height;
    await userEvent.type(field, '1{Enter}2{Enter}3{Enter}4{Enter}5{Enter}6');
    const grown = field.element().getBoundingClientRect().height;
    expect(grown).toBeGreaterThan(initial);
    await userEvent.clear(field);
    await expect
      .poll(() => field.element().getBoundingClientRect().height)
      .toBeLessThanOrEqual(initial + 1);
    expect(getComputedStyle(field.element()).resize).toBe('none');
  });

  describe('character count', () => {
    it('shows used and max, hidden from assistive technology, and updates as you type', async () => {
      const screen = await renderWithProvider(<Textarea label="Notes" maxLength={20} showCount />);
      await expect.element(screen.getByText('0 / 20')).toBeInTheDocument();
      expect(screen.getByText('0 / 20').element().getAttribute('aria-hidden')).toBe('true');
      await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), 'Hello');
      await expect.element(screen.getByText('5 / 20')).toBeInTheDocument();
    });

    it('announces the remaining characters politely, once typing pauses', async () => {
      const screen = await renderWithProvider(<Textarea label="Notes" maxLength={20} showCount />);
      const status = screen.getByRole('status');
      await expect.element(status).toHaveTextContent('');
      expect(status.element().getAttribute('aria-live')).toBe('polite');
      await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), 'Hello');
      // Not announced on every keystroke.
      expect(status.element().textContent).toBe('');
      await expect
        .poll(() => status.element().textContent, { timeout: 3000 })
        .toBe('15 characters remaining');
    });

    it('uses plural forms: singular and none remaining', async () => {
      const screen = await renderWithProvider(<Textarea label="Notes" maxLength={3} showCount />);
      const status = screen.getByRole('status');
      await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), 'ab');
      await expect
        .poll(() => status.element().textContent, { timeout: 3000 })
        .toBe('1 character remaining');
      await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), 'c');
      await expect
        .poll(() => status.element().textContent, { timeout: 3000 })
        .toBe('No characters remaining');
    });

    it('announces how far over the limit a controlled value is', async () => {
      function Paste() {
        const [value, setValue] = useState('');
        return (
          <>
            <Textarea label="Notes" maxLength={3} showCount value={value} onChange={setValue} />
            <button
              type="button"
              onClick={() => {
                setValue('abcde');
              }}
            >
              Paste
            </button>
          </>
        );
      }
      const screen = await renderWithProvider(<Paste />);
      await screen.getByRole('button', { name: 'Paste' }).click();
      await expect
        .poll(() => screen.getByRole('status').element().textContent, { timeout: 3000 })
        .toBe('2 characters over the limit');
    });

    it('speaks pt-BR, and lets the provider and the instance override the text', async () => {
      const ptBR = await renderWithProvider(<Textarea label="Notas" maxLength={5} showCount />, {
        locale: 'pt-BR',
      });
      await userEvent.type(ptBR.getByRole('textbox', { name: 'Notas' }), 'ab');
      await expect
        .poll(() => ptBR.getByRole('status').element().textContent, { timeout: 3000 })
        .toBe('3 caracteres restantes');
      await ptBR.unmount();

      const provider = await renderWithProvider(
        <Textarea label="Notes" maxLength={5} showCount />,
        {
          messages: { Textarea: { count: (used: string, max: string) => `${used} of ${max}` } },
        },
      );
      await expect.element(provider.getByText('0 of 5')).toBeInTheDocument();
      await provider.unmount();

      const instance = await renderWithProvider(
        <Textarea
          label="Notes"
          maxLength={5}
          showCount
          messages={{ count: (used: string, max: string) => `${used} sur ${max}` }}
        />,
        { messages: { Textarea: { count: (used: string, max: string) => `${used} of ${max}` } } },
      );
      await expect.element(instance.getByText('0 sur 5')).toBeInTheDocument();
    });

    it('does not render a counter without maxLength', async () => {
      const screen = await renderWithProvider(<Textarea label="Notes" showCount />);
      expect(screen.container.querySelector('[role="status"]')).toBeNull();
    });
  });

  it('forwards className, ref and textareaRef', async () => {
    const ref = createRef<HTMLDivElement>();
    const textareaRef = createRef<HTMLTextAreaElement>();
    await renderWithProvider(
      <Textarea label="Notes" className="extra" ref={ref} textareaRef={textareaRef} />,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(textareaRef.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('meets 3:1 border contrast at rest, hover, focus, invalid and read only', async () => {
    const screen = await renderWithProvider(
      <>
        <Textarea label="Rest" />
        <Textarea label="Invalid" isInvalid errorMessage="No." />
        <Textarea label="Read only" isReadOnly defaultValue="x" />
      </>,
    );
    const rest = screen.getByRole('textbox', { name: 'Rest' });
    expect(borderContrast(rest.element())).toBeGreaterThanOrEqual(3);
    const background = getComputedStyle(rest.element()).backgroundColor;
    await userEvent.hover(rest);
    await expectHovered(screen.container);
    await expect.poll(() => borderContrast(rest.element())).toBeGreaterThanOrEqual(3);
    await expect.poll(() => getComputedStyle(rest.element()).backgroundColor).toBe(background);
    await userEvent.click(rest);
    await expect.poll(() => borderContrast(rest.element())).toBeGreaterThanOrEqual(3);
    const invalid = screen.getByRole('textbox', { name: 'Invalid' });
    await userEvent.click(invalid);
    expect(borderContrast(invalid.element())).toBeGreaterThanOrEqual(3);
    expect(
      borderContrast(screen.getByRole('textbox', { name: 'Read only' }).element()),
    ).toBeGreaterThanOrEqual(3);
  });

  describe('axe', () => {
    it('has no violations by default, with aside, description and a character count', async () => {
      const screen = await renderWithProvider(
        <main>
          <Textarea label="Notes" />
          <Textarea
            label="With extras"
            aside="Optional"
            description="Plain text."
            maxLength={100}
            showCount
          />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no violations when required, invalid, read only, disabled or auto-growing', async () => {
      const screen = await renderWithProvider(
        <main>
          <Textarea label="Required" isRequired />
          <Textarea label="Invalid" isInvalid errorMessage="Write more." />
          <Textarea label="Read only" isReadOnly defaultValue="x" />
          <Textarea label="Disabled" isDisabled defaultValue="x" />
          <Textarea label="Auto" autoGrow />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
