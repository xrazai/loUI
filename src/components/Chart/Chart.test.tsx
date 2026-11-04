import { createRef } from 'react';
import { flushSync } from 'react-dom';
import type { ReactElement } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import type { RenderWithProviderOptions } from '../../test/render';
import { formatCurrency } from '../../utils/currency';
import { Chart } from './Chart';
import { chartAverage } from './chartAverage';
import type { ChartDatum } from './Chart';

const week: ChartDatum[] = [
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 58 },
  { label: 'Wed', value: 31 },
  { label: 'Thu', value: 75 },
];

/** Renders and waits for the first draw (the SVG appears once the box is measured). */
async function renderChart(ui: ReactElement, options?: RenderWithProviderOptions) {
  const screen = await renderWithProvider(ui, options);
  await expect.poll(() => screen.container.querySelector('svg')).not.toBeNull();
  return screen;
}

function plot(screen: Awaited<ReturnType<typeof renderWithProvider>>) {
  return screen.getByRole('img', { name: 'Sales' });
}

function liveText(screen: Awaited<ReturnType<typeof renderWithProvider>>): string {
  return screen.getByRole('status').element().textContent;
}

describe('Chart', () => {
  describe('structure', () => {
    it('is a named image with instructions as its description', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      const image = plot(screen);
      await expect.element(image).toBeVisible();
      const describedBy = image.element().getAttribute('aria-describedby') ?? '';
      expect(document.getElementById(describedBy)?.textContent).toBe(
        '4 data points. Use the left and right arrow keys to move between points, Home and End for the first and last.',
      );
    });

    it('adds the longer description before the instructions', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" description="Sales per weekday in thousands." />,
      );
      const id = plot(screen).element().getAttribute('aria-describedby') ?? '';
      expect(document.getElementById(id)?.textContent).toMatch(
        /^Sales per weekday in thousands\. 4 data points/,
      );
    });

    it('can be named by aria-labelledby', async () => {
      const screen = await renderChart(
        <div>
          <h3 id="chart-title">Weekly sales</h3>
          <Chart data={week} aria-labelledby="chart-title" />
        </div>,
      );
      await expect.element(screen.getByRole('img', { name: 'Weekly sales' })).toBeVisible();
      expect(screen.container.querySelector('caption')?.textContent).toBe('Chart data');
    });

    it('draws one bar per datum, with the zero baseline and nice ticks', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      expect(screen.container.querySelectorAll('svg rect')).toHaveLength(4);
      const ticks = [...screen.container.querySelectorAll('svg text')].map(
        (node) => node.textContent,
      );
      expect(ticks).toEqual(expect.arrayContaining(['0', '20', '40', '60', '80']));
      expect(ticks).toEqual(expect.arrayContaining(['Mon', 'Tue', 'Wed', 'Thu']));
    });

    it('draws a line and an area for the line type', async () => {
      const screen = await renderChart(<Chart type="line" data={week} aria-label="Sales" />);
      expect(screen.container.querySelectorAll('svg path')).toHaveLength(2);
      expect(screen.container.querySelectorAll('svg rect')).toHaveLength(0);
    });

    it('applies the height prop and fills the container width', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" height={120} />);
      const rect = plot(screen).element().getBoundingClientRect();
      expect(rect.height).toBe(120);
      const root = plot(screen).element().parentElement?.getBoundingClientRect();
      expect(rect.width).toBe(root?.width);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderChart(
        <Chart ref={ref} data={week} aria-label="Sales" className="extra" data-testid="c" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('c');
    });

    it('shows a message and no marks without data', async () => {
      const screen = await renderChart(<Chart data={[]} aria-label="Sales" />);
      await expect.element(screen.getByText('No data to show')).toBeVisible();
      expect(screen.container.querySelectorAll('svg rect')).toHaveLength(0);
      expect(screen.container.innerHTML).not.toContain('NaN');
    });
  });

  describe('values', () => {
    it('handles negative values: bars hang below the zero line', async () => {
      const screen = await renderChart(
        <Chart
          data={[
            { label: 'A', value: 30 },
            { label: 'B', value: -20 },
          ]}
          aria-label="Sales"
        />,
      );
      const bars = [...screen.container.querySelectorAll('svg rect')].map((node) => ({
        y: Number(node.getAttribute('y')),
        height: Number(node.getAttribute('height')),
      }));
      const up = bars[0];
      const down = bars[1];
      expect(up && down).toBeTruthy();
      // The positive bar ends on the baseline; the negative one starts on it.
      expect((up?.y ?? 0) + (up?.height ?? 0)).toBeCloseTo(down?.y ?? -1, 0);
      const ticks = [...screen.container.querySelectorAll('svg text')].map(
        (node) => node.textContent,
      );
      expect(ticks.some((text) => text.startsWith('-') || text.startsWith('−'))).toBe(true);
      expect(screen.container.innerHTML).not.toContain('NaN');
    });

    it('handles all-zero and tiny values without NaN or Infinity', async () => {
      const zero = await renderChart(
        <Chart
          data={[
            { label: 'A', value: 0 },
            { label: 'B', value: 0 },
          ]}
          aria-label="Sales"
        />,
      );
      expect(zero.container.innerHTML).not.toMatch(/NaN|Infinity/);
      await zero.unmount();
      const tiny = await renderChart(
        <Chart
          type="line"
          data={[
            { label: 'A', value: 0.00001 },
            { label: 'B', value: 0.00003 },
          ]}
          aria-label="Sales"
          format={(value) => String(value)}
        />,
      );
      expect(tiny.container.innerHTML).not.toMatch(/NaN|Infinity/);
      const ticks = [...tiny.container.querySelectorAll('svg text')].map(
        (node) => node.textContent,
      );
      expect(ticks).toContain('0.00003');
    });

    it('uses the format prop on the axis, the announcement and the data table', async () => {
      const screen = await renderChart(
        <Chart
          data={[{ label: 'Mon', value: 124000 }]}
          aria-label="Sales"
          format={(value) => formatCurrency(value, 'USD', 'en-US')}
        />,
      );
      const ticks = [...screen.container.querySelectorAll('svg text')].map(
        (node) => node.textContent,
      );
      expect(ticks.some((text) => text.startsWith('$'))).toBe(true);
      expect(screen.container.querySelector('tbody td')?.textContent).toBe('$1,240.00');
    });

    it('formats numbers with the provider locale by default', async () => {
      const screen = await renderChart(
        <Chart data={[{ label: 'A', value: 1234.5 }]} aria-label="Vendas" />,
        { locale: 'pt-BR' },
      );
      expect(screen.container.querySelector('tbody td')?.textContent).toBe('1.234,5');
    });

    it('skips category labels when there is no room', async () => {
      const many = Array.from({ length: 60 }, (_, index) => ({
        label: `D${String(index)}`,
        value: index,
      }));
      const screen = await renderChart(
        <div style={{ width: 400 }}>
          <Chart data={many} aria-label="Sales" />
        </div>,
      );
      const labels = [...screen.container.querySelectorAll('svg text')].filter((node) =>
        /^D\d+$/.test(node.textContent),
      );
      expect(labels.length).toBeGreaterThan(0);
      expect(labels.length).toBeLessThan(30);
    });

    it('redraws when the container is resized', async () => {
      const screen = await renderChart(
        <div id="holder" style={{ width: 300 }}>
          <Chart data={week} aria-label="Sales" />
        </div>,
      );
      const svg = screen.container.querySelector('svg');
      await expect.poll(() => svg?.getAttribute('width')).toBe('300');
      (screen.container.querySelector('#holder') as HTMLElement).style.width = '500px';
      await expect
        .poll(() => screen.container.querySelector('svg')?.getAttribute('width'))
        .toBe('500');
    });
  });

  describe('data table alternative', () => {
    it('has a caption, headers and one row per point', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" valueLabel="Sales" categoryLabel="Day" />,
      );
      const table = screen.container.querySelector('table');
      expect(table?.querySelector('caption')?.textContent).toBe('Data for Sales');
      expect([...(table?.querySelectorAll('thead th') ?? [])].map((th) => th.textContent)).toEqual([
        'Day',
        'Sales',
      ]);
      expect(table?.querySelectorAll('tbody tr')).toHaveLength(4);
      expect(table?.querySelector('tbody tr th')?.textContent).toBe('Mon');
      expect(table?.querySelector('tbody tr td')?.textContent).toBe('42');
    });

    it('does not stretch the page: the hidden table is clipped by its wrapper', async () => {
      const many = Array.from({ length: 40 }, (_, index) => ({
        label: String(index),
        value: index,
      }));
      const screen = await renderChart(<Chart data={many} aria-label="Sales" />);
      const root = plot(screen).element().parentElement as HTMLElement;
      expect(root.scrollHeight).toBe(root.clientHeight);
    });

    it('is exposed to assistive technology', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      await expect
        .element(screen.getByRole('table', { name: 'Data for Sales' }))
        .toBeInTheDocument();
      expect(screen.getByRole('row').elements()).toHaveLength(5);
    });

    it('adds a note column when points are highlighted', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" highlight={{ 3: 'Best day' }} />,
      );
      const headers = [...screen.container.querySelectorAll('thead th')].map(
        (th) => th.textContent,
      );
      expect(headers).toEqual(['Category', 'Value', 'Note']);
      const rows = screen.container.querySelectorAll('tbody tr');
      expect(rows[3]?.querySelectorAll('td')[1]?.textContent).toBe('Best day');
    });
  });

  describe('highlight', () => {
    it('marks the point with text and a distinct bar, not only a color', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" highlight={{ 3: 'Best day' }} />,
      );
      const bars = screen.container.querySelectorAll('svg rect');
      expect(bars[3]?.hasAttribute('data-highlight')).toBe(true);
      expect(bars[0]?.hasAttribute('data-highlight')).toBe(false);
      const note = [...screen.container.querySelectorAll('svg text')].find(
        (node) => node.textContent === 'Best day',
      );
      expect(note).toBeTruthy();
      const barStyle = getComputedStyle(bars[3] as Element);
      expect(barStyle.strokeWidth).toBe('2px');
      expect(getComputedStyle(bars[0] as Element).strokeWidth).toBe('1px');
    });

    it('draws a marker on highlighted points of a line chart', async () => {
      const screen = await renderChart(
        <Chart type="line" data={week} aria-label="Sales" highlight={{ 1: 'Today' }} />,
      );
      expect(screen.container.querySelectorAll('svg circle')).toHaveLength(1);
    });
  });

  describe('notes', () => {
    const notes = { 1: 'Free shipping started on this day for every order.' };

    it('marks the point with a diamond shape and adds the note to the table', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" notes={notes} />);
      expect(screen.container.querySelectorAll('svg path')).toHaveLength(1);
      const headers = [...screen.container.querySelectorAll('thead th')].map(
        (th) => th.textContent,
      );
      expect(headers).toEqual(['Category', 'Value', 'Note']);
      const rows = screen.container.querySelectorAll('tbody tr');
      expect(rows[1]?.querySelectorAll('td')[1]?.textContent).toBe(notes[1]);
      expect(rows[0]?.querySelectorAll('td')[1]?.textContent).toBe('');
    });

    it('joins the highlight and the note in the table and the announcement', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" notes={notes} highlight={{ 1: 'Today' }} />,
      );
      await userEvent.keyboard('{Tab}{ArrowRight}{ArrowRight}');
      expect(liveText(screen)).toBe(
        'Tue: 58, Today. Free shipping started on this day for every order. 2 of 4',
      );
      const rows = screen.container.querySelectorAll('tbody tr');
      expect(rows[1]?.querySelectorAll('td')[1]?.textContent).toBe(`Today. ${notes[1]}`);
    });

    it('shows the long note under the value in the label of the active point', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" notes={notes} />);
      await userEvent.keyboard('{Tab}{ArrowRight}{ArrowRight}');
      await expect.element(screen.getByText('58 · Tue')).toBeVisible();
      await expect.element(screen.getByText(notes[1], { exact: true }).first()).toBeVisible();
      expect(screen.container.querySelector('[data-note]')).not.toBeNull();
    });

    it('does not add a marker or a column for empty notes', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" notes={{ 1: '' }} />);
      expect(screen.container.querySelectorAll('svg path')).toHaveLength(0);
      expect(screen.container.querySelectorAll('thead th')).toHaveLength(2);
    });
  });

  describe('reference lines', () => {
    const average = {
      kind: 'average' as const,
      label: 'Weekly mean',
      value: chartAverage(week),
    };
    const target = { kind: 'target' as const, label: 'Goal', value: 120 };

    it('draws dashed lines with different patterns and their labels as text', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" referenceLines={[average, target]} />,
      );
      const averageLine = screen.container.querySelector('line[data-kind="average"]') as Element;
      const targetLine = screen.container.querySelector('line[data-kind="target"]') as Element;
      const dashAverage = getComputedStyle(averageLine).strokeDasharray;
      const dashTarget = getComputedStyle(targetLine).strokeDasharray;
      expect(dashAverage).not.toBe('none');
      expect(dashTarget).not.toBe('none');
      expect(dashAverage).not.toBe(dashTarget);
      const texts = [...screen.container.querySelectorAll('svg text')].map((n) => n.textContent);
      expect(texts).toContain('Weekly mean 51.5');
      expect(texts).toContain('Goal 120');
    });

    it('extends the value axis to include a target above the data', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" referenceLines={[target]} />,
      );
      const ticks = [...screen.container.querySelectorAll('svg text')].map((n) =>
        Number(n.textContent),
      );
      expect(Math.max(...ticks.filter(Number.isFinite))).toBeGreaterThanOrEqual(120);
    });

    it('lists the lines in the description and in the last rows of the table', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" referenceLines={[average, target]} />,
      );
      const id = plot(screen).element().getAttribute('aria-describedby') ?? '';
      expect(document.getElementById(id)?.textContent).toMatch(
        /^Reference lines: Average, Weekly mean: 51\.5 and Target, Goal: 120\. 4 data points/,
      );
      const footer = [...screen.container.querySelectorAll('tfoot tr')].map((tr) => [
        tr.querySelector('th')?.textContent,
        tr.querySelector('td')?.textContent,
      ]);
      expect(footer).toEqual([
        ['Average, Weekly mean', '51.5'],
        ['Target, Goal', '120'],
      ]);
    });

    it('uses the kind alone when the label repeats it, and ignores non-finite values', async () => {
      const screen = await renderChart(
        <Chart
          data={week}
          aria-label="Sales"
          referenceLines={[
            { kind: 'average', label: 'Average', value: 50 },
            { kind: 'target', label: 'Broken', value: Number.NaN },
          ]}
        />,
      );
      expect(screen.container.querySelectorAll('tfoot tr')).toHaveLength(1);
      expect(screen.container.querySelector('tfoot th')?.textContent).toBe('Average');
    });

    it('does not repeat the kind when the label starts with it (GAP-056)', async () => {
      const english = await renderChart(
        <Chart
          data={week}
          aria-label="Sales"
          referenceLines={[
            { kind: 'average', label: 'average per open day', value: 50 },
            { kind: 'target', label: 'Targeted reach', value: 120 },
          ]}
        />,
      );
      const enId = plot(english).element().getAttribute('aria-describedby') ?? '';
      expect(document.getElementById(enId)?.textContent).toMatch(
        /^Reference lines: average per open day: 50 and Target, Targeted reach: 120\./,
      );
      await english.unmount();
      const screen = await renderChart(
        <Chart
          data={week}
          aria-label="Vendas"
          referenceLines={[
            { kind: 'average', label: 'Media por dia aberto', value: 50 },
            { kind: 'target', label: 'Mediana da loja', value: 70 },
          ]}
        />,
        { locale: 'pt-BR' },
      );
      const id =
        screen.getByRole('img', { name: 'Vendas' }).element().getAttribute('aria-describedby') ??
        '';
      expect(document.getElementById(id)?.textContent).toMatch(
        /^Linhas de referência: Media por dia aberto: 50 e Meta, Mediana da loja: 70\./,
      );
      const footer = [...screen.container.querySelectorAll('tfoot th')].map((th) => th.textContent);
      expect(footer).toEqual(['Media por dia aberto', 'Meta, Mediana da loja']);
    });

    it('adds no footer without lines, and uses the format prop and pt-BR names', async () => {
      const plain = await renderChart(<Chart data={week} aria-label="Sales" />);
      expect(plain.container.querySelector('tfoot')).toBeNull();
      await plain.unmount();
      const screen = await renderChart(
        <Chart
          data={week}
          aria-label="Vendas"
          format={(value) => `R$ ${String(value)}`}
          referenceLines={[{ kind: 'target', label: 'Meta do mês', value: 90 }]}
        />,
        { locale: 'pt-BR' },
      );
      const image = screen.getByRole('img', { name: 'Vendas' });
      const id = image.element().getAttribute('aria-describedby') ?? '';
      expect(document.getElementById(id)?.textContent).toMatch(
        /^Linhas de referência: Meta do mês: R\$ 90\./,
      );
    });
  });

  describe('tickEvery', () => {
    const days: ChartDatum[] = Array.from({ length: 14 }, (_, i) => ({
      label: `D${String(i + 1)}`,
      value: i + 1,
    }));
    const labelsOf = (container: HTMLElement) =>
      [...container.querySelectorAll('svg text')]
        .map((n) => n.textContent)
        .filter((text) => /^D\d+$/.test(text));

    it('shows every nth category label', async () => {
      const screen = await renderChart(<Chart data={days} aria-label="Sales" tickEvery={5} />);
      expect(labelsOf(screen.container)).toEqual(['D1', 'D6', 'D11']);
    });

    it('shows every label with tickEvery 1', async () => {
      const screen = await renderChart(<Chart data={days} aria-label="Sales" tickEvery={1} />);
      expect(labelsOf(screen.container)).toHaveLength(14);
    });
  });

  describe('keyboard and announcements', () => {
    it('is one tab stop and starts with nothing announced', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      await userEvent.keyboard('{Tab}');
      await expect.element(plot(screen)).toHaveFocus();
      expect(liveText(screen)).toBe('');
      expect(screen.container.querySelector('[aria-hidden="true"][class*="tooltip"]')).toBeNull();
    });

    it('moves between points with the arrow keys, Home and End, and announces each', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{ArrowRight}');
      expect(liveText(screen)).toBe('Mon: 42. 1 of 4');
      await userEvent.keyboard('{ArrowRight}');
      expect(liveText(screen)).toBe('Tue: 58. 2 of 4');
      await userEvent.keyboard('{ArrowLeft}');
      expect(liveText(screen)).toBe('Mon: 42. 1 of 4');
      await userEvent.keyboard('{ArrowLeft}');
      expect(liveText(screen)).toBe('Mon: 42. 1 of 4');
      await userEvent.keyboard('{End}');
      expect(liveText(screen)).toBe('Thu: 75. 4 of 4');
      await userEvent.keyboard('{ArrowRight}');
      expect(liveText(screen)).toBe('Thu: 75. 4 of 4');
      await userEvent.keyboard('{Home}');
      expect(liveText(screen)).toBe('Mon: 42. 1 of 4');
    });

    it('keeps counting when several keys arrive before a re-render (key repeat)', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      const element = plot(screen).element();
      await userEvent.keyboard('{Tab}');
      flushSync(() => {
        for (let index = 0; index < 3; index += 1) {
          element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        }
      });
      expect(liveText(screen)).toBe('Wed: 31. 3 of 4');
    });

    it('starts from the last point with the left arrow', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      await userEvent.keyboard('{Tab}{ArrowLeft}');
      expect(liveText(screen)).toBe('Thu: 75. 4 of 4');
    });

    it('is a polite live region', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      const status = screen.getByRole('status').element();
      expect(status.getAttribute('aria-live')).toBe('polite');
    });

    it('shows a value label above the active point and hides it on Escape and blur', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      await userEvent.keyboard('{Tab}{ArrowRight}{ArrowRight}');
      await expect.element(screen.getByText('58 · Tue')).toBeVisible();
      const bars = screen.container.querySelectorAll('svg rect');
      expect(bars[1]?.hasAttribute('data-active')).toBe(true);
      await userEvent.keyboard('{Escape}');
      expect(screen.getByText('58 · Tue').elements()).toHaveLength(0);
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByText('42 · Mon')).toBeVisible();
      await userEvent.keyboard('{Tab}');
      expect(screen.getByText('42 · Mon').elements()).toHaveLength(0);
      expect(liveText(screen)).toBe('');
    });

    it('includes the highlight text in the announcement and the label', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" highlight={{ 3: 'Best day' }} />,
      );
      await userEvent.keyboard('{Tab}{End}');
      expect(liveText(screen)).toBe('Thu: 75, Best day. 4 of 4');
      await expect.element(screen.getByText('75 · Thu · Best day')).toBeVisible();
    });

    it('does nothing for an empty chart', async () => {
      const screen = await renderChart(<Chart data={[]} aria-label="Sales" />);
      await userEvent.keyboard('{Tab}{ArrowRight}');
      expect(liveText(screen)).toBe('');
    });

    it('works for the line type', async () => {
      const screen = await renderChart(<Chart type="line" data={week} aria-label="Sales" />);
      await userEvent.keyboard('{Tab}{ArrowRight}');
      expect(screen.container.querySelectorAll('svg circle')).toHaveLength(1);
      expect(screen.container.querySelectorAll('svg line[class*="cursor"]')).toHaveLength(1);
    });
  });

  describe('pointer', () => {
    it('shows the label of the point under the pointer', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Sales" />);
      const element = plot(screen).element();
      const box = element.getBoundingClientRect();
      await userEvent.hover(plot(screen), { position: { x: box.width - 20, y: 80 } });
      await expect.element(screen.getByText('75 · Thu')).toBeVisible();
      await userEvent.unhover(plot(screen));
      expect(screen.getByText('75 · Thu').elements()).toHaveLength(0);
    });
  });

  describe('messages and locale', () => {
    it('translates the instructions, announcements and table to pt-BR', async () => {
      const screen = await renderChart(<Chart data={week} aria-label="Vendas" />, {
        locale: 'pt-BR',
      });
      const image = screen.getByRole('img', { name: 'Vendas' });
      const id = image.element().getAttribute('aria-describedby') ?? '';
      expect(document.getElementById(id)?.textContent).toContain('4 pontos de dados');
      expect(screen.container.querySelector('caption')?.textContent).toBe('Dados de Vendas');
      await userEvent.keyboard('{Tab}{ArrowRight}');
      expect(liveText(screen)).toBe('Mon: 42. 1 de 4');
    });

    it('accepts provider and instance overrides', async () => {
      const provider = await renderChart(<Chart data={week} aria-label="Sales" />, {
        messages: { Chart: { category: 'Weekday' } },
      });
      expect(provider.container.querySelector('thead th')?.textContent).toBe('Weekday');
      await provider.unmount();
      const instance = await renderChart(
        <Chart data={week} aria-label="Sales" messages={{ category: 'Day name' }} />,
        { messages: { Chart: { category: 'Weekday' } } },
      );
      expect(instance.container.querySelector('thead th')?.textContent).toBe('Day name');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for bar, line, highlighted, negative and empty charts', async () => {
      const cases = [
        <Chart key="bar" data={week} aria-label="Sales" />,
        <Chart key="line" type="line" data={week} aria-label="Sales" highlight={{ 1: 'Today' }} />,
        <Chart
          key="negative"
          data={[
            { label: 'A', value: -5 },
            { label: 'B', value: 9 },
          ]}
          aria-label="Sales"
          highlight={{ 0: 'Low' }}
        />,
        <Chart key="empty" data={[]} aria-label="Sales" />,
        <Chart
          key="annotated"
          data={week}
          aria-label="Sales"
          notes={{ 2: 'Store closed for inventory.' }}
          referenceLines={[
            { kind: 'average', label: 'Average', value: 52 },
            { kind: 'target', label: 'Goal', value: 100 },
          ]}
        />,
      ];
      for (const chart of cases) {
        const screen = await renderChart(chart);
        await expectNoA11yViolations(screen.container);
        await screen.unmount();
      }
    });

    it('has no axe violations while a point with a note is active', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" notes={{ 1: 'A long explanation of this day.' }} />,
      );
      await userEvent.keyboard('{Tab}{ArrowRight}{ArrowRight}');
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations while a point is active', async () => {
      const screen = await renderChart(
        <Chart data={week} aria-label="Sales" highlight={{ 1: 'Today' }} />,
      );
      await userEvent.keyboard('{Tab}{ArrowRight}{ArrowRight}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
