import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { contrastRatio, readableTextOn } from '../../utils/color';
import { MatrixGrid } from './MatrixGrid';
import type { MatrixGridProps } from './MatrixGrid';

const rows = [
  { id: 'lamp', label: 'Desk lamp', meta: 'LMP-01' },
  { id: 'notebook', label: 'Notebook' },
  { id: 'backpack', label: 'Backpack' },
];

const columns = [
  { id: 'navy', label: 'Navy', color: '#1f3a93' },
  { id: 'yellow', label: 'Yellow', color: '#ffd400' },
  { id: 'gray', label: 'Gray' },
  { id: 'red', label: 'Brick red', color: '#c0392b' },
];

const linkedPairs = new Set(['lamp:navy', 'notebook:yellow', 'notebook:red']);

function Example(props: Partial<MatrixGridProps>) {
  return (
    <>
      <button type="button">Before</button>
      <MatrixGrid
        aria-label="Product colors"
        rows={rows}
        columns={columns}
        isLinked={(row, column) => linkedPairs.has(`${row}:${column}`)}
        onToggle={() => undefined}
        {...props}
      />
      <button type="button">After</button>
    </>
  );
}

function cell(screen: Awaited<ReturnType<typeof renderWithProvider>>, name: string) {
  return screen.getByRole('button', { name });
}

