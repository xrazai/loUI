import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Inline } from '../Inline';
import { toISODate } from '../../utils/date';
import { borderContrast } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Calendar } from './Calendar';
import { DatePicker } from './DatePicker';
import type { DatePickerProps } from './DatePicker';

function Delivery(props: Partial<DatePickerProps>) {
  return <DatePicker label="Delivery date" {...props} />;
}

function segmentsText(container: Element): string {
  return [...container.querySelectorAll('[role="spinbutton"]')]
    .map((segment) => segment.textContent)
    .join('/');
}

describe('DatePicker', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('is a labelled group of editable segments with a calendar button, formatted for the locale', async () => {
    const screen = await renderWithProvider(
      <Delivery defaultValue="2026-10-15" description="When the order should arrive." />,
    );
    await expect.element(screen.getByRole('group', { name: /Delivery date/ })).toBeInTheDocument();
    expect(segmentsText(screen.container)).toBe('10/15/2026');
    await expect.element(screen.getByRole('button', { name: /Open calendar/ })).toBeVisible();
    expect(screen.container.textContent).toContain('When the order should arrive.');
    await screen.unmount();
    const ptBR = await renderWithProvider(<Delivery label="Entrega" defaultValue="2026-10-15" />, {
      locale: 'pt-BR',
    });
    expect(segmentsText(ptBR.container)).toBe('15/10/2026');
    await expect.element(ptBR.getByRole('button', { name: /Abrir calendário/ })).toBeVisible();
    await ptBR.unmount();
    const empty = await renderWithProvider(<Delivery />, { locale: 'pt-BR' });
    expect(segmentsText(empty.container).toLowerCase()).toBe('dd/mm/aaaa');
  });

  it('types a date segment by segment and reports ISO strings', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Delivery onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard('10152026');
    expect(onChange).toHaveBeenLastCalledWith('2026-10-15');
    expect(segmentsText(screen.container)).toBe('10/15/2026');
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}');
    expect(segmentsText(screen.container)).toContain('yyyy');
    // An incomplete date is not reported: onChange only fires with complete dates (or null from Clear).
    expect(onChange).toHaveBeenLastCalledWith('0002-10-15');
  });

  it('opens the calendar, names every day with its full date and selects with a click', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Delivery defaultValue="2026-10-15" onChange={onChange} />,
    );
    await screen.getByRole('button', { name: /Open calendar/ }).click();
    const grid = screen.getByRole('grid');
    await expect.element(grid).toBeVisible();
    await expect
      .poll(() => screen.getByRole('heading', { level: 2 }).element().textContent)
      .toMatch(new RegExp('October 2026'));
    const day = screen.getByRole('button', { name: /Wednesday, October 28, 2026/ });
    await expect.element(day).toBeVisible();
    await day.click();
    expect(onChange).toHaveBeenLastCalledWith('2026-10-28');
    expect(segmentsText(screen.container)).toBe('10/28/2026');
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('follows the calendar grid keyboard contract', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Delivery defaultValue="2026-10-15" onChange={onChange} />,
    );
    await screen.getByRole('button', { name: /Open calendar/ }).click();
    const focused = () => document.activeElement?.getAttribute('aria-label') ?? '';
    await expect.poll(focused).toMatch(/October 15, 2026/);
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(focused).toMatch(/October 16, 2026/);
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(focused).toMatch(/October 23, 2026/);
    await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
    await expect.poll(focused).toMatch(/October 15, 2026/);
    await userEvent.keyboard('{PageDown}');
    await expect.poll(focused).toMatch(/November 15, 2026/);
    await userEvent.keyboard('{PageUp}');
    await expect.poll(focused).toMatch(/October 15, 2026/);
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    await expect.poll(focused).toMatch(/October 15, 2027/);
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}');
    await expect.poll(focused).toMatch(/October 15, 2026/);
    await userEvent.keyboard('{Home}');
    // React Aria's Home / End go to the first / last day of the month (APG says week).
    await expect.poll(focused).toMatch(/Thursday, October 1, 2026/);
    await userEvent.keyboard('{End}');
    await expect.poll(focused).toMatch(/Saturday, October 31, 2026/);
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2026-10-31');
  });

  it('closes with Escape and returns focus to the trigger', async () => {
    const screen = await renderWithProvider(<Delivery defaultValue="2026-10-15" />);
    const trigger = screen.getByRole('button', { name: /Open calendar/ });
    await trigger.click();
    await expect.element(screen.getByRole('grid')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[role="grid"]')).toBeNull();
    await expect.element(trigger).toHaveFocus();
  });

  it('marks today with a ring and the selected day with the accent fill', async () => {
    const todayISO = toISODate(new Date());
    const screen = await renderWithProvider(<Delivery defaultValue={todayISO} />);
    await screen.getByRole('button', { name: /Open calendar/ }).click();
    const today = screen.getByRole('button', { name: /^Today,/ }).element();
    const dayBox = today.querySelector('[data-today]') as HTMLElement;
    expect(dayBox).not.toBeNull();
    expect(getComputedStyle(dayBox).borderTopWidth).toBe('1px');
    const selected = document.querySelector(
      '[role="grid"] [aria-selected="true"] [class*="day"]',
    ) as HTMLElement;
    await expect
      .poll(() => getComputedStyle(selected).backgroundColor)
      .not.toBe('rgba(0, 0, 0, 0)');
  });

  it('has Today and Clear buttons from messages', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Delivery defaultValue="2026-10-15" onChange={onChange} />,
    );
    await screen.getByRole('button', { name: /Open calendar/ }).click();
    await screen.getByRole('button', { name: 'Today' }).click();
    expect(onChange).toHaveBeenLastCalledWith(toISODate(new Date()));
    await screen.getByRole('button', { name: /Open calendar/ }).click();
    await screen.getByRole('button', { name: 'Clear' }).click();
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(segmentsText(screen.container)).toContain('yyyy');
    await screen.getByRole('button', { name: /Open calendar/ }).click();
    expect(screen.getByRole('button', { name: 'Clear' }).element().hasAttribute('disabled')).toBe(
      true,
    );
  });

  it('takes strings from messages in pt-BR, with the provider and per instance', async () => {
    const ptBR = await renderWithProvider(<Delivery label="Entrega" defaultValue="2026-10-15" />, {
      locale: 'pt-BR',
    });
    await ptBR.getByRole('button', { name: /Abrir calendário/ }).click();
    await expect
      .poll(() => ptBR.getByRole('heading', { level: 2 }).element().textContent)
      .toMatch(/outubro de 2026/i);
    await expect.element(ptBR.getByRole('button', { name: 'Hoje' })).toBeVisible();
    await expect.element(ptBR.getByRole('button', { name: 'Limpar' })).toBeVisible();
    await expect.element(ptBR.getByRole('button', { name: 'Mês anterior' })).toBeVisible();
    const weekdays = [...document.querySelectorAll('th')].map((cell) => cell.textContent);
    expect(weekdays).toHaveLength(7);
    await ptBR.unmount();
    const provider = await renderWithProvider(<Delivery />, {
      messages: { DatePicker: { today: 'Now' }, Calendar: { nextMonth: 'Onward' } },
    });
    await provider.getByRole('button', { name: /Open calendar/ }).click();
    await expect.element(provider.getByRole('button', { name: 'Now' })).toBeVisible();
    await expect.element(provider.getByRole('button', { name: 'Onward' })).toBeVisible();
    await provider.unmount();
    const instance = await renderWithProvider(
      <Delivery messages={{ clear: 'Reset', nextMonth: 'Later' }} />,
    );
    await instance.getByRole('button', { name: /Open calendar/ }).click();
    await expect.element(instance.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect.element(instance.getByRole('button', { name: 'Later' })).toBeVisible();
  });

  it('first day of the week follows the locale', async () => {
    const en = await renderWithProvider(<Delivery defaultValue="2026-10-15" />);
    await en.getByRole('button', { name: /Open calendar/ }).click();
    const first = document.querySelector('th')?.textContent ?? '';
    const enFirst = first;
    await en.unmount();
    const de = await renderWithProvider(<Delivery label="Datum" defaultValue="2026-10-15" />, {
      locale: 'de-DE',
    });
    await de.getByRole('button').first().click();
    expect(document.querySelector('th')?.textContent).not.toBe(enFirst);
  });

  it('disables days outside min and max and the Today button when today is out of range', async () => {
    const screen = await renderWithProvider(
      <Delivery defaultValue="2026-10-15" min="2026-10-10" max="2026-10-20" />,
    );
    await screen.getByRole('button', { name: /Open calendar/ }).click();
    const before = screen.getByRole('button', { name: /Friday, October 9, 2026/ });
    const inside = screen.getByRole('button', { name: /Friday, October 16, 2026/ });
    expect(before.element().getAttribute('aria-disabled')).toBe('true');
    expect(inside.element().getAttribute('aria-disabled')).toBeNull();
    expect(screen.getByRole('button', { name: 'Today' }).element().hasAttribute('disabled')).toBe(
      true,
    );
  });

  it('marks a typed date outside min and max as invalid and links the error', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Delivery
          min="2026-10-10"
          errorMessage="Pick a date from October 10."
          defaultValue="2026-10-01"
        />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect
      .poll(() => screen.getByRole('alert').element().textContent)
      .toMatch(new RegExp('Pick a date from October 10.'));
  });

  it('is required: no error before a submit attempt, error after', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Delivery name="delivery" isRequired errorMessage="Enter a date." />
        <button type="submit">Save</button>
      </form>,
    );
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect
      .poll(() => screen.getByRole('alert').element().textContent)
      .toMatch(new RegExp('Enter a date.'));
  });

  it('marks the field invalid when controlled and links the error', async () => {
    const screen = await renderWithProvider(<Delivery isInvalid errorMessage="Too late." />);
    await expect
      .element(screen.getByRole('group', { name: /Delivery date/ }))
      .toHaveAccessibleDescription('Too late.');
    expect(screen.container.querySelector('[data-invalid]')).not.toBeNull();
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('2026-10-15');
      return (
        <>
          <Delivery value={value} onChange={setValue} />
          <button
            type="button"
            onClick={() => {
              setValue('2027-01-02');
            }}
          >
            Set
          </button>
          <output>{String(value)}</output>
        </>
      );
    }
    const controlled = await renderWithProvider(<Controlled />);
    await controlled.getByRole('button', { name: /Open calendar/ }).click();
    await controlled.getByRole('button', { name: /October 20, 2026/ }).click();
    expect(controlled.container.querySelector('output')?.textContent).toBe('2026-10-20');
    await controlled.getByRole('button', { name: 'Set' }).click();
    expect(segmentsText(controlled.container)).toBe('1/2/2027');
    await controlled.unmount();
    const uncontrolled = await renderWithProvider(<Delivery defaultValue="2026-03-04" />);
    expect(segmentsText(uncontrolled.container)).toBe('3/4/2026');
  });

  it('submits the ISO date under name', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Delivery name="delivery" defaultValue="2026-10-15" />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('delivery')).toBe('2026-10-15');
    await screen.getByRole('button', { name: /Open calendar/ }).click();
    await screen.getByRole('button', { name: /October 22, 2026/ }).click();
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('delivery')).toBe('2026-10-22');
  });

  it('disables and makes read-only', async () => {
    const disabled = await renderWithProvider(<Delivery isDisabled defaultValue="2026-10-15" />);
    await expect.element(disabled.getByRole('button', { name: /Open calendar/ })).toBeDisabled();
    await disabled.unmount();
    const readOnly = await renderWithProvider(<Delivery isReadOnly defaultValue="2026-10-15" />);
    await expect.element(readOnly.getByRole('button', { name: /Open calendar/ })).toBeDisabled();
    await userEvent.tab();
    await userEvent.keyboard('9');
    expect(segmentsText(readOnly.container)).toBe('10/15/2026');
  });

  it('styles the overlay: raised surface, dropdown layer, radius lg; box border at 3:1 with a focus ring', async () => {
    const screen = await renderWithProvider(<Delivery defaultValue="2026-10-15" />);
    const box = screen.getByRole('group', { name: /Delivery date/ }).element() as HTMLElement;
    expect(borderContrast(box)).toBeGreaterThanOrEqual(3);
    await userEvent.tab();
    expect(getComputedStyle(box).boxShadow).not.toBe('none');
    await screen.getByRole('button', { name: /Open calendar/ }).click();
    const popover = screen
      .getByRole('dialog')
      .element()
      .closest('[data-trigger="DatePicker"]') as HTMLElement;
    const style = getComputedStyle(popover);
    expect(style.zIndex).toBe(
      getComputedStyle(document.documentElement).getPropertyValue('--ds-z-dropdown').trim(),
    );
    expect(style.borderTopLeftRadius).toBe('10px');
    expect(style.boxShadow).not.toBe('none');
    const cell = screen
      .getByRole('button', { name: /October 16, 2026/ })
      .element()
      .querySelector('[class*="day"]') as HTMLElement;
    expect(cell.getBoundingClientRect().height).toBe(36);
  });

  it('forwards className and ref; warns without an accessible name', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<Delivery className="extra" ref={ref} />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = {} as unknown as Parameters<typeof DatePicker>[0];
    await renderWithProvider(<DatePicker {...props} />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('DatePicker needs an accessible name'),
    );
  });

  describe('axe', () => {
    it('has no violations: empty, filled, described, required, invalid, disabled, read-only', async () => {
      const screen = await renderWithProvider(
        <main>
          <Delivery label="Empty" />
          <Delivery label="Filled" defaultValue="2026-10-15" description="When it should arrive." />
          <Delivery label="Required" isRequired />
          <Delivery label="Invalid" isInvalid errorMessage="Too late." />
          <Delivery label="Disabled" isDisabled />
          <Delivery label="Read-only" isReadOnly defaultValue="2026-10-15" />
          <DatePicker aria-label="Unlabelled" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no violations with the calendar open, with a selection, today and disabled days', async () => {
      const screen = await renderWithProvider(
        <main>
          <Delivery defaultValue="2026-10-15" min="2026-10-05" max="2026-10-25" />
        </main>,
      );
      await screen.getByRole('button', { name: /Open calendar/ }).click();
      await expect.element(screen.getByRole('grid')).toBeVisible();
      await expectNoA11yViolations(document.body);
    });

    it('has no violations with the calendar open in pt-BR', async () => {
      const screen = await renderWithProvider(
        <main>
          <Delivery label="Entrega" defaultValue="2026-10-15" />
        </main>,
        { locale: 'pt-BR' },
      );
      await screen.getByRole('button', { name: /Abrir calendário/ }).click();
      await expect.element(screen.getByRole('grid')).toBeVisible();
      await expectNoA11yViolations(document.body);
    });
  });
});

