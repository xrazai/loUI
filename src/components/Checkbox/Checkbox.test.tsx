import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { expectHovered } from '../../test/hover';
import { renderWithProvider } from '../../test/render';
import { borderContrast, cssColorToHex, tokenColor } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

function boxOf(input: Element): HTMLElement {
  const label = input.closest('label');
  const box = [...(label?.children ?? [])].find((child) => !child.contains(input));
  if (!(box instanceof HTMLElement)) throw new Error('Checkbox box not found.');
  return box;
}

describe('Checkbox', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('is a native checkbox named by its label, with the description kept out of the name', async () => {
    const screen = await renderWithProvider(
      <Checkbox label="Weekly summary" description="Sent on Monday." />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Weekly summary' });
    await expect.element(checkbox).toBeInTheDocument();
    expect(checkbox.element().tagName).toBe('INPUT');
    expect(checkbox.element().getAttribute('type')).toBe('checkbox');
    await expect.element(checkbox).toHaveAccessibleDescription('Sent on Monday.');
  });

  it('toggles with Space, and a click on the label text', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Checkbox label="Weekly summary" onChange={onChange} />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Weekly summary' });
    await userEvent.tab();
    await expect.element(checkbox).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(checkbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    await screen.getByText('Weekly summary').click();
    await expect.element(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [selected, setSelected] = useState(true);
      return <Checkbox label="Controlled" isSelected={selected} onChange={setSelected} />;
    }
    const controlled = await renderWithProvider(<Controlled />);
    const checkbox = controlled.getByRole('checkbox', { name: 'Controlled' });
    await expect.element(checkbox).toBeChecked();
    await controlled.getByText('Controlled').click();
    await expect.element(checkbox).not.toBeChecked();
    await controlled.unmount();

    const uncontrolled = await renderWithProvider(
      <Checkbox label="Uncontrolled" defaultSelected />,
    );
    await expect
      .element(uncontrolled.getByRole('checkbox', { name: 'Uncontrolled' }))
      .toBeChecked();
  });

  it('supports the indeterminate state', async () => {
    const screen = await renderWithProvider(<Checkbox label="Select all" isIndeterminate />);
    const checkbox = screen.getByRole('checkbox', { name: 'Select all' });
    expect((checkbox.element() as HTMLInputElement).indeterminate).toBe(true);
    expect(checkbox.element().closest('label')?.getAttribute('data-indeterminate')).toBe('true');
  });

  it('accepts aria-label when there is no visible label', async () => {
    const screen = await renderWithProvider(<Checkbox aria-label="Select row" />);
    await expect.element(screen.getByRole('checkbox', { name: 'Select row' })).toBeInTheDocument();
  });

  it('warns once in development when there is no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = {} as unknown as Parameters<typeof Checkbox>[0];
    await renderWithProvider(<Checkbox {...props} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Checkbox needs an accessible name'));
  });

  it('submits name and value only while checked', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Checkbox label="Newsletter" name="newsletter" value="yes" />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.has('newsletter')).toBe(false);
    await screen.getByText('Newsletter').click();
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('newsletter')).toBe('yes');
  });

  it('is required: no error before submit, error and focus after a failed attempt', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Checkbox
          label="Terms"
          name="terms"
          isRequired
          errorMessage="Accept the terms to continue."
        />
        <button type="submit">Save</button>
      </form>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Terms' });
    await expect.element(checkbox).toBeRequired();
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Accept the terms to continue.');
    await expect.element(checkbox).toHaveFocus();
    await expect.element(checkbox).toHaveAccessibleDescription('Accept the terms to continue.');
  });

  it('shows the required marker from messages: default, pt-BR provider and instance override', async () => {
    const mark = (container: Element) =>
      container.querySelector('[aria-hidden="true"]')?.textContent;
    const base = await renderWithProvider(<Checkbox label="Terms" isRequired />);
    expect(mark(base.container)).toBe('*');
    await base.unmount();
    const provider = await renderWithProvider(<Checkbox label="Termos" isRequired />, {
      locale: 'pt-BR',
      messages: { Field: { requiredMark: '(obrigatório)' } },
    });
    expect(mark(provider.container)).toBe('(obrigatório)');
    await provider.unmount();
    const instance = await renderWithProvider(
      <Checkbox label="Terms" isRequired messages={{ requiredMark: '(required)' }} />,
    );
    expect(mark(instance.container)).toBe('(required)');
  });

  it('is disabled (single opacity token) and read only (not togglable)', async () => {
    const screen = await renderWithProvider(
      <>
        <Checkbox label="Disabled" isDisabled />
        <Checkbox label="Read only" isReadOnly defaultSelected />
      </>,
    );
    const disabled = screen.getByRole('checkbox', { name: 'Disabled' });
    await expect.element(disabled).toBeDisabled();
    const row = disabled.element().closest('label');
    expect(Number(getComputedStyle(row as Element).opacity)).toBeCloseTo(0.35, 2);
    const readOnly = screen.getByRole('checkbox', { name: 'Read only' });
    await screen.getByText('Read only').click();
    await expect.element(readOnly).toBeChecked();
  });

  it('draws an 18px box with the radius token, a 24px minimum row and the accent when checked', async () => {
    const screen = await renderWithProvider(<Checkbox label="Weekly summary" defaultSelected />);
    const input = screen.getByRole('checkbox', { name: 'Weekly summary' }).element();
    const box = boxOf(input);
    const style = getComputedStyle(box);
    expect(style.width).toBe('18px');
    expect(style.height).toBe('18px');
    expect(style.borderTopLeftRadius).toBe('5px');
    expect(cssColorToHex(style.backgroundColor)).toBe(tokenColor('--ds-accent'));
    expect(box.querySelector('svg')).not.toBeNull();
    const row = input.closest('label') as HTMLElement;
    expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  });

  it('keeps the unchecked box border at 3:1 or better at rest, hover, focus and invalid', async () => {
    const screen = await renderWithProvider(
      <>
        <Checkbox label="Rest" />
        <Checkbox label="Invalid" isInvalid />
      </>,
    );
    const rest = screen.getByRole('checkbox', { name: 'Rest' });
    const box = boxOf(rest.element());
    expect(borderContrast(box)).toBeGreaterThanOrEqual(3);
    const background = getComputedStyle(box).backgroundColor;
    await userEvent.hover(screen.getByText('Rest'));
    await expectHovered(screen.container);
    await expect.poll(() => borderContrast(box)).toBeGreaterThanOrEqual(3);
    await expect.poll(() => getComputedStyle(box).backgroundColor).toBe(background);
    await userEvent.tab();
    await expect.element(rest).toHaveFocus();
    await expect.poll(() => borderContrast(box)).toBeGreaterThanOrEqual(3);
    await expect.poll(() => getComputedStyle(box).boxShadow).not.toBe('none');
    const invalidBox = boxOf(screen.getByRole('checkbox', { name: 'Invalid' }).element());
    expect(borderContrast(invalidBox)).toBeGreaterThanOrEqual(3);
  });

  it('forwards className, ref and inputRef', async () => {
    const ref = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();
    await renderWithProvider(
      <Checkbox label="A" className="extra" ref={ref} inputRef={inputRef} />,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
  });

  it('composes consumer focus handlers with the focus ring', async () => {
    const onFocus = vi.fn();
    const screen = await renderWithProvider(<Checkbox label="A" onFocus={onFocus} />);
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(
      screen
        .getByRole('checkbox', { name: 'A' })
        .element()
        .closest('label')
        ?.hasAttribute('data-focus-visible'),
    ).toBe(true);
  });

  describe('axe', () => {
    it('has no violations: unchecked, checked, indeterminate, with description', async () => {
      const screen = await renderWithProvider(
        <main>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultSelected />
          <Checkbox label="Indeterminate" isIndeterminate />
          <Checkbox label="With description" description="More detail." />
          <Checkbox aria-label="Row" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no violations: required, invalid, disabled, read only', async () => {
      const screen = await renderWithProvider(
        <main>
          <Checkbox label="Required" isRequired />
          <Checkbox label="Invalid" isInvalid errorMessage="Fix this." />
          <Checkbox label="Disabled" isDisabled />
          <Checkbox label="Read only" isReadOnly defaultSelected />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});

describe('CheckboxGroup', () => {
  it('is a labelled group with a shared description', async () => {
    const screen = await renderWithProvider(
      <CheckboxGroup label="Notify me about" description="Choose at least one.">
        <Checkbox value="orders" label="Orders" />
        <Checkbox value="stock" label="Stock" />
      </CheckboxGroup>,
    );
    const group = screen.getByRole('group', { name: 'Notify me about' });
    await expect.element(group).toBeInTheDocument();
    await expect.element(group).toHaveAccessibleDescription('Choose at least one.');
  });

  it('is uncontrolled with defaultValue and reports the array through onChange', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <CheckboxGroup label="Topics" defaultValue={['orders']} onChange={onChange}>
        <Checkbox value="orders" label="Orders" />
        <Checkbox value="stock" label="Stock" />
      </CheckboxGroup>,
    );
    await expect.element(screen.getByRole('checkbox', { name: 'Orders' })).toBeChecked();
    await screen.getByText('Stock').click();
    expect(onChange).toHaveBeenLastCalledWith(['orders', 'stock']);
  });

  it('is controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <>
          <CheckboxGroup label="Topics" value={value} onChange={setValue}>
            <Checkbox value="orders" label="Orders" />
            <Checkbox value="stock" label="Stock" />
          </CheckboxGroup>
          <output>{value.join(',')}</output>
        </>
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await screen.getByText('Stock').click();
    await screen.getByText('Orders').click();
    expect(screen.container.querySelector('output')?.textContent).toBe('stock,orders');
  });

  it('submits every selected value under the group name', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <CheckboxGroup label="Topics" name="topics" defaultValue={['orders', 'stock']}>
          <Checkbox value="orders" label="Orders" />
          <Checkbox value="stock" label="Stock" />
          <Checkbox value="payments" label="Payments" />
        </CheckboxGroup>
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.getAll('topics')).toEqual(['orders', 'stock']);
  });

  it('disables every checkbox when the group is disabled', async () => {
    const screen = await renderWithProvider(
      <CheckboxGroup label="Topics" isDisabled>
        <Checkbox value="orders" label="Orders" />
      </CheckboxGroup>,
    );
    await expect.element(screen.getByRole('checkbox', { name: 'Orders' })).toBeDisabled();
  });

  it('dims a disabled group once, not once per element', async () => {
    const screen = await renderWithProvider(
      <CheckboxGroup label="Topics" isDisabled>
        <Checkbox value="orders" label="Orders" />
      </CheckboxGroup>,
    );
    const group = screen.getByRole('group', { name: 'Topics' }).element();
    // The group label and each checkbox dim once; the group root itself does not dim.
    expect(Number(getComputedStyle(group).opacity)).toBe(1);
    expect(Number(getComputedStyle(group.querySelector('span') as Element).opacity)).toBeCloseTo(
      0.35,
      2,
    );
    const row = screen.getByRole('checkbox', { name: 'Orders' }).element().closest('label');
    expect(Number(getComputedStyle(row as Element).opacity)).toBeCloseTo(0.35, 2);
  });

  it('shows the group error after a failed submit when the group is required', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <CheckboxGroup label="Topics" name="topics" isRequired errorMessage="Choose a topic.">
          <Checkbox value="orders" label="Orders" />
          <Checkbox value="stock" label="Stock" />
        </CheckboxGroup>
        <button type="submit">Save</button>
      </form>,
    );
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Choose a topic.');
  });

  it('has no axe violations: default, horizontal, invalid', async () => {
    const screen = await renderWithProvider(
      <main>
        <CheckboxGroup label="Vertical" description="Pick any.">
          <Checkbox value="a" label="A" />
          <Checkbox value="b" label="B" />
        </CheckboxGroup>
        <CheckboxGroup label="Horizontal" orientation="horizontal" isRequired>
          <Checkbox value="a" label="A" />
          <Checkbox value="b" label="B" />
        </CheckboxGroup>
        <CheckboxGroup label="Invalid" isInvalid errorMessage="Pick one.">
          <Checkbox value="a" label="A" />
        </CheckboxGroup>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
