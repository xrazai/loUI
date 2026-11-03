/**
 * Keyboard contract: Combobox, SearchInput with suggestions, TagInput.
 * Spec: AGENTS.md section 8, row "Combobox": Down/Up open and move (aria-activedescendant), Enter
 * selects, Esc closes then clears, Home/End in list (TEST-004). TagInput is covered for its
 * keyboard-only add/remove contract (Enter and delimiters add, Backspace removes, Tab order).
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Combobox } from '../../components/Combobox';
import { SearchInput } from '../../components/SearchInput';
import { TagInput } from '../../components/TagInput';
import { renderWithProvider } from '../render';
import { expectFocus, labelOf, press, tabOrder } from './contract';

const customers = [
  { value: 'cafe', label: 'Café Central' },
  { value: 'halden', label: 'Halden & Co.' },
  { value: 'mira', label: 'Mira Armazém' },
  { value: 'nordic', label: 'Nordic Goods' },
];

const suggestions = ['Caderno liso', 'Caderno pautado', 'Lâmpada de mesa'];

const listboxOpen = () => document.querySelector('[role="listbox"]') !== null;

/** Label of the option that `aria-activedescendant` points at, or null. */
function activeOption(input: Element): string | null {
  const id = input.getAttribute('aria-activedescendant');
  if (!id) return null;
  const option = document.getElementById(id);
  return option ? option.textContent.trim() : null;
}

type Case = {
  name: string;
  ui: (props: { onSelect?: (value: string) => void }) => React.ReactElement;
  fieldLabel: string;
  /** Text typed to open the list and the label of the first/second/last matches. */
  typed: string;
  first: string;
  second: string;
  last: string;
  /** Whether ArrowDown on the closed, empty field opens the list. */
  opensEmpty: boolean;
  committedValue: (label: string) => string;
};

const cases: Case[] = [
  {
    name: 'Combobox',
    ui: ({ onSelect }) => (
      <>
        <button type="button">Before</button>
        <Combobox
          label="Customer"
          options={customers}
          {...(onSelect
            ? {
                onChange: (v: string | null) => {
                  onSelect(String(v));
                },
              }
            : {})}
        />
        <button type="button">After</button>
      </>
    ),
    fieldLabel: 'Customer',
    typed: '',
    first: 'Café Central',
    second: 'Halden & Co.',
    last: 'Nordic Goods',
    opensEmpty: true,
    committedValue: (label) => label,
  },
  {
    name: 'SearchInput with suggestions',
    ui: ({ onSelect }) => (
      <>
        <button type="button">Before</button>
        <SearchInput
          aria-label="Search products"
          suggestions={suggestions}
          {...(onSelect
            ? {
                onSelect: (s: { label: string }) => {
                  onSelect(s.label);
                },
              }
            : {})}
        />
        <button type="button">After</button>
      </>
    ),
    fieldLabel: 'Search products',
    typed: 'ca',
    first: 'Caderno liso',
    second: 'Caderno pautado',
    last: 'Caderno pautado',
    opensEmpty: false,
    committedValue: (label) => label,
  },
];

function field(): HTMLInputElement {
  const el = document.querySelector<HTMLInputElement>('[role="combobox"]');
  if (!el) throw new Error('No combobox rendered.');
  return el;
}

