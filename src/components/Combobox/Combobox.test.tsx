import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { expectHovered } from '../../test/hover';
import { renderWithProvider } from '../../test/render';
import { borderContrast, cssColorToHex, tokenColor } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Combobox } from './Combobox';
import type { ComboboxProps } from './Combobox';

const customers = [
  { value: 'cafe', label: 'Café Central' },
  { value: 'halden', label: 'Halden & Co.', meta: '12 orders' },
  { value: 'mira', label: 'Mira Armazém', description: 'São Paulo' },
  { value: 'nordic', label: 'Nordic Goods' },
];

function Customers(props: Partial<ComboboxProps>) {
  return <Combobox label="Customer" options={customers} {...props} />;
}

function popoverOf(listbox: Element): HTMLElement {
  return listbox.closest('[data-trigger="ComboBox"]') as HTMLElement;
}

describe('Combobox', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('is an ARIA combobox named by its label and described by the description', async () => {
    const screen = await renderWithProvider(<Customers description="Who the order is for." />);
    const input = screen.getByRole('combobox', { name: 'Customer' });
    const element = input.element();
    expect(element.tagName).toBe('INPUT');
    expect(element.getAttribute('aria-expanded')).toBe('false');
    expect(element.getAttribute('aria-autocomplete')).toBe('list');
    await expect.element(input).toHaveAccessibleDescription('Who the order is for.');
  });

  it('opens on typing, filters accent- and case-insensitively, and wires the ARIA relations', async () => {
    const screen = await renderWithProvider(<Customers />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('CAFE');
    await expect.element(screen.getByRole('listbox')).toBeVisible();
    expect(screen.getByRole('option').elements()).toHaveLength(1);
    await expect.element(screen.getByRole('option', { name: 'Café Central' })).toBeVisible();
    expect(input.element().getAttribute('aria-expanded')).toBe('true');
    expect(input.element().getAttribute('aria-controls')).toBe(
      screen.getByRole('listbox').element().id,
    );
    await userEvent.clear(input);
    await userEvent.keyboard('armazem');
    await expect.element(screen.getByRole('option', { name: /Mira/ })).toBeVisible();
    expect(screen.getByRole('option').elements()).toHaveLength(1);
  });

  it('moves with ArrowDown/ArrowUp through aria-activedescendant, Enter selects, Escape closes then restores', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Customers onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await userEvent.tab();
    await expect.element(input).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    const active = input.element().getAttribute('aria-activedescendant');
    expect(active).not.toBeNull();
    expect(document.getElementById(active ?? '')?.getAttribute('role')).toBe('option');
    await expect.element(input).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('halden');
    await expect.element(input).toHaveValue('Halden & Co.');
    await expect.poll(() => document.querySelector('[role="listbox"]')).toBeNull();
    // Type something else, then Escape: the list closes and the selected text comes back.
    await userEvent.keyboard('{Control>}a{/Control}Nor');
    await expect.element(screen.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[role="listbox"]')).toBeNull();
    await expect.element(input).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(input).toHaveValue('Halden & Co.');
  });

  it('keeps Home and End for the caret in the input', async () => {
    const screen = await renderWithProvider(<Customers defaultInputValue="Nordic" />);
    const input = screen.getByRole('combobox');
    const element = input.element() as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.keyboard('{Home}');
    expect(element.selectionStart).toBe(0);
    await userEvent.keyboard('{End}');
    expect(element.selectionStart).toBe(element.value.length);
    await expect.element(input).toHaveFocus();
  });

  it('selects by clicking and shows the check on the selected option when reopened', async () => {
    const screen = await renderWithProvider(<Customers />);
    const input = screen.getByRole('combobox');
    await screen.getByRole('button', { name: /Show options/ }).click();
    expect(screen.getByRole('option').elements()).toHaveLength(4);
    await screen.getByRole('option', { name: /Nordic/ }).click();
    await expect.element(input).toHaveValue('Nordic Goods');
    await screen.getByRole('button', { name: /Show options/ }).click();
    const selected = screen.getByRole('option', { name: /Nordic/ }).element();
    expect(selected.getAttribute('aria-selected')).toBe('true');
    expect(selected.querySelector('svg')).not.toBeNull();
    // Opening with the button shows every option, not only the one matching the text.
    expect(screen.getByRole('option').elements()).toHaveLength(4);
  });

  it('shows the empty state from messages, in the three layers of overrides and pt-BR', async () => {
    const screen = await renderWithProvider(<Customers />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('zzz');
    await expect.element(screen.getByRole('listbox')).toHaveTextContent('No results');
    await screen.unmount();
    const ptBR = await renderWithProvider(<Customers label="Cliente" />, { locale: 'pt-BR' });
    await expect.element(ptBR.getByRole('button', { name: /Mostrar opções/ })).toBeInTheDocument();
    await userEvent.click(ptBR.getByRole('combobox'));
    await userEvent.keyboard('zzz');
    await expect.element(ptBR.getByRole('listbox')).toHaveTextContent('Nenhum resultado');
    await ptBR.unmount();
    const provider = await renderWithProvider(<Customers />, {
      messages: { Combobox: { noResults: 'Nothing found' } },
    });
    await userEvent.click(provider.getByRole('combobox'));
    await userEvent.keyboard('zzz');
    await expect.element(provider.getByRole('listbox')).toHaveTextContent('Nothing found');
    await provider.unmount();
    const instance = await renderWithProvider(<Customers messages={{ noResults: 'Empty' }} />);
    await userEvent.click(instance.getByRole('combobox'));
    await userEvent.keyboard('zzz');
    await expect.element(instance.getByRole('listbox')).toHaveTextContent('Empty');
  });

  it('renders description and meta, announced as part of the option name', async () => {
    const screen = await renderWithProvider(<Customers />);
    await screen.getByRole('button', { name: /Show options/ }).click();
    const withMeta = screen.getByRole('option', { name: /Halden/ });
    await expect.element(withMeta).toHaveAccessibleName('Halden & Co. 12 orders');
    const meta = [...withMeta.element().querySelectorAll('span')].findLast(
      (node) => node.textContent === '12 orders',
    );
    expect(getComputedStyle(meta as Element).fontFamily).toContain('Geist Mono');
    await expect
      .element(screen.getByRole('option', { name: /Mira/ }))
      .toHaveAccessibleName('Mira Armazém São Paulo');
  });

  it('renders sections with captions and skips disabled options', async () => {
    const screen = await renderWithProvider(
      <Customers
        options={[
          {
            id: 'eu',
            label: 'Europe',
            options: [
              { value: 'a', label: 'Alpha' },
              { value: 'b', label: 'Beta', isDisabled: true },
              { value: 'c', label: 'Gamma' },
            ],
          },
          { id: 'am', label: 'Americas', options: [{ value: 'd', label: 'Delta' }] },
        ]}
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('group', { name: 'Europe' })).toBeInTheDocument();
    await expect.element(screen.getByRole('group', { name: 'Americas' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Beta' }).element().getAttribute('aria-disabled'),
    ).toBe('true');
    await userEvent.keyboard('{ArrowDown}');
    const active = screen.getByRole('combobox').element().getAttribute('aria-activedescendant');
    expect(document.getElementById(active ?? '')?.textContent).toContain('Gamma');
  });

  it('with allowsCustomValue the typed text is a valid value and submits as text', async () => {
    let data: FormData | undefined;
    const onInputChange = vi.fn();
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Customers name="customer" allowsCustomValue onInputChange={onInputChange} />
        <button type="submit">Save</button>
      </form>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('Brand new customer');
    await userEvent.tab();
    expect(onInputChange).toHaveBeenLastCalledWith('Brand new customer');
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('customer')).toBe('Brand new customer');
  });

  it('submits the selected option value under name (not the label)', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Customers name="customer" defaultValue="mira" />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('customer')).toBe('mira');
    await expect.element(screen.getByRole('combobox')).toHaveValue('Mira Armazém');
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('nordic');
      return (
        <>
          <Customers value={value} onChange={setValue} />
          <button
            type="button"
            onClick={() => {
              setValue('cafe');
            }}
          >
            Set cafe
          </button>
          <output>{String(value)}</output>
        </>
      );
    }
    const controlled = await renderWithProvider(<Controlled />);
    const input = controlled.getByRole('combobox');
    await expect.element(input).toHaveValue('Nordic Goods');
    await controlled.getByRole('button', { name: /Show options/ }).click();
    await controlled.getByRole('option', { name: /Halden/ }).click();
    expect(controlled.container.querySelector('output')?.textContent).toBe('halden');
    await controlled.getByRole('button', { name: 'Set cafe' }).click();
    await expect.element(input).toHaveValue('Café Central');
    await controlled.unmount();
    const uncontrolled = await renderWithProvider(<Customers defaultValue="mira" />);
    await expect.element(uncontrolled.getByRole('combobox')).toHaveValue('Mira Armazém');
  });

  it('supports async loading: no client filter, a spinner, and a Loading row when empty', async () => {
    const onInputChange = vi.fn();
    const screen = await renderWithProvider(
      <Customers options={[]} filter={false} isLoading onInputChange={onInputChange} />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('hal');
    expect(onInputChange).toHaveBeenLastCalledWith('hal');
    await expect.element(screen.getByRole('listbox')).toHaveTextContent('Loading');
    // While the list is open React Aria hides the rest of the page from assistive technology.
    expect(screen.container.querySelector('[role="progressbar"]')?.getAttribute('aria-label')).toBe(
      'Loading',
    );
    await screen.rerender(
      <Customers
        options={customers}
        filter={false}
        isLoading={false}
        onInputChange={onInputChange}
      />,
    );
    // Server-side filtering: every option the consumer passes is shown, whatever was typed.
    await expect.poll(() => screen.getByRole('option').elements().length).toBe(4);
    expect(screen.container.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('accepts a custom filter', async () => {
    const screen = await renderWithProvider(
      <Customers filter={(label, query) => label.startsWith(query)} />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('Nor');
    expect(screen.getByRole('option').elements()).toHaveLength(1);
    await expect.element(screen.getByRole('option', { name: /Nordic/ })).toBeVisible();
    await userEvent.clear(screen.getByRole('combobox'));
    await userEvent.keyboard('ordic');
    await expect.element(screen.getByRole('listbox')).toHaveTextContent('No results');
  });

  it('is required: no error before a submit attempt, error after', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Customers name="customer" isRequired errorMessage="Choose a customer." />
        <button type="submit">Save</button>
      </form>,
    );
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Choose a customer.');
    await expect.element(screen.getByRole('combobox')).toHaveFocus();
  });

  it('marks the field invalid when controlled and links the error', async () => {
    const screen = await renderWithProvider(<Customers isInvalid errorMessage="Pick one." />);
    const input = screen.getByRole('combobox');
    await expect.element(input).toHaveAccessibleDescription('Pick one.');
    expect(input.element().getAttribute('aria-invalid')).toBe('true');
  });

  it('disables and makes read-only', async () => {
    const disabled = await renderWithProvider(<Customers isDisabled />);
    await expect.element(disabled.getByRole('combobox')).toBeDisabled();
    await expect.element(disabled.getByRole('button', { name: /Show options/ })).toBeDisabled();
    await disabled.unmount();
    const readOnly = await renderWithProvider(<Customers isReadOnly defaultValue="mira" />);
    await userEvent.click(readOnly.getByRole('combobox'));
    await userEvent.keyboard('x');
    await expect.element(readOnly.getByRole('combobox')).toHaveValue('Mira Armazém');
  });

  it('styles the overlay: raised surface, overlay shadow, radius lg, dropdown layer, 36px items, as wide as the box', async () => {
    const screen = await renderWithProvider(
      <div style={{ maxInlineSize: 320 }}>
        <Customers />
      </div>,
    );
    await screen.getByRole('button', { name: /Show options/ }).click();
    const listbox = screen.getByRole('listbox').element();
    const popover = popoverOf(listbox);
    const style = getComputedStyle(popover);
    expect(cssColorToHex(style.backgroundColor)).toBe(tokenColor('--ds-surface-raised'));
    expect(style.borderTopLeftRadius).toBe('10px');
    expect(style.boxShadow).not.toBe('none');
    expect(style.zIndex).toBe(
      getComputedStyle(document.documentElement).getPropertyValue('--ds-z-dropdown').trim(),
    );
    expect(
      screen.getByRole('option', { name: 'Nordic Goods' }).element().getBoundingClientRect().height,
    ).toBe(36);
    const box = screen.getByRole('combobox').element().parentElement as HTMLElement;
    expect(popover.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      box.getBoundingClientRect().width - 1,
    );
  });

  it('never grows wider than the viewport: a full-width box keeps its list open', async () => {
    const screen = await renderWithProvider(<Customers />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('listbox')).toBeVisible();
    await expect
      .poll(() => document.documentElement.scrollWidth)
      .toBeLessThanOrEqual(document.documentElement.clientWidth);
    const popover = popoverOf(screen.getByRole('listbox').element());
    expect(popover.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
  });

  it('renders the sizes at 32, 40 and 48px', async () => {
    const screen = await renderWithProvider(
      <>
        <Customers label="Small" size="sm" />
        <Customers label="Medium" />
        <Customers label="Large" size="lg" />
      </>,
    );
    const heights = ['Small', 'Medium', 'Large'].map(
      (name) =>
        (
          screen.getByRole('combobox', { name }).element().parentElement as HTMLElement
        ).getBoundingClientRect().height,
    );
    expect(heights).toEqual([32, 40, 48]);
  });

  it('keeps the box border at 3:1 at rest, hover, focus and invalid, with no background change', async () => {
    const screen = await renderWithProvider(
      <>
        <Customers label="Rest" />
        <Customers label="Bad" isInvalid errorMessage="No." />
      </>,
    );
    const input = screen.getByRole('combobox', { name: 'Rest' });
    const box = input.element().parentElement as HTMLElement;
    expect(borderContrast(box)).toBeGreaterThanOrEqual(3);
    const background = getComputedStyle(box).backgroundColor;
    await userEvent.hover(input);
    await expectHovered(screen.container);
    await expect.poll(() => borderContrast(box)).toBeGreaterThanOrEqual(3);
    await expect.poll(() => getComputedStyle(box).backgroundColor).toBe(background);
    await userEvent.tab();
    await expect.poll(() => borderContrast(box)).toBeGreaterThanOrEqual(3);
    await expect.poll(() => getComputedStyle(box).boxShadow).not.toBe('none');
    expect(
      borderContrast(
        screen.getByRole('combobox', { name: 'Bad' }).element().parentElement as HTMLElement,
      ),
    ).toBeGreaterThanOrEqual(3);
  });

  it('keeps the focus ring when the consumer passes onFocus and onBlur', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const screen = await renderWithProvider(<Customers onFocus={onFocus} onBlur={onBlur} />);
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    const box = screen.getByRole('combobox').element().parentElement as HTMLElement;
    expect(getComputedStyle(box).boxShadow).not.toBe('none');
    await userEvent.tab();
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('forwards className, ref and inputRef; warns without an accessible name', async () => {
    const ref = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();
    await renderWithProvider(<Customers className="extra" ref={ref} inputRef={inputRef} />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(inputRef.current?.getAttribute('role')).toBe('combobox');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = { options: customers } as unknown as Parameters<typeof Combobox>[0];
    await renderWithProvider(<Combobox {...props} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Combobox needs an accessible name'));
  });

  describe('axe', () => {
    it('has no violations: closed in default, selected, described, required, invalid, disabled, loading', async () => {
      const screen = await renderWithProvider(
        <main>
          <Customers label="Default" />
          <Customers label="Selected" defaultValue="mira" description="Who the order is for." />
          <Customers label="Required" isRequired />
          <Customers label="Invalid" isInvalid errorMessage="Choose one." />
          <Customers label="Disabled" isDisabled />
          <Customers label="Loading" isLoading />
          <Combobox aria-label="Unlabelled" options={customers} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no violations with the list open: sections, meta, description, selection, disabled option', async () => {
      const screen = await renderWithProvider(
        <main>
          <Customers
            defaultValue="halden"
            options={[
              { id: 'a', label: 'Active', options: customers },
              {
                id: 'b',
                label: 'Archived',
                options: [{ value: 'old', label: 'Old Mill', isDisabled: true }],
              },
            ]}
          />
        </main>,
      );
      await screen.getByRole('button', { name: /Show options/ }).click();
      await expect.element(screen.getByRole('listbox')).toBeVisible();
      await expectNoA11yViolations(document.body);
    });

    it('has no violations with the empty state and the loading state open', async () => {
      const empty = await renderWithProvider(
        <main>
          <Customers />
        </main>,
      );
      await userEvent.click(empty.getByRole('combobox'));
      await userEvent.keyboard('zzz');
      await expect.element(empty.getByRole('listbox')).toHaveTextContent('No results');
      await expectNoA11yViolations(document.body);
      await empty.unmount();
      const loading = await renderWithProvider(
        <main>
          <Customers options={[]} filter={false} isLoading />
        </main>,
      );
      await userEvent.click(loading.getByRole('combobox'));
      await userEvent.keyboard('a');
      await expect.element(loading.getByRole('listbox')).toHaveTextContent('Loading');
      await expectNoA11yViolations(document.body);
    });
  });
});
