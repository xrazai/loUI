import { createRef, useState } from 'react';

import type { SubmitEvent } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { expectHovered } from '../../test/hover';
import { renderWithProvider } from '../../test/render';
import { borderContrast } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Input } from './Input';

function controlOf(input: Element): HTMLElement {
  const control = input.parentElement;
  if (!control) throw new Error('Input has no control wrapper.');
  return control;
}

describe('Input', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('names the input with its label and links the description', async () => {
    const screen = await renderWithProvider(
      <Input label="Workspace name" description="Visible to everyone." />,
    );
    const input = screen.getByRole('textbox', { name: 'Workspace name' });
    await expect.element(input).toBeInTheDocument();
    await expect.element(input).toHaveAccessibleDescription('Visible to everyone.');
  });

  it('accepts aria-label when there is no visible label', async () => {
    const screen = await renderWithProvider(<Input aria-label="Search orders" />);
    await expect
      .element(screen.getByRole('textbox', { name: 'Search orders' }))
      .toBeInTheDocument();
  });

  it('shows a required marker that is hidden from assistive technology', async () => {
    const screen = await renderWithProvider(<Input label="Name" isRequired />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await expect.element(input).toBeRequired();
    const mark = screen.container.querySelector('[aria-hidden="true"]');
    expect(mark?.textContent).toBe('*');
  });

  it('takes the required marker from messages: instance override, provider override and pt-BR', async () => {
    const instance = await renderWithProvider(
      <Input label="Name" isRequired messages={{ requiredMark: '(required)' }} />,
    );
    expect(instance.container.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      '(required)',
    );
    await instance.unmount();

    const provider = await renderWithProvider(<Input label="Nome" isRequired />, {
      locale: 'pt-BR',
      messages: { Field: { requiredMark: '(obrigatório)' } },
    });
    expect(provider.container.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      '(obrigatório)',
    );
  });

  it('marks the field invalid and shows the error with the description', async () => {
    const screen = await renderWithProvider(
      <Input
        label="Email"
        description="We send the receipt here."
        isInvalid
        errorMessage="Enter a complete email address."
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    await expect.element(input).toHaveAttribute('aria-invalid', 'true');
    await expect
      .element(input)
      .toHaveAccessibleDescription('We send the receipt here. Enter a complete email address.');
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Enter a complete email address.');
  });

  it('does not show the error until a submit attempt (native validation)', async () => {
    const onSubmit = vi.fn((event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    const screen = await renderWithProvider(
      <form onSubmit={onSubmit}>
        <Input label="Name" name="name" isRequired errorMessage="Enter a name." />
        <button type="submit">Save</button>
      </form>,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    await userEvent.click(input);
    await userEvent.tab();
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Enter a name.');
    await expect.element(input).toHaveFocus();
    await expect.element(input).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the error once the value becomes valid and submits', async () => {
    let submitted: FormDataEntryValue | null = null;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = new FormData(event.currentTarget).get('name');
        }}
      >
        <Input label="Name" name="name" isRequired errorMessage="Enter a name." />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.fill(screen.getByRole('textbox', { name: 'Name' }), 'Acme');
    // Enter (implicit submission) instead of a click: the error disappears on blur and shifts the button.
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => submitted).toBe('Acme');
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
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
        <Input label="Workspace" name="workspace" defaultValue="Northwind" />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('workspace')).toBe('Northwind');
  });

  it('works uncontrolled with defaultValue', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Input label="Name" defaultValue="Acme" onChange={onChange} />,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    await expect.element(input).toHaveValue('Acme');
    await userEvent.type(input, '!');
    await expect.element(input).toHaveValue('Acme!');
    expect(onChange).toHaveBeenLastCalledWith('Acme!');
  });

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('a');
      return (
        <>
          <Input label="Name" value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await userEvent.type(input, 'bc');
    await expect.element(input).toHaveValue('abc');
    expect(screen.container.querySelector('output')?.textContent).toBe('abc');
  });

  it('keeps the focus ring when the consumer passes onFocus and onBlur (handoff defect)', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const screen = await renderWithProvider(
      <Input label="Name" onFocus={onFocus} onBlur={onBlur} />,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    const element = input.element();
    await userEvent.click(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(element.getAttribute('data-focused')).toBe('true');
    const control = controlOf(element);
    expect(getComputedStyle(control).boxShadow).not.toBe('none');
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(element.hasAttribute('data-focused')).toBe(false);
    await expect.poll(() => getComputedStyle(control).boxShadow).toBe('none');
  });

  it('composes a consumer onKeyDown with the internal handlers', async () => {
    const onKeyDown = vi.fn();
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Input label="Name" onKeyDown={onKeyDown} onChange={onChange} />,
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'a');
    expect(onKeyDown).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('is disabled with a dashed border and cannot be edited', async () => {
    const screen = await renderWithProvider(<Input label="Name" isDisabled defaultValue="x" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await expect.element(input).toBeDisabled();
    expect(getComputedStyle(controlOf(input.element())).borderTopStyle).toBe('dashed');
  });

  it('is read only: focusable, not editable, still submitted', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Input label="Code" name="code" isReadOnly defaultValue="ORD-1048" />
        <button type="submit">Save</button>
      </form>,
    );
    const input = screen.getByRole('textbox', { name: 'Code' });
    await userEvent.type(input, 'x');
    await expect.element(input).toHaveValue('ORD-1048');
    await expect.element(input).toHaveAttribute('readonly');
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('code')).toBe('ORD-1048');
  });

  it('renders the sizes at 32, 40 and 48px', async () => {
    const screen = await renderWithProvider(
      <>
        <Input label="Small" size="sm" />
        <Input label="Medium" />
        <Input label="Large" size="lg" />
      </>,
    );
    const heights = ['Small', 'Medium', 'Large'].map(
      (name) => getComputedStyle(controlOf(screen.getByRole('textbox', { name }).element())).height,
    );
    expect(heights).toEqual(['32px', '40px', '48px']);
  });

  it('uses the mono font and renders adornments', async () => {
    const screen = await renderWithProvider(
      <Input
        label="Code"
        mono
        leading={<span data-testid="lead">L</span>}
        trailing={<span data-testid="trail">T</span>}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Code' }).element();
    expect(getComputedStyle(input).fontFamily).toContain('Geist Mono');
    await expect.element(screen.getByTestId('lead')).toBeInTheDocument();
    await expect.element(screen.getByTestId('trail')).toBeInTheDocument();
  });

  it('forwards className to the root, ref to the root and inputRef to the input', async () => {
    const ref = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();
    await renderWithProvider(
      <Input label="Name" className="extra" ref={ref} inputRef={inputRef} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
  });

  it('warns once in development when there is no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = {} as unknown as Parameters<typeof Input>[0];
    await renderWithProvider(<Input {...props} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Input needs an accessible name'));
  });

  describe('border contrast (3:1 in every state, TOK-004)', () => {
    it('meets 3:1 at rest, hover, focus, invalid, invalid+focus and read only', async () => {
      const screen = await renderWithProvider(
        <>
          <Input label="Rest" />
          <Input label="Invalid" isInvalid errorMessage="Required." />
          <Input label="Read only" isReadOnly defaultValue="x" />
        </>,
      );
      const rest = controlOf(screen.getByRole('textbox', { name: 'Rest' }).element());
      expect(borderContrast(rest)).toBeGreaterThanOrEqual(3);

      const restBackground = getComputedStyle(rest).backgroundColor;
      await userEvent.hover(screen.getByRole('textbox', { name: 'Rest' }));
      await expectHovered(screen.container);
      await expect.poll(() => borderContrast(rest)).toBeGreaterThanOrEqual(3);
      await expect.poll(() => getComputedStyle(rest).backgroundColor).toBe(restBackground);

      await userEvent.click(screen.getByRole('textbox', { name: 'Rest' }));
      await expect.poll(() => borderContrast(rest)).toBeGreaterThanOrEqual(3);

      const invalid = controlOf(screen.getByRole('textbox', { name: 'Invalid' }).element());
      expect(borderContrast(invalid)).toBeGreaterThanOrEqual(3);
      await userEvent.click(screen.getByRole('textbox', { name: 'Invalid' }));
      expect(borderContrast(invalid)).toBeGreaterThanOrEqual(3);

      const readOnly = controlOf(screen.getByRole('textbox', { name: 'Read only' }).element());
      expect(borderContrast(readOnly)).toBeGreaterThanOrEqual(3);
    });
  });

  describe('axe', () => {
    it('has no axe violations by default and with a description', async () => {
      const screen = await renderWithProvider(
        <main>
          <Input label="Name" description="Shown on invoices." placeholder="Acme" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when required, invalid, read only, disabled, with adornments', async () => {
      const screen = await renderWithProvider(
        <main>
          <Input label="Required" isRequired />
          <Input label="Invalid" isInvalid errorMessage="Enter a value." />
          <Input label="Read only" isReadOnly defaultValue="ORD-1048" />
          <Input label="Disabled" isDisabled defaultValue="x" />
          <Input
            label="Adorned"
            leading={<span aria-hidden="true">#</span>}
            trailing={<span aria-hidden="true">kg</span>}
            mono
          />
          <Input aria-label="Search" size="lg" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