describe('MatrixGrid', () => {
  describe('rendering and ARIA', () => {
    it('is a named grid inside a named, focusable scroll region', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('grid', { name: 'Product colors' })).toBeVisible();
      const region = screen.getByRole('region', { name: 'Product colors, scrollable' });
      await expect.element(region).toBeVisible();
      expect(region.element().getAttribute('tabindex')).toBe('0');
    });

    it('has row headers, column headers and one toggle button per cell', async () => {
      const screen = await renderWithProvider(<Example />);
      expect(screen.getByRole('rowheader').elements()).toHaveLength(3);
      expect(screen.getByRole('columnheader').elements()).toHaveLength(5);
      expect(screen.getByRole('gridcell').elements()).toHaveLength(12);
      expect(screen.getByRole('button', { name: /·/ }).elements()).toHaveLength(12);
      await expect
        .element(screen.getByRole('rowheader', { name: 'Desk lamp LMP-01' }))
        .toBeVisible();
    });

    it('names each cell "{row} · {column}: linked / not linked"', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(cell(screen, 'Desk lamp · Navy: linked')).toBeVisible();
      await expect.element(cell(screen, 'Desk lamp · Gray: not linked')).toBeVisible();
      await expect.element(cell(screen, 'Notebook · Brick red: linked')).toBeVisible();
    });

    it('uses a visually hidden row header when there is no cornerLabel, or shows it', async () => {
      const screen = await renderWithProvider(
        <>
          <Example />
          <MatrixGrid
            aria-label="Other"
            cornerLabel="Product"
            rows={rows}
            columns={columns}
            isLinked={() => false}
            onToggle={() => undefined}
          />
        </>,
      );
      await expect.element(screen.getByRole('columnheader', { name: 'Row' })).toBeInTheDocument();
      await expect.element(screen.getByRole('columnheader', { name: 'Product' })).toBeVisible();
    });

    it('adds a count column with a header when countLabel is set', async () => {
      const screen = await renderWithProvider(<Example countLabel="Linked" />);
      await expect.element(screen.getByRole('columnheader', { name: 'Linked' })).toBeVisible();
      const counts = screen
        .getByRole('row')
        .elements()
        .slice(1)
        .map((row) => row.lastElementChild?.textContent);
      expect(counts).toEqual(['1', '2', '0']);
    });

    it('links the hint to the grid', async () => {
      const screen = await renderWithProvider(<Example hint="Click a cell to link it." />);
      await expect.element(screen.getByText('Click a cell to link it.')).toBeVisible();
      await expect
        .element(screen.getByRole('grid'))
        .toHaveAccessibleDescription('Click a cell to link it.');
    });

    it('scrolls horizontally inside the region when the container is narrow', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 360 }}>
          <MatrixGrid
            aria-label="Narrow"
            rows={rows}
            columns={columns}
            isLinked={() => false}
            onToggle={() => undefined}
          />
        </div>,
      );
      const region = screen.getByRole('region').element();
      expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
      expect(getComputedStyle(region).overflowX).toBe('auto');
    });

    it('draws 40px cells, above the minimum target size', async () => {
      const screen = await renderWithProvider(<Example />);
      const box = cell(screen, 'Desk lamp · Navy: linked').element().getBoundingClientRect();
      expect([box.width, box.height]).toEqual([40, 40]);
    });

    it('fills linked cells with the column color through a custom property', async () => {
      const screen = await renderWithProvider(<Example />);
      const element = cell(screen, 'Desk lamp · Navy: linked').element();
      expect(element.style.getPropertyValue('--ds-matrix-grid-color')).toBe('#1f3a93');
      expect(getComputedStyle(element).backgroundColor).toBe('rgb(31, 58, 147)');
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <MatrixGrid
          ref={ref}
          aria-label="G"
          rows={rows}
          columns={columns}
          isLinked={() => false}
          onToggle={() => undefined}
          className="extra"
          data-testid="m"
        />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('m');
    });

    it('throws for an invalid column color in development', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await expect(
        renderWithProvider(
          <MatrixGrid
            aria-label="G"
            rows={rows}
            columns={[{ id: 'x', label: 'X', color: 'blue' }]}
            isLinked={() => false}
            onToggle={() => undefined}
          />,
        ),
      ).rejects.toThrow(/hex color/);
      error.mockRestore();
    });
  });

  describe('check mark contrast on arbitrary colors', () => {
    const palette = [
      '#ffffff',
      '#000000',
      '#ffd400',
      '#1f3a93',
      '#c0392b',
      '#808080',
      '#27ae60',
      '#f1c40f',
    ];

    function hex(rgb: string): string {
      const parts = (/rgba?\((\d+), (\d+), (\d+)/.exec(rgb) ?? []).slice(1, 4).map(Number);
      return `#${parts.map((part) => part.toString(16).padStart(2, '0')).join('')}`;
    }

    it('picks light or dark by WCAG contrast and keeps at least 3:1', async () => {
      const screen = await renderWithProvider(
        <MatrixGrid
          aria-label="Palette"
          rows={[{ id: 'r', label: 'Row' }]}
          columns={palette.map((color) => ({ id: color, label: color, color }))}
          isLinked={() => true}
          onToggle={() => undefined}
        />,
      );
      for (const color of palette) {
        const element = screen.getByRole('button', { name: `Row · ${color}: linked` }).element();
        const style = getComputedStyle(element);
        const ratio = contrastRatio(hex(style.color), hex(style.backgroundColor));
        expect(ratio, `${color} check mark`).toBeGreaterThanOrEqual(3);
        expect(element.dataset.tone).toBe(readableTextOn(color));
      }
    });
  });

  describe('keyboard contract', () => {
    it('has one tab stop for the whole grid (after the scroll region)', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('region')).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(cell(screen, 'Desk lamp · Navy: linked')).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('moves with the arrow keys and stops at the edges', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}{Tab}{Tab}');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(cell(screen, 'Desk lamp · Yellow: not linked')).toHaveFocus();
      await userEvent.keyboard('{ArrowDown}');
      await expect.element(cell(screen, 'Notebook · Yellow: linked')).toHaveFocus();
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
      await expect.element(cell(screen, 'Notebook · Navy: not linked')).toHaveFocus();
      await userEvent.keyboard('{ArrowUp}{ArrowUp}');
      await expect.element(cell(screen, 'Desk lamp · Navy: linked')).toHaveFocus();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
      await expect.element(cell(screen, 'Backpack · Navy: not linked')).toHaveFocus();
    });

    it('jumps with Home, End, Ctrl+Home and Ctrl+End', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}{Tab}{Tab}');
      await userEvent.keyboard('{ArrowDown}{End}');
      await expect.element(cell(screen, 'Notebook · Brick red: linked')).toHaveFocus();
      await userEvent.keyboard('{Home}');
      await expect.element(cell(screen, 'Notebook · Navy: not linked')).toHaveFocus();
      await userEvent.keyboard('{Control>}{End}{/Control}');
      await expect.element(cell(screen, 'Backpack · Brick red: not linked')).toHaveFocus();
      await userEvent.keyboard('{Control>}{Home}{/Control}');
      await expect.element(cell(screen, 'Desk lamp · Navy: linked')).toHaveFocus();
    });

    it('toggles with Space and Enter and reports the ids', async () => {
      const onToggle = vi.fn();
      const screen = await renderWithProvider(<Example onToggle={onToggle} />);
      await userEvent.keyboard('{Tab}{Tab}{Tab}');
      await userEvent.keyboard(' ');
      expect(onToggle).toHaveBeenLastCalledWith('lamp', 'navy');
      await userEvent.keyboard('{ArrowDown}{ArrowRight}{Enter}');
      expect(onToggle).toHaveBeenLastCalledWith('notebook', 'yellow');
      await userEvent.click(cell(screen, 'Backpack · Gray: not linked'));
      expect(onToggle).toHaveBeenLastCalledWith('backpack', 'gray');
    });

    it('returns to the last focused cell when tabbing back in (roving tabindex)', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}{Tab}{Tab}{ArrowDown}{ArrowRight}');
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      await expect.element(cell(screen, 'Notebook · Yellow: linked')).toHaveFocus();
    });

    it('reverses the horizontal arrows in right-to-left locales', async () => {
      const screen = await renderWithProvider(<Example />, { locale: 'ar' });
      await userEvent.keyboard('{Tab}{Tab}{Tab}');
      await userEvent.keyboard('{ArrowLeft}');
      await expect.element(screen.getByRole('button', { name: /Yellow/ }).first()).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('button', { name: /Navy/ }).first()).toHaveFocus();
    });
  });

  describe('controlled state', () => {
    it('reflects the state owned by the parent', async () => {
      function Parent() {
        const [linked, setLinked] = useState(new Set<string>());
        return (
          <MatrixGrid
            aria-label="Colors"
            countLabel="Linked"
            rows={rows}
            columns={columns}
            isLinked={(row, column) => linked.has(`${row}:${column}`)}
            onToggle={(row, column) => {
              setLinked((current) => {
                const next = new Set(current);
                const key = `${row}:${column}`;
                if (next.has(key)) next.delete(key);
                else next.add(key);
                return next;
              });
            }}
          />
        );
      }
      const screen = await renderWithProvider(<Parent />);
      await userEvent.click(cell(screen, 'Backpack · Gray: not linked'));
      await expect.element(cell(screen, 'Backpack · Gray: linked')).toBeVisible();
      await userEvent.click(cell(screen, 'Backpack · Gray: linked'));
      await expect.element(cell(screen, 'Backpack · Gray: not linked')).toBeVisible();
    });

    it('keeps a valid focus position when rows disappear', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}{Tab}{Tab}{Control>}{End}{/Control}');
      await screen.rerender(<Example rows={rows.slice(0, 1)} columns={columns.slice(0, 2)} />);
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      await expect.element(cell(screen, 'Desk lamp · Yellow: not linked')).toHaveFocus();
    });
  });

  describe('async toggle (GAP-029)', () => {
    function deferred() {
      let resolve!: () => void;
      let reject!: (error: unknown) => void;
      const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    it('shows a pending state on the cell, ignores repeat toggles and clears when it resolves', async () => {
      const pending = deferred();
      const onToggle = vi.fn(() => pending.promise);
      const screen = await renderWithProvider(<Example onToggle={onToggle} />);
      await userEvent.click(cell(screen, 'Backpack · Gray: not linked'));
      const busy = screen.getByRole('button', { name: 'Backpack · Gray: not linked, saving' });
      expect(busy.element().closest('[role="gridcell"]')?.getAttribute('aria-busy')).toBe('true');
      await userEvent.click(busy);
      await userEvent.keyboard('{Enter}');
      expect(onToggle).toHaveBeenCalledTimes(1);
      // Other cells stay available.
      await userEvent.click(cell(screen, 'Backpack · Navy: not linked'));
      expect(onToggle).toHaveBeenCalledTimes(2);
      pending.resolve();
      await expect.poll(() => document.querySelectorAll('[aria-busy]').length).toBe(0);
    });

    it('keeps the cell as isLinked reports it and calls onToggleError when the promise rejects', async () => {
      const pending = deferred();
      const failure = new Error('offline');
      const onToggleError = vi.fn();
      const screen = await renderWithProvider(
        <Example onToggle={() => pending.promise} onToggleError={onToggleError} />,
      );
      await userEvent.click(cell(screen, 'Backpack · Gray: not linked'));
      pending.reject(failure);
      await expect.poll(() => onToggleError.mock.calls.length).toBe(1);
      expect(onToggleError).toHaveBeenCalledWith(failure, 'backpack', 'gray');
      await expect.poll(() => document.querySelectorAll('[aria-busy]').length).toBe(0);
      await expect
        .element(screen.getByRole('status'))
        .toHaveTextContent("Couldn't update Backpack · Gray. Try again.");
    });

    it('lets a consumer revert an optimistic update in onToggleError', async () => {
      function Optimistic() {
        const [linked, setLinked] = useState(false);
        return (
          <MatrixGrid
            aria-label="Optimistic"
            rows={rows.slice(0, 1)}
            columns={columns.slice(0, 1)}
            isLinked={() => linked}
            onToggle={() => {
              setLinked(true);
              return Promise.reject(new Error('nope'));
            }}
            onToggleError={() => {
              setLinked(false);
            }}
          />
        );
      }
      const screen = await renderWithProvider(<Optimistic />);
      await userEvent.click(screen.getByRole('button'));
      await expect
        .element(screen.getByRole('button', { name: 'Desk lamp · Navy: not linked' }))
        .toBeVisible();
    });

    it('keeps synchronous onToggle behavior unchanged (no pending state)', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.click(cell(screen, 'Backpack · Gray: not linked'));
      expect(document.querySelectorAll('[aria-busy]')).toHaveLength(0);
    });

    it('names the pending cell in pt-BR', async () => {
      const pending = deferred();
      const screen = await renderWithProvider(<Example onToggle={() => pending.promise} />, {
        locale: 'pt-BR',
      });
      await userEvent.click(cell(screen, 'Backpack · Gray: não vinculado'));
      await expect
        .element(screen.getByRole('button', { name: 'Backpack · Gray: não vinculado, salvando' }))
        .toBeVisible();
      pending.resolve();
    });
  });

  describe('sticky headers and focus guides (GAP-029)', () => {
    function Tall(props: Partial<MatrixGridProps>) {
      const many = Array.from({ length: 30 }, (_, index) => ({
        id: `r${String(index)}`,
        label: `Item ${String(index + 1)}`,
      }));
      return (
        <div style={{ inlineSize: 360, blockSize: 300, display: 'flex' }}>
          <MatrixGrid
            aria-label="Tall"
            rows={many}
            columns={columns}
            isLinked={() => false}
            onToggle={() => undefined}
            cornerLabel="Item"
            style={{ flex: 1 }}
            {...props}
          />
        </div>
      );
    }

    it('keeps the header row and the row header column in view while the region scrolls', async () => {
      const screen = await renderWithProvider(<Tall />);
      const region = screen.getByRole('region').element();
      region.scrollTo({ top: 400, left: 120 });
      await expect.poll(() => region.scrollTop).toBeGreaterThan(300);
      const regionBox = region.getBoundingClientRect();
      const header = screen.getByRole('columnheader', { name: 'Navy' }).element();
      expect(Math.abs(header.getBoundingClientRect().top - regionBox.top)).toBeLessThan(40);
      const rowHeader = screen.getByRole('rowheader').first().element();
      expect(getComputedStyle(rowHeader).position).toBe('sticky');
      expect(rowHeader.getBoundingClientRect().left).toBeGreaterThanOrEqual(regionBox.left - 1);
      expect(rowHeader.getBoundingClientRect().left).toBeLessThan(regionBox.left + 30);
    });

    it('does not hide a focused cell behind the sticky header', async () => {
      const screen = await renderWithProvider(<Tall />);
      await userEvent.keyboard('{Tab}{Tab}');
      await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
      for (let i = 0; i < 12; i += 1) await userEvent.keyboard('{ArrowDown}');
      const focused = document.activeElement as HTMLElement;
      const header = screen.getByRole('columnheader', { name: 'Navy' }).element();
      expect(focused.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        header.getBoundingClientRect().bottom - 1,
      );
      const rowHeader = screen.getByRole('rowheader').first().element();
      expect(focused.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        rowHeader.getBoundingClientRect().right - 1,
      );
    });

    it('highlights the row and the column of the focused cell and clears on blur', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}{Tab}{Tab}');
      await userEvent.keyboard('{ArrowDown}{ArrowRight}');
      const guided = [...document.querySelectorAll('[data-guide]')].map((node) =>
        node.getAttribute('role'),
      );
      expect(guided.filter((role) => role === 'row')).toHaveLength(1);
      expect(guided.filter((role) => role === 'gridcell')).toHaveLength(3);
      expect(guided.filter((role) => role === 'columnheader')).toHaveLength(1);
      const row = document.activeElement?.closest('[role="row"]');
      expect(getComputedStyle(row as Element).backgroundColor).not.toBe(
        getComputedStyle(screen.getByRole('grid').element()).backgroundColor,
      );
      await userEvent.tab();
      await expect.poll(() => document.querySelectorAll('[data-guide]').length).toBe(0);
    });
  });

  describe('i18n', () => {
    it('names cells, region and hidden header in pt-BR', async () => {
      const screen = await renderWithProvider(<Example />, { locale: 'pt-BR' });
      await expect.element(cell(screen, 'Desk lamp · Navy: vinculado')).toBeVisible();
      await expect.element(cell(screen, 'Desk lamp · Gray: não vinculado')).toBeVisible();
      await expect
        .element(screen.getByRole('region', { name: 'Product colors, rolável' }))
        .toBeVisible();
      await expect.element(screen.getByRole('columnheader', { name: 'Linha' })).toBeInTheDocument();
    });

    it('applies a provider override', async () => {
      const screen = await renderWithProvider(<Example />, {
        messages: {
          MatrixGrid: {
            cell: (row: string, column: string, linked: boolean) =>
              `${row} / ${column}: ${linked ? 'on' : 'off'}`,
          },
        },
      });
      await expect.element(cell(screen, 'Desk lamp / Navy: on')).toBeVisible();
    });

    it('applies an instance override', async () => {
      const screen = await renderWithProvider(
        <Example messages={{ scrollRegion: (name: string) => `${name} (scroll)` }} />,
      );
      await expect
        .element(screen.getByRole('region', { name: 'Product colors (scroll)' }))
        .toBeVisible();
    });

    it('formats counts for the locale', async () => {
      const many = Array.from({ length: 1200 }, (_, index) => ({
        id: `c${String(index)}`,
        label: `C${String(index)}`,
      }));
      const screen = await renderWithProvider(
        <MatrixGrid
          aria-label="Many"
          countLabel="Total"
          rows={[{ id: 'r', label: 'Row' }]}
          columns={many}
          isLinked={() => true}
          onToggle={() => undefined}
        />,
        { locale: 'pt-BR' },
      );
      await expect.element(screen.getByText('1.200')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example
            countLabel="Linked"
            hint="Click a cell to link or unlink it."
            cornerLabel="Product"
          />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations with a focused cell and a narrow container (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <div style={{ inlineSize: 320 }}>
            <Example />
          </div>
        </main>,
      );
      await userEvent.keyboard('{Tab}{Tab}{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