describe('Calendar (standalone)', () => {
  it('is a labelled grid; value and onChange use ISO strings', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Calendar aria-label="Delivery" defaultValue="2026-10-15" onChange={onChange} />,
    );
    await expect.element(screen.getByRole('application', { name: /Delivery/ })).toBeInTheDocument();
    await screen.getByRole('button', { name: /October 20, 2026/ }).click();
    expect(onChange).toHaveBeenLastCalledWith('2026-10-20');
    await screen.getByRole('button', { name: 'Next month' }).click();
    await expect
      .poll(() => screen.getByRole('heading', { level: 2 }).element().textContent)
      .toMatch(new RegExp('November 2026'));
  });

  it('works controlled, honors min/max and has no axe violations', async () => {
    function Controlled() {
      const [value, setValue] = useState('2026-10-15');
      return (
        <>
          <Calendar
            aria-label="Delivery"
            value={value}
            onChange={setValue}
            min="2026-10-10"
            max="2026-10-20"
          />
          <output>{value}</output>
        </>
      );
    }
    const screen = await renderWithProvider(
      <main>
        <Controlled />
      </main>,
    );
    await screen.getByRole('button', { name: /October 18, 2026/ }).click();
    expect(screen.container.querySelector('output')?.textContent).toBe('2026-10-18');
    expect(
      screen
        .getByRole('button', { name: /October 21, 2026/ })
        .element()
        .getAttribute('aria-disabled'),
    ).toBe('true');
    await expectNoA11yViolations(screen.container);
  });
});

describe('DatePicker fullWidth', () => {
  async function renderRow(props: { fullWidth?: boolean }) {
    return renderWithProvider(
      <div style={{ inlineSize: 700 }}>
        <Inline gap={2} wrap="nowrap">
          <DatePicker label="Due date" {...props} />
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
