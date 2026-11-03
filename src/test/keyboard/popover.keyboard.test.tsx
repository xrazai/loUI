/**
 * Keyboard contract: Popover, Accordion (disclosure), Tooltip, Select (listbox).
 * Spec: AGENTS.md section 8, rows "Popover" (Esc closes and restores focus; focus moves in only if
 * interactive), "Accordion / disclosure" (Enter/Space toggles), "Tooltip" (shows on focus and hover;
 * Esc dismisses; content hoverable) and the listbox half of "Menu"/"Combobox" for Select (TEST-004).
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Accordion } from '../../components/Accordion';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Popover } from '../../components/Popover';
import { Select } from '../../components/Select';
import { Tooltip } from '../../components/Tooltip';
import { renderWithProvider } from '../render';
import {
  activeLabel,
  expectFocus,
  expectFocusOn,
  focusIsWithin,
  press,
  tabOrder,
} from './contract';

const dialogOpen = () => document.querySelector('[role="dialog"]') !== null;
const listboxOpen = () => document.querySelector('[role="listbox"]') !== null;
const tooltipOpen = () => document.querySelector('[role="tooltip"]') !== null;

describe('keyboard contract: popover', () => {
  function Filters() {
    return (
      <>
        <button type="button">Before</button>
        <Popover trigger={<Button>Filters</Button>} label="Filters">
          <Input label="Customer" />
          <Button>Apply</Button>
        </Popover>
        <button type="button">After</button>
      </>
    );
  }

  it('Enter opens it and focus moves in because the content is interactive', async () => {
    await renderWithProvider(<Filters />);
    await userEvent.tab();
    await userEvent.tab();
    await expectFocus('Filters');
    await press('{Enter}');
    await expect.poll(dialogOpen).toBe(true);
    await expect.poll(() => focusIsWithin(document.querySelector('[role="dialog"]'))).toBe(true);
  });

  it('Space opens it too', async () => {
    await renderWithProvider(<Filters />);
    await userEvent.tab();
    await userEvent.tab();
    await press(' ');
    await expect.poll(dialogOpen).toBe(true);
  });

  it('Escape closes it and restores focus to the trigger', async () => {
    await renderWithProvider(<Filters />);
    await userEvent.tab();
    await userEvent.tab();
    const trigger = document.activeElement as HTMLElement;
    await press('{Enter}');
    await expect.poll(dialogOpen).toBe(true);
    await press('{Escape}');
    await expect.poll(dialogOpen).toBe(false);
    await expectFocusOn(trigger);
  });

  it('Tab stays inside the open popover (modal) and Escape still restores focus', async () => {
    await renderWithProvider(<Filters />);
    await userEvent.tab();
    await userEvent.tab();
    const trigger = document.activeElement as HTMLElement;
    await press('{Enter}');
    await expect.poll(dialogOpen).toBe(true);
    for (let i = 0; i < 5; i += 1) {
      await userEvent.tab();
      expect(focusIsWithin(document.querySelector('[role="dialog"]'))).toBe(true);
    }
    await press('{Escape}');
    await expectFocusOn(trigger);
  });
});

describe('keyboard contract: accordion', () => {
  const items = [
    { value: 'a', title: 'Shipping', content: 'Shipping answer' },
    { value: 'b', title: 'Returns', content: 'Returns answer' },
    { value: 'c', title: 'Samples', content: 'Samples answer', isDisabled: true },
  ];
  const expanded = (name: string) =>
    [...document.querySelectorAll('button')]
      .find((b) => b.textContent.includes(name))
      ?.getAttribute('aria-expanded');

  it('each header is a Tab stop; a disabled header is skipped', async () => {
    await renderWithProvider(
      <>
        <button type="button">Before</button>
        <Accordion items={items} />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(await tabOrder(3)).toEqual(['Shipping', 'Returns', 'After']);
  });

  it('Enter and Space toggle the focused header; single mode closes the others', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Accordion items={items} onChange={onChange} />);
    await userEvent.tab();
    await expectFocus('Shipping');
    await press('{Enter}');
    expect(expanded('Shipping')).toBe('true');
    await userEvent.tab();
    await press(' ');
    expect(expanded('Returns')).toBe('true');
    expect(expanded('Shipping')).toBe('false');
    await press(' ');
    expect(expanded('Returns')).toBe('false');
  });

  it('multiple mode keeps several sections open', async () => {
    await renderWithProvider(<Accordion items={items} multiple />);
    await userEvent.tab();
    await press('{Enter}');
    await userEvent.tab();
    await press('{Enter}');
    expect(expanded('Shipping')).toBe('true');
    expect(expanded('Returns')).toBe('true');
  });
});

describe('keyboard contract: tooltip', () => {
  function WithTip() {
    return (
      <>
        <button type="button">Before</button>
        <Tooltip content="Create a new order">
          <Button>New</Button>
        </Tooltip>
      </>
    );
  }

  it('shows on keyboard focus and describes the trigger', async () => {
    await renderWithProvider(<WithTip />);
    expect(tooltipOpen()).toBe(false);
    await userEvent.tab();
    await userEvent.tab();
    await expectFocus('New');
    await expect.poll(tooltipOpen).toBe(true);
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe('Create a new order');
  });

  it('Escape dismisses it while the trigger keeps focus', async () => {
    await renderWithProvider(<WithTip />);
    await userEvent.tab();
    await userEvent.tab();
    await expect.poll(tooltipOpen).toBe(true);
    await press('{Escape}');
    await expect.poll(tooltipOpen).toBe(false);
    expect(activeLabel()).toBe('New');
  });

  it('hides when focus leaves the trigger', async () => {
    await renderWithProvider(<WithTip />);
    await userEvent.tab();
    await userEvent.tab();
    await expect.poll(tooltipOpen).toBe(true);
    await userEvent.tab({ shift: true });
    await expect.poll(tooltipOpen).toBe(false);
  });
});

describe('keyboard contract: select (listbox)', () => {
  const regions = [
    { value: 'eu', label: 'Frankfurt' },
    { value: 'us', label: 'Virginia' },
    { value: 'sa', label: 'Sao Paulo' },
  ];
  function Regions({ onChange }: { onChange?: (value: string | null) => void }) {
    return (
      <>
        <button type="button">Before</button>
        <Select label="Region" options={regions} {...(onChange ? { onChange } : {})} />
        <button type="button">After</button>
      </>
    );
  }
  const optionLabel = () =>
    document.activeElement?.getAttribute('role') === 'option' ? activeLabel() : null;

  it('the trigger is one Tab stop', async () => {
    await renderWithProvider(<Regions />);
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual([expect.stringContaining('Region'), 'After']);
  });

  it.each([['{Enter}'], [' '], ['{ArrowDown}']])(
    '%j on the trigger opens the list on the first option',
    async (key) => {
      await renderWithProvider(<Regions />);
      await userEvent.tab();
      await userEvent.tab();
      await press(key);
      await expect.poll(listboxOpen).toBe(true);
      await expect.poll(optionLabel).toBe('Frankfurt');
    },
  );

  it('ArrowUp on the trigger opens the list on the last option', async () => {
    await renderWithProvider(<Regions />);
    await userEvent.tab();
    await userEvent.tab();
    await press('{ArrowUp}');
    await expect.poll(optionLabel).toBe('Sao Paulo');
  });

  it('Up/Down, Home/End and typeahead move through the options', async () => {
    await renderWithProvider(<Regions />);
    await userEvent.tab();
    await userEvent.tab();
    await press('{Enter}');
    await expect.poll(optionLabel).toBe('Frankfurt');
    await press('{ArrowDown}');
    await expect.poll(optionLabel).toBe('Virginia');
    await press('{End}');
    await expect.poll(optionLabel).toBe('Sao Paulo');
    await press('{Home}');
    await expect.poll(optionLabel).toBe('Frankfurt');
    await press('v');
    await expect.poll(optionLabel).toBe('Virginia');
  });

  it('Enter selects the focused option, closes the list and restores focus to the trigger', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Regions onChange={onChange} />);
    await userEvent.tab();
    await userEvent.tab();
    const trigger = document.activeElement as HTMLElement;
    await press('{Enter}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('us');
    await expect.poll(listboxOpen).toBe(false);
    await expectFocusOn(trigger);
    expect(trigger.textContent).toContain('Virginia');
  });

  it('Escape closes without changing the value and restores focus to the trigger', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Regions onChange={onChange} />);
    await userEvent.tab();
    await userEvent.tab();
    const trigger = document.activeElement as HTMLElement;
    await press('{Enter}{ArrowDown}');
    await press('{Escape}');
    await expect.poll(listboxOpen).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    await expectFocusOn(trigger);
  });
});
