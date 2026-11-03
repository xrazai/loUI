/**
 * Keyboard contract: Calendar and DatePicker.
 * Spec: AGENTS.md section 8, row "Calendar grid": arrows move by day/week; PageUp/PageDown month;
 * Shift+PageUp/PageDown year; Home/End first/last day of the month (React Aria); Enter/Space
 * selects (TEST-004).
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Calendar, DatePicker } from '../../components/DatePicker';
import { renderWithProvider } from '../render';
import { expectFocusOn, focusIsWithin, press } from './contract';

const dayLabel = () => document.activeElement?.getAttribute('aria-label') ?? '';
const inGrid = () => document.activeElement?.closest('[role="grid"]') != null;

/** Tabs until a day cell in the grid has focus. */
async function enterGrid() {
  for (let i = 0; i < 8 && !inGrid(); i += 1) await userEvent.tab();
  await expect.poll(inGrid).toBe(true);
}

describe('keyboard contract: calendar grid', () => {
  async function arrive(
    props: Partial<React.ComponentProps<typeof Calendar>> = {},
    start = /October 15, 2026/,
  ) {
    await renderWithProvider(
      <Calendar aria-label="Delivery" defaultValue="2026-10-15" {...props} />,
    );
    await enterGrid();
    await expect.poll(dayLabel).toMatch(start);
  }

  it('the grid is one Tab stop and opens on the selected day', async () => {
    await arrive();
    // One more Tab leaves the grid (the next focusable thing is not another day).
    await userEvent.tab();
    expect(inGrid()).toBe(false);
  });

  it('Left/Right move by one day and Up/Down by one week', async () => {
    await arrive();
    await press('{ArrowRight}');
    await expect.poll(dayLabel).toMatch(/October 16, 2026/);
    await press('{ArrowDown}');
    await expect.poll(dayLabel).toMatch(/October 23, 2026/);
    await press('{ArrowLeft}{ArrowUp}');
    await expect.poll(dayLabel).toMatch(/October 15, 2026/);
  });

  it('PageUp/PageDown move by month, Shift+PageUp/PageDown by year', async () => {
    await arrive();
    await press('{PageDown}');
    await expect.poll(dayLabel).toMatch(/November 15, 2026/);
    await press('{PageUp}');
    await expect.poll(dayLabel).toMatch(/October 15, 2026/);
    await press('{Shift>}{PageDown}{/Shift}');
    await expect.poll(dayLabel).toMatch(/October 15, 2027/);
    await press('{Shift>}{PageUp}{/Shift}');
    await expect.poll(dayLabel).toMatch(/October 15, 2026/);
  });

  it('Home and End go to the first and last day of the month', async () => {
    await arrive();
    await press('{Home}');
    await expect.poll(dayLabel).toMatch(/October 1, 2026/);
    await press('{End}');
    await expect.poll(dayLabel).toMatch(/October 31, 2026/);
  });

  it('arrows cross month boundaries', async () => {
    await arrive({ defaultValue: '2026-10-31' }, /October 31, 2026/);
    await press('{ArrowRight}');
    await expect.poll(dayLabel).toMatch(/November 1, 2026/);
  });

  it('Enter selects the focused day', async () => {
    const onChange = vi.fn();
    await arrive({ onChange });
    await press('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2026-10-16');
  });

  it('Space selects the focused day', async () => {
    const onChange = vi.fn();
    await arrive({ onChange });
    await press('{ArrowDown} ');
    expect(onChange).toHaveBeenLastCalledWith('2026-10-22');
  });

  it('does not move onto days outside min/max', async () => {
    await arrive(
      { min: '2026-10-10', max: '2026-10-20', defaultValue: '2026-10-20' },
      /October 20, 2026/,
    );
    await press('{ArrowRight}');
    await expect.poll(dayLabel).toMatch(/October 20, 2026/);
  });
});

describe('keyboard contract: date picker', () => {
  function Delivery({ onChange }: { onChange?: (value: string | null) => void }) {
    return (
      <>
        <button type="button">Before</button>
        <DatePicker
          label="Delivery date"
          defaultValue="2026-10-15"
          {...(onChange ? { onChange } : {})}
        />
        <button type="button">After</button>
      </>
    );
  }
  const popoverOpen = () => document.querySelector('[role="grid"]') !== null;

  async function focusCalendarButton() {
    let guard = 0;
    while (guard < 10) {
      await userEvent.tab();
      const label = document.activeElement?.getAttribute('aria-label') ?? '';
      if (/Open calendar/.test(label)) return document.activeElement as HTMLElement;
      guard += 1;
    }
    throw new Error('Calendar button not reached with Tab.');
  }

  it('Enter on the calendar button opens the grid on the selected day', async () => {
    await renderWithProvider(<Delivery />);
    await focusCalendarButton();
    await press('{Enter}');
    await expect.poll(popoverOpen).toBe(true);
    await expect.poll(dayLabel).toMatch(/October 15, 2026/);
  });

  it('arrows move inside the open grid and Enter picks the day and closes the popover', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Delivery onChange={onChange} />);
    const button = await focusCalendarButton();
    await press('{Enter}');
    await expect.poll(dayLabel).toMatch(/October 15, 2026/);
    await press('{ArrowRight}{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2026-10-17');
    await expect.poll(popoverOpen).toBe(false);
    await expectFocusOn(button);
  });

  it('Escape closes the grid without changing the date and returns focus to the button', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Delivery onChange={onChange} />);
    const button = await focusCalendarButton();
    await press('{Enter}');
    await expect.poll(popoverOpen).toBe(true);
    await press('{ArrowRight}');
    await press('{Escape}');
    await expect.poll(popoverOpen).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    await expectFocusOn(button);
  });

  it('keeps focus trapped in the open popover while Tab is pressed', async () => {
    await renderWithProvider(<Delivery />);
    await focusCalendarButton();
    await press('{Enter}');
    await expect.poll(popoverOpen).toBe(true);
    const dialog = document.querySelector('[role="dialog"]');
    for (let i = 0; i < 6; i += 1) {
      await userEvent.tab();
      expect(focusIsWithin(dialog)).toBe(true);
    }
  });

  it('typing digits into the date segments works from the keyboard alone', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Delivery onChange={onChange} />);
    await userEvent.tab();
    await userEvent.tab();
    await press('11');
    await press('0');
    await press('5');
    expect(onChange).toHaveBeenCalled();
  });
});
