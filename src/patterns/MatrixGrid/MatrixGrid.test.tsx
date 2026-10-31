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
