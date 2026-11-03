import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Inline } from '../Inline';
import { borderContrast } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { SearchInput } from './SearchInput';
import type { SearchInputProps } from './SearchInput';

const items = [
  { label: 'Caderno liso', meta: 'SKU-204' },
  { label: 'Lâmpada de mesa', meta: 'SKU-118' },
  'Fone sem fio',
  'Caderno pautado',
];

function Search(props: Partial<Extract<SearchInputProps, { 'aria-label': string }>>) {
  return <SearchInput aria-label="Search products" {...props} />;
}

describe('SearchInput', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  describe('plain search field', () => {
    it('is a search box named by aria-label, with the placeholder from messages', async () => {
      const screen = await renderWithProvider(<Search />);
      const field = screen.getByRole('searchbox', { name: 'Search products' });
      expect(field.element().getAttribute('type')).toBe('search');
      expect(field.element().getAttribute('placeholder')).toBe('Search');
    });

    it('shows the clear button only with text; the button and Escape clear and keep focus', async () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      const screen = await renderWithProvider(<Search onChange={onChange} onClear={onClear} />);
      const field = screen.getByRole('searchbox');
      const clear = () => screen.container.querySelector('button');
      expect(clear() && getComputedStyle(clear() as Element).display).toBe('none');
      await userEvent.click(field);
      await userEvent.keyboard('cad');
      expect(onChange).toHaveBeenLastCalledWith('cad');
      await expect.element(screen.getByRole('button', { name: 'Clear search' })).toBeVisible();
      await screen.getByRole('button', { name: 'Clear search' }).click();
      await expect.element(field).toHaveValue('');
      expect(onClear).toHaveBeenCalledTimes(1);
      await expect.element(field).toHaveFocus();
      await userEvent.keyboard('abc{Escape}');
      await expect.element(field).toHaveValue('');
    });

    it('shows the decorative shortcut hint while empty and hides it from assistive technology', async () => {
      const screen = await renderWithProvider(<Search shortcut={['Mod', 'K']} />);
      const hint = screen.container.querySelector('[aria-hidden="true"] kbd') as HTMLElement;
      expect(hint).not.toBeNull();
      expect(getComputedStyle(hint.parentElement as Element).display).not.toBe('none');
      await userEvent.click(screen.getByRole('searchbox'));
      await userEvent.keyboard('x');
      expect(getComputedStyle(hint.parentElement as Element).display).toBe('none');
    });

    it('calls onSubmit with the text on Enter', async () => {
      const onSubmit = vi.fn();
      const screen = await renderWithProvider(<Search onSubmit={onSubmit} />);
      await userEvent.click(screen.getByRole('searchbox'));
      await userEvent.keyboard('fone{Enter}');
      expect(onSubmit).toHaveBeenCalledWith('fone');
    });

    it('wraps in a labelled search landmark when asked', async () => {
      const screen = await renderWithProvider(<Search landmark />);
      await expect
        .element(screen.getByRole('search', { name: 'Search products' }))
        .toBeInTheDocument();
      await screen.unmount();
      const none = await renderWithProvider(<Search />);
      expect(none.container.querySelector('[role="search"]')).toBeNull();
    });

    it('works controlled and uncontrolled, and submits with the form', async () => {
      let data: FormData | undefined;
      function Controlled() {
        const [value, setValue] = useState('fone');
        return (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              data = new FormData(event.currentTarget);
            }}
          >
            <Search name="q" value={value} onChange={setValue} />
            <button
              type="button"
              onClick={() => {
                setValue('caderno');
              }}
            >
              Set
            </button>
            <button type="submit">Go</button>
          </form>
        );
      }
      const screen = await renderWithProvider(<Controlled />);
      const field = screen.getByRole('searchbox');
      await expect.element(field).toHaveValue('fone');
      await screen.getByRole('button', { name: 'Set' }).click();
      await expect.element(field).toHaveValue('caderno');
      await screen.getByRole('button', { name: 'Go' }).click();
      expect(data?.get('q')).toBe('caderno');
      await screen.unmount();
      const uncontrolled = await renderWithProvider(<Search defaultValue="abc" />);
      await expect.element(uncontrolled.getByRole('searchbox')).toHaveValue('abc');
    });

    it('takes strings from messages: pt-BR, provider and instance overrides', async () => {
      const ptBR = await renderWithProvider(
        <Search aria-label="Buscar produtos" defaultValue="a" />,
        {
          locale: 'pt-BR',
        },
      );
      expect(ptBR.getByRole('searchbox').element().getAttribute('placeholder')).toBe('Buscar');
      await expect.element(ptBR.getByRole('button', { name: 'Limpar busca' })).toBeInTheDocument();
      await ptBR.unmount();
      const provider = await renderWithProvider(<Search defaultValue="a" />, {
        messages: { SearchInput: { clear: 'Reset' } },
      });
      await expect.element(provider.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
      await provider.unmount();
      const instance = await renderWithProvider(<Search placeholder="Find" />);
      expect(instance.getByRole('searchbox').element().getAttribute('placeholder')).toBe('Find');
    });

    it('disables, and keeps the border at 3:1 with a focus ring', async () => {
      const screen = await renderWithProvider(<Search />);
      const box = screen.getByRole('searchbox').element().parentElement as HTMLElement;
      expect(borderContrast(box)).toBeGreaterThanOrEqual(3);
      await userEvent.tab();
      expect(getComputedStyle(box).boxShadow).not.toBe('none');
      await screen.unmount();
      const disabled = await renderWithProvider(<Search isDisabled />);
      await expect.element(disabled.getByRole('searchbox')).toBeDisabled();
    });

    it('forwards className, ref and inputRef; warns without an accessible name', async () => {
      const ref = createRef<HTMLDivElement>();
      const inputRef = createRef<HTMLInputElement>();
      await renderWithProvider(<Search className="extra" ref={ref} inputRef={inputRef} />);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(inputRef.current?.tagName).toBe('INPUT');
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const props = {} as unknown as Parameters<typeof SearchInput>[0];
      await renderWithProvider(<SearchInput {...props} />);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('SearchInput needs an accessible name'),
      );
    });
  });

  describe('with suggestions', () => {
    it('is a combobox; typing shows matches accent- and case-insensitively with highlights', async () => {
      const screen = await renderWithProvider(<Search suggestions={items} />);
      const field = screen.getByRole('combobox', { name: 'Search products' });
      await userEvent.click(field);
      expect(document.querySelector('[role="listbox"]')).toBeNull();
      await userEvent.keyboard('LAMPADA');
      await expect.element(screen.getByRole('listbox')).toBeVisible();
      expect(screen.getByRole('option').elements()).toHaveLength(1);
      const marks = [...document.querySelectorAll('mark')].map((node) => node.textContent);
      expect(marks).toEqual(['Lâmpada']);
      expect(getComputedStyle(document.querySelector('mark') as Element).backgroundColor).toBe(
        'rgba(0, 0, 0, 0)',
      );
    });

    it('limits results with maxResults and shows meta in mono', async () => {
      const screen = await renderWithProvider(<Search suggestions={items} maxResults={1} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.keyboard('cad');
      expect(screen.getByRole('option').elements()).toHaveLength(1);
      const meta = [...document.querySelectorAll('[role="option"] span')].find(
        (node) => node.textContent === 'SKU-204',
      );
      expect(getComputedStyle(meta as Element).fontFamily).toContain('Geist Mono');
    });

    it('moves with the arrows, Enter selects, calls onSelect and fills the box', async () => {
      const onSelect = vi.fn();
      const screen = await renderWithProvider(<Search suggestions={items} onSelect={onSelect} />);
      const field = screen.getByRole('combobox');
      await userEvent.click(field);
      await userEvent.keyboard('cad{ArrowDown}');
      expect(field.element().getAttribute('aria-activedescendant')).not.toBeNull();
      await userEvent.keyboard('{ArrowDown}{Enter}');
      expect(onSelect).toHaveBeenCalledWith({
        label: 'Caderno pautado',
        meta: undefined,
        data: undefined,
      });
      await expect.element(field).toHaveValue('Caderno pautado');
      await expect.poll(() => document.querySelector('[role="listbox"]')).toBeNull();
    });

    it('Enter without a highlighted suggestion submits the text', async () => {
      const onSubmit = vi.fn();
      const screen = await renderWithProvider(<Search suggestions={items} onSubmit={onSubmit} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.keyboard('quartz{Enter}');
      expect(onSubmit).toHaveBeenCalledWith('quartz');
    });

    it('shows "No results" for text without matches, in pt-BR too', async () => {
      const screen = await renderWithProvider(<Search suggestions={items} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.keyboard('zzz');
      await expect.element(screen.getByRole('listbox')).toHaveTextContent('No results');
      await screen.unmount();
      const ptBR = await renderWithProvider(<Search suggestions={items} />, { locale: 'pt-BR' });
      await userEvent.click(ptBR.getByRole('combobox'));
      await userEvent.keyboard('zzz');
      await expect.element(ptBR.getByRole('listbox')).toHaveTextContent('Nenhum resultado');
    });

    it('clears with the button and with Escape (first closes the list, then clears)', async () => {
      const onClear = vi.fn();
      const screen = await renderWithProvider(<Search suggestions={items} onClear={onClear} />);
      const field = screen.getByRole('combobox');
      await userEvent.click(field);
      await userEvent.keyboard('cad');
      await expect.element(screen.getByRole('listbox')).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await expect.poll(() => document.querySelector('[role="listbox"]')).toBeNull();
      await expect.element(field).toHaveValue('cad');
      await userEvent.keyboard('{Escape}');
      await expect.element(field).toHaveValue('');
      expect(onClear).toHaveBeenCalledTimes(1);
      await userEvent.keyboard('fone');
      // While the list is open the rest of the page is hidden from the accessibility tree.
      (screen.container.querySelector('button') as HTMLElement).click();
      await expect.element(field).toHaveValue('');
    });

    it('uses the dropdown layer, the raised surface and fits a full-width box', async () => {
      const screen = await renderWithProvider(<Search suggestions={items} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.keyboard('cad');
      const popover = screen
        .getByRole('listbox')
        .element()
        .closest('[data-trigger="ComboBox"]') as HTMLElement;
      expect(getComputedStyle(popover).zIndex).toBe(
        getComputedStyle(document.documentElement).getPropertyValue('--ds-z-dropdown').trim(),
      );
      expect(popover.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    });

    it('works controlled', async () => {
      function Controlled() {
        const [value, setValue] = useState('');
        return (
          <>
            <Search suggestions={items} value={value} onChange={setValue} />
            <output>{value}</output>
          </>
        );
      }
      const screen = await renderWithProvider(<Controlled />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.keyboard('fone');
      expect(screen.container.querySelector('output')?.textContent).toBe('fone');
    });
  });

  describe('axe', () => {
    it('has no violations: plain, with text, with hint, disabled, labelled, landmark', async () => {
      const screen = await renderWithProvider(
        <main>
          <Search />
          <Search defaultValue="caderno" />
          <Search shortcut={['/']} aria-label="With hint" />
          <Search isDisabled aria-label="Disabled" />
          <SearchInput label="Visible label" />
          <Search landmark aria-label="Site search" />
          <Search suggestions={items} aria-label="With suggestions" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no violations with the suggestions list open and with the empty state', async () => {
      const screen = await renderWithProvider(
        <main>
          <Search suggestions={items} />
        </main>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.keyboard('cad');
      await expect.element(screen.getByRole('listbox')).toBeVisible();
      await expectNoA11yViolations(document.body);
      await userEvent.keyboard('zzz');
      await expect.element(screen.getByRole('listbox')).toHaveTextContent('No results');
      await expectNoA11yViolations(document.body);
    });
  });
});

describe('SearchInput fullWidth', () => {
  async function renderRow(props: { fullWidth?: boolean }) {
    return renderWithProvider(
      <div style={{ inlineSize: 700 }}>
        <Inline gap={2} wrap="nowrap">
          <SearchInput label="Search" {...props} />
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
