import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { DueIndicator } from './DueIndicator';

afterEach(() => {
  vi.useRealTimers();
});

let renders = 0;

/** Renders one indicator (several can live in one test) and returns its root and visible text. */
async function status(date: string, today: string, locale?: string) {
  const id = `due-${String(renders++)}`;
  const screen = await renderWithProvider(
    <DueIndicator date={date} today={today} data-testid={id} />,
    locale ? { locale } : {},
  );
  const root = screen.getByTestId(id).element() as HTMLElement;
  return { root, text: root.innerText.replace(/\s+/g, ' ').trim(), screen };
}

describe('DueIndicator', () => {
  describe('status text and tone', () => {
    it('is overdue (danger) with the number of days', async () => {
      const { root, text } = await status('2026-03-07', '2026-03-10');
      expect(text).toBe('Mar 7 Overdue by 3 days');
      expect(root.getAttribute('data-tone')).toBe('danger');
    });

    it('uses the singular for one day overdue', async () => {
      expect((await status('2026-03-09', '2026-03-10')).text).toBe('Mar 9 Overdue by 1 day');
    });

    it('says "Due today" (warning)', async () => {
      const { root, text } = await status('2026-03-10', '2026-03-10');
      expect(text).toBe('Mar 10 Due today');
      expect(root.getAttribute('data-tone')).toBe('warning');
    });

    it('says "Due tomorrow" for the next day', async () => {
      expect((await status('2026-03-11', '2026-03-10')).text).toBe('Mar 11 Due tomorrow');
    });

    it('counts days within a week as warning and later as neutral', async () => {
      const soon = await status('2026-03-17', '2026-03-10');
      expect(soon.text).toBe('Mar 17 Due in 7 days');
      expect(soon.root.getAttribute('data-tone')).toBe('warning');
      const later = await status('2026-03-18', '2026-03-10');
      expect(later.text).toBe('Mar 18 Due in 8 days');
      expect(later.root.getAttribute('data-tone')).toBe('neutral');
    });

    it('shows "Paid" (success) whatever the date', async () => {
      const screen = await renderWithProvider(
        <DueIndicator date="2020-01-01" today="2026-03-10" paid data-testid="p" />,
      );
      const root = screen.getByTestId('p').element();
      expect(root.textContent).toContain('Paid');
      expect(root.textContent).not.toContain('Overdue');
      expect(root.getAttribute('data-tone')).toBe('success');
    });

    it('hides the date with showDate={false}', async () => {
      const screen = await renderWithProvider(
        <DueIndicator date="2026-03-10" today="2026-03-10" showDate={false} data-testid="d" />,
      );
      expect(screen.getByTestId('d').element().querySelector('time')).toBeNull();
      expect(screen.getByTestId('d').element().textContent).toBe('Due today');
    });

    it('formats the date with dateStyle and exposes it in <time dateTime>', async () => {
      const screen = await renderWithProvider(
        <DueIndicator date="2026-03-10" today="2026-03-10" dateStyle="long" data-testid="d" />,
      );
      const time = screen.getByTestId('d').element().querySelector('time');
      expect(time?.getAttribute('datetime')).toBe('2026-03-10');
      expect(time?.textContent).toBe('March 10, 2026');
    });

    it('uses text for the status; the dot is hidden from assistive technology', async () => {
      const { root } = await status('2026-03-07', '2026-03-10');
      expect(root.querySelector('[aria-hidden="true"]')?.textContent).toBe('');
    });
  });

  describe('daylight-saving boundaries (calendar days, not 24-hour blocks)', () => {
    it.each([
      ['US spring forward', '2026-03-07', '2026-03-09', 'Due in 2 days'],
      ['US fall back', '2026-10-31', '2026-11-02', 'Due in 2 days'],
      ['EU spring forward', '2026-03-28', '2026-03-30', 'Due in 2 days'],
      ['EU fall back', '2026-10-24', '2026-10-26', 'Due in 2 days'],
      ['across spring forward, tomorrow', '2026-03-08', '2026-03-09', 'Due tomorrow'],
      ['across fall back, tomorrow', '2026-11-01', '2026-11-02', 'Due tomorrow'],
    ])('%s', async (_name, today, date, expected) => {
      expect((await status(date, today)).text).toContain(expected);
    });

    it('counts overdue days across a change too', async () => {
      expect((await status('2026-03-07', '2026-03-09')).text).toContain('Overdue by 2 days');
      expect((await status('2026-11-01', '2026-11-03')).text).toContain('Overdue by 2 days');
    });

    it('is exact over a leap day', async () => {
      expect((await status('2028-03-01', '2028-02-28')).text).toContain('Due in 2 days');
    });
  });

  describe('today', () => {
    it('defaults to the local day of the system clock', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 2, 8, 23, 30));
      const screen = await renderWithProvider(<DueIndicator date="2026-03-08" data-testid="d" />);
      expect(screen.getByTestId('d').element().textContent).toContain('Due today');
    });

    it('uses the local day just after midnight on a DST change', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 10, 1, 0, 30));
      const screen = await renderWithProvider(<DueIndicator date="2026-11-02" data-testid="d" />);
      expect(screen.getByTestId('d').element().textContent).toContain('Due tomorrow');
    });
  });

  describe('flexible date input', () => {
    it('accepts a Date and uses its local day', async () => {
      const screen = await renderWithProvider(
        <DueIndicator date={new Date(2026, 2, 14, 23, 59)} today="2026-03-10" data-testid="d" />,
      );
      expect(screen.getByTestId('d').element().textContent).toContain('Mar 14');
      expect(screen.getByTestId('d').element().textContent).toContain('Due in 4 days');
    });

    it('maps a date-time near midnight to the local day', async () => {
      const late = new Date(2026, 2, 14, 23, 30).toISOString();
      const early = new Date(2026, 2, 14, 0, 15).toISOString();
      expect((await status(late, '2026-03-10')).text).toBe('Mar 14 Due in 4 days');
      expect((await status(early, '2026-03-10')).text).toBe('Mar 14 Due in 4 days');
      expect((await status('2026-03-14T23:30:00', '2026-03-10')).text).toBe('Mar 14 Due in 4 days');
    });

    it('accepts a date-time for today', async () => {
      expect((await status('2026-03-11', new Date(2026, 2, 10, 23, 59).toISOString())).text).toBe(
        'Mar 11 Due tomorrow',
      );
    });

    it('exposes the normalized day in <time dateTime>', async () => {
      const { root } = await status('2026-03-14T23:30:00', '2026-03-10');
      expect(root.querySelector('time')?.getAttribute('datetime')).toBe('2026-03-14');
    });

    it('throws for an unparsable date-time in development', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await expect(
        renderWithProvider(<DueIndicator date="2026-13-45T10:00:00" today="2026-03-10" />),
      ).rejects.toThrow(/date-time/);
      error.mockRestore();
    });
  });

  describe('label and tone form', () => {
    it.each(['neutral', 'accent', 'success', 'warning', 'danger'] as const)(
      'renders the label with tone %s',
      async (tone) => {
        const screen = await renderWithProvider(
          <DueIndicator label="Pickup at 2 pm" tone={tone} data-testid="l" />,
        );
        const root = screen.getByTestId('l').element();
        expect(root.textContent).toBe('Pickup at 2 pm');
        expect(root.getAttribute('data-tone')).toBe(tone);
        expect(root.querySelector('time')).toBeNull();
        expect(root.querySelector('[aria-hidden="true"]')).not.toBeNull();
      },
    );
  });

  describe('paid date', () => {
    it('shows the paid date and the success tone', async () => {
      const screen = await renderWithProvider(
        <DueIndicator
          date="2026-03-01"
          today="2026-03-10"
          paidDate="2026-03-08"
          showDate={false}
          data-testid="p"
        />,
      );
      const root = screen.getByTestId('p').element();
      expect(root.textContent).toBe('Paid Mar 8');
      expect(root.getAttribute('data-tone')).toBe('success');
    });

    it('accepts a Date and formats with dateStyle', async () => {
      const screen = await renderWithProvider(
        <DueIndicator
          date="2026-03-01"
          paidDate={new Date(2026, 2, 8, 22, 0)}
          dateStyle="long"
          showDate={false}
          data-testid="p"
        />,
      );
      expect(screen.getByTestId('p').element().textContent).toBe('Paid March 8, 2026');
    });

    it('uses a gender-neutral wording in pt-BR and can be overridden', async () => {
      const pt = await renderWithProvider(
        <DueIndicator date="2026-03-01" paidDate="2026-03-08" showDate={false} data-testid="p" />,
        { locale: 'pt-BR' },
      );
      expect(pt.getByTestId('p').element().textContent).toBe('Pagamento em 8 de mar.');
      const custom = await renderWithProvider(
        <DueIndicator
          date="2026-03-01"
          paidDate="2026-03-08"
          showDate={false}
          messages={{ paidOn: (date: string) => `Settled on ${date}` }}
          data-testid="c"
        />,
      );
      expect(custom.getByTestId('c').element().textContent).toBe('Settled on Mar 8');
    });
  });

  describe('invalid input', () => {
    it('throws for a malformed date in development', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await expect(
        renderWithProvider(<DueIndicator date="10/03/2026" today="2026-03-10" />),
      ).rejects.toThrow(/YYYY-MM-DD/);
      error.mockRestore();
    });
  });

  describe('i18n', () => {
    it('speaks pt-BR with Intl relative time and date', async () => {
      expect((await status('2026-03-10', '2026-03-10', 'pt-BR')).text).toBe(
        '10 de mar. Vence hoje',
      );
      expect((await status('2026-03-11', '2026-03-10', 'pt-BR')).text).toContain('Vence amanhã');
      expect((await status('2026-03-15', '2026-03-10', 'pt-BR')).text).toContain('Vence em 5 dias');
      expect((await status('2026-03-09', '2026-03-10', 'pt-BR')).text).toContain(
        'Vencido há 1 dia',
      );
      expect((await status('2026-03-07', '2026-03-10', 'pt-BR')).text).toContain(
        'Vencido há 3 dias',
      );
    });

    it('shows "Pago" in pt-BR', async () => {
      const screen = await renderWithProvider(
        <DueIndicator date="2026-03-07" today="2026-03-10" paid data-testid="p" />,
        { locale: 'pt-BR' },
      );
      expect(screen.getByTestId('p').element().textContent).toContain('Pago');
    });

    it('applies a provider override', async () => {
      const screen = await renderWithProvider(
        <DueIndicator date="2026-03-10" today="2026-03-10" data-testid="d" />,
        { messages: { DueIndicator: { due: (relative: string) => `Expires ${relative}` } } },
      );
      expect(screen.getByTestId('d').element().textContent).toContain('Expires today');
    });

    it('applies an instance override', async () => {
      const screen = await renderWithProvider(
        <DueIndicator
          date="2026-03-10"
          today="2026-03-10"
          paid
          messages={{ paid: 'Settled' }}
          data-testid="d"
        />,
      );
      expect(screen.getByTestId('d').element().textContent).toContain('Settled');
    });
  });

  describe('rendering', () => {
    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLSpanElement>();
      await renderWithProvider(
        <DueIndicator
          ref={ref}
          date="2026-03-10"
          today="2026-03-10"
          className="extra"
          data-testid="d"
        />,
      );
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('d');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations in every tone (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <p>
            <DueIndicator date="2026-03-07" today="2026-03-10" />
          </p>
          <p>
            <DueIndicator date="2026-03-10" today="2026-03-10" />
          </p>
          <p>
            <DueIndicator date="2026-04-10" today="2026-03-10" />
          </p>
          <p>
            <DueIndicator date="2026-03-07" today="2026-03-10" paid />
          </p>
          <p>
            <DueIndicator date="2026-03-07" paidDate="2026-03-08" />
          </p>
          {(['neutral', 'accent', 'success', 'warning', 'danger'] as const).map((tone) => (
            <p key={tone}>
              <DueIndicator label="Pickup at 2 pm" tone={tone} />
            </p>
          ))}
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