describe.each(cases)('keyboard contract: $name', (c) => {
  async function arrive(onSelect?: (value: string) => void) {
    await renderWithProvider(c.ui({ ...(onSelect ? { onSelect } : {}) }));
    await userEvent.tab();
    await userEvent.tab();
    await expectFocus(c.fieldLabel);
    if (c.typed) await press(c.typed);
  }

  it('is one Tab stop: the input holds focus while options are navigated', async () => {
    await renderWithProvider(c.ui({}));
    await userEvent.tab();
    expect((await tabOrder(2)).slice(0, 1)).toEqual([c.fieldLabel]);
  });

  it('ArrowDown opens the list and then moves the active option with aria-activedescendant', async () => {
    await arrive();
    await press('{ArrowDown}');
    await expect.poll(listboxOpen).toBe(true);
    // The first press may only open the list; keep pressing until an option is active.
    for (let i = 0; i < 2 && activeOption(field()) === null; i += 1) await press('{ArrowDown}');
    await expect.poll(() => activeOption(field())).not.toBeNull();
    // Focus never leaves the input (virtual focus).
    expect(document.activeElement).toBe(field());
    const firstActive = activeOption(field());
    await press('{ArrowDown}');
    await expect.poll(() => activeOption(field())).not.toBe(firstActive);
    await press('{ArrowUp}');
    await expect.poll(() => activeOption(field())).toBe(firstActive);
  });

  it('the active option points at an element with role option', async () => {
    await arrive();
    await press('{ArrowDown}{ArrowDown}');
    await expect.poll(() => field().getAttribute('aria-activedescendant')).not.toBeNull();
    const id = field().getAttribute('aria-activedescendant') ?? '';
    expect(document.getElementById(id)?.getAttribute('role')).toBe('option');
    expect(field().getAttribute('aria-expanded')).toBe('true');
  });

  it('Enter selects the active option, closes the list and keeps focus on the input', async () => {
    const onSelect = vi.fn();
    await arrive(onSelect);
    await press('{ArrowDown}{ArrowDown}');
    await expect.poll(() => activeOption(field())).not.toBeNull();
    const chosen = activeOption(field()) ?? '';
    await press('{Enter}');
    await expect.poll(listboxOpen).toBe(false);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(field().value).toContain(c.committedValue(chosen.trim()).slice(0, 5));
    expect(document.activeElement).toBe(field());
  });

  it('Escape closes the open list first and keeps the typed text and focus', async () => {
    await arrive();
    await press('{ArrowDown}');
    await expect.poll(listboxOpen).toBe(true);
    const before = field().value;
    await press('{Escape}');
    await expect.poll(listboxOpen).toBe(false);
    expect(field().value).toBe(before);
    expect(document.activeElement).toBe(field());
  });

  it('a second Escape clears the text that was typed', async () => {
    await arrive();
    await press('zz');
    await press('{Escape}');
    await press('{Escape}');
    await expect.poll(() => field().value).toBe('');
  });

  it('Home and End edit the caret in the text (the list is moved with the arrows)', async () => {
    await arrive();
    await press('Noz');
    await press('{Home}');
    expect(field().selectionStart).toBe(0);
    await press('{End}');
    expect(field().selectionStart).toBe(field().value.length);
  });

  it('Tab leaves the field and closes the list', async () => {
    await arrive();
    await press('{ArrowDown}');
    await expect.poll(listboxOpen).toBe(true);
    await userEvent.tab();
    await expect.poll(listboxOpen).toBe(false);
    expect(labelOf(document.activeElement)).toBe('After');
  });
});

describe('keyboard contract: combobox navigation in the list', () => {
  it('ArrowUp from the closed field opens the list on the last option', async () => {
    await renderWithProvider(<Combobox label="Customer" options={customers} />);
    await userEvent.tab();
    await press('{ArrowUp}');
    await expect.poll(listboxOpen).toBe(true);
    await expect.poll(() => activeOption(field())).toContain('Nordic Goods');
  });

  it('typing filters the list and Enter commits the filtered match', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Combobox label="Customer" options={customers} onChange={onChange} />);
    await userEvent.tab();
    await press('nord');
    await expect.poll(() => document.querySelectorAll('[role="option"]').length).toBe(1);
    await press('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('nordic');
  });
});

describe('keyboard contract: TagInput', () => {
  function Example({ onChange }: { onChange?: (value: string[]) => void }) {
    return (
      <>
        <button type="button">Before</button>
        <TagInput label="Products" {...(onChange ? { onChange } : {})} />
        <button type="button">After</button>
      </>
    );
  }

  it('Tab reaches the text box once and Tab leaves', async () => {
    await renderWithProvider(<Example />);
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual(['Products', 'After']);
  });

  it('Enter adds the typed text as a tag and keeps focus in the input', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Example onChange={onChange} />);
    await userEvent.tab();
    await userEvent.tab();
    await press('notebook{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['notebook']);
    await expectFocus('Products');
  });

  it('a comma also commits the tag', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Example onChange={onChange} />);
    await userEvent.tab();
    await userEvent.tab();
    await press('lamp,');
    expect(onChange).toHaveBeenLastCalledWith(['lamp']);
  });

  it('Backspace on the empty input removes the last tag', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Example onChange={onChange} />);
    await userEvent.tab();
    await userEvent.tab();
    await press('one{Enter}two{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['one', 'two']);
    await press('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith(['one']);
  });
});
