import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { Button, useLocale } from 'react-aria-components';
import { Icon } from '../../components/Icon';
import { CheckIcon, PlusIcon } from '../../components/Icon/icons';
import { Spinner } from '../../components/Spinner';
import { Swatch } from '../../components/Swatch';
import { isHexColor } from '../../components/Swatch/hex';
import { VisuallyHidden } from '../../components/VisuallyHidden';
import { useDSLocale, useMessages } from '../../i18n';
import { readableTextOn } from '../../utils/color';
import { classNames } from '../../utils/classNames';
import { reportInvalid } from '../../utils/env';
import { formatNumber } from '../../utils/number';
import { messages } from './MatrixGrid.messages';
import styles from './MatrixGrid.module.css';

export interface MatrixGridRow {
  /** Stable identifier, passed to `isLinked` and `onToggle`. */
  id: string;
  /** Visible name of the row. Part of every cell's accessible name. */
  label: string;
  /** Optional second line under the label, in mono (a code, a count). */
  meta?: string;
}

export interface MatrixGridColumn {
  /** Stable identifier, passed to `isLinked` and `onToggle`. */
  id: string;
  /** Visible name of the column. Part of every cell's accessible name. */
  label: string;
  /**
   * Optional `#rgb` / `#rrggbb` color: shown as a swatch in the header and used to fill linked
   * cells. The check mark switches between light and dark by WCAG contrast.
   */
  color?: string;
}

export interface MatrixGridProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'onToggle' | 'role' | 'aria-label' | 'aria-labelledby'
> {
  /** Accessible name of the grid ("Product colors"). The scroll region around it is named from it too. */
  'aria-label': string;
  /** The rows, in display order. Sort them yourself (alphabetically by default). */
  rows: readonly MatrixGridRow[];
  /** The columns, in display order. */
  columns: readonly MatrixGridColumn[];
  /** Whether a row and a column are linked. Called for every cell on each render; keep it cheap. */
  isLinked: (rowId: string, columnId: string) => boolean;
  /**
   * Called with the row and column ids when the user toggles a cell. Update your state in it.
   *
   * It may return a promise (a request to save the link). While it is pending the cell shows a
   * spinner, is `aria-busy` and ignores further toggles. The grid never flips a cell by itself:
   * the cell shows what `isLinked` returns, so if you update optimistically, revert in
   * `onToggleError`. A rejected promise calls `onToggleError`.
   */
  onToggle: (rowId: string, columnId: string) => unknown;
  /**
   * Called when the promise returned by `onToggle` rejects, with the error and the cell's ids.
   * Revert an optimistic update here and tell the user (a toast). The grid also announces
   * "Couldn't update {row} · {column}. Try again." in a visually hidden status.
   */
  onToggleError?: (error: unknown, rowId: string, columnId: string) => void;
  /** Caption of the first (row header) column. Without it a visually hidden "Row" is used. */
  cornerLabel?: string;
  /** Adds a last column with the number of linked cells per row; this is its header ("Linked"). */
  countLabel?: string;
  /** Help text under the grid, linked to it with `aria-describedby`. */
  hint?: ReactNode;
  /** Message overrides for this instance. */
  messages?: Partial<typeof messages.en>;
}

interface Position {
  row: number;
  column: number;
}

function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), Math.max(max, 0));
}

/**
 * A matrix of toggle cells: rows by columns, each cell linking or unlinking one row with one
 * column. It is an ARIA `grid` with roving focus: the grid is one tab stop, the arrow keys move
 * between cells (`Home` / `End` within a row, `Ctrl+Home` / `Ctrl+End` to the first / last
 * cell), and `Space` or `Enter` toggles. Arrow keys follow the reading direction.
 *
 * The row and the column of the focused cell get a subtle surface step (a visual aid; the focus
 * ring and the cell name carry the meaning). The column header row and the row header column stay
 * fixed while the region scrolls; give the root a height (`className`) to scroll vertically.
 * `onToggle` may return a promise for a per-cell pending state (see `onToggle`).
 *
 * Each cell is a button named "{row} · {column}: linked" / "not linked" (messages). The grid
 * scrolls horizontally inside a labelled, focusable region.
 *
 * Import it from `loui-ds/patterns`.
 */
export function MatrixGrid({
  rows,
  columns,
  isLinked,
  onToggle,
  onToggleError,
  cornerLabel,
  countLabel,
  hint,
  messages: overrides,
  className,
  style,
  'aria-label': gridLabel,
  ...rest
}: MatrixGridProps) {
  const t = useMessages('MatrixGrid', messages, overrides);
  const locale = useDSLocale();
  const { direction } = useLocale();
  const hintId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Position>({ row: 0, column: 0 });
  const lastRow = rows.length - 1;
  const lastColumn = columns.length - 1;
  const current: Position = {
    row: clamp(active.row, lastRow),
    column: clamp(active.column, lastColumn),
  };
  const [focused, setFocused] = useState(false);
  const [pending, setPending] = useState<ReadonlySet<string>>(() => new Set());
  const pendingRef = useRef(new Set<string>());
  const [failure, setFailure] = useState('');
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const showCount = countLabel !== undefined && countLabel !== '';

  function toggle(row: MatrixGridRow, column: MatrixGridColumn) {
    const key = `${row.id}\u0000${column.id}`;
    if (pendingRef.current.has(key)) return;
    let result: unknown;
    try {
      result = onToggle(row.id, column.id);
    } catch (error) {
      onToggleError?.(error, row.id, column.id);
      setFailure(t.toggleFailed(row.label, column.label));
      return;
    }
    if (
      result === undefined ||
      typeof (result as PromiseLike<unknown> | null | undefined)?.then !== 'function'
    )
      return;
    pendingRef.current.add(key);
    setPending(new Set(pendingRef.current));
    setFailure('');
    const settle = () => {
      pendingRef.current.delete(key);
      if (mounted.current) setPending(new Set(pendingRef.current));
    };
    void Promise.resolve(result as PromiseLike<unknown>).then(settle, (error: unknown) => {
      settle();
      onToggleError?.(error, row.id, column.id);
      if (mounted.current) setFailure(t.toggleFailed(row.label, column.label));
    });
  }

  function focusCell({ row, column }: Position) {
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-matrix-cell][data-row="${row}"][data-column="${column}"]`)
      ?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-matrix-cell]');
    if (!target || event.altKey || event.shiftKey) return;
    const row = Number(target.dataset.row);
    const column = Number(target.dataset.column);
    const forward = direction === 'rtl' ? -1 : 1;
    const jump = event.ctrlKey || event.metaKey;
    let next: Position | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = { row, column: column + forward };
        break;
      case 'ArrowLeft':
        next = { row, column: column - forward };
        break;
      case 'ArrowDown':
        next = { row: row + 1, column };
        break;
      case 'ArrowUp':
        next = { row: row - 1, column };
        break;
      case 'Home':
        next = jump ? { row: 0, column: 0 } : { row, column: 0 };
        break;
      case 'End':
        next = jump ? { row: lastRow, column: lastColumn } : { row, column: lastColumn };
        break;
      default:
        return;
    }
    event.preventDefault();
    focusCell({ row: clamp(next.row, lastRow), column: clamp(next.column, lastColumn) });
  }

  const rootStyle = {
    ...style,
    '--ds-matrix-grid-columns': columns.length,
  } as CSSProperties;

  return (
    <div {...rest} className={classNames(styles.root, className)} style={rootStyle}>
      <div
        role="region"
        aria-label={t.scrollRegion(gridLabel)}
        // eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex -- keyboard users must be able to scroll the region.
        tabIndex={0}
        className={styles.scroll}
      >
        {/* Keys are handled for the focusable cells inside (event delegation); the grid itself never takes focus. */}
        {/* eslint-disable-next-line jsx-a11y-x/interactive-supports-focus */}
        <div
          ref={gridRef}
          role="grid"
          aria-label={gridLabel}
          aria-describedby={hint ? hintId : undefined}
          className={styles.grid}
          data-count={showCount ? 'true' : undefined}
          onKeyDown={onKeyDown}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
        >
          <div role="row" className={styles.row} data-header="true">
            <div role="columnheader" className={styles.corner}>
              {cornerLabel ?? <VisuallyHidden>{t.rowHeader}</VisuallyHidden>}
            </div>
            {columns.map((column, headerIndex) => (
              <div
                key={column.id}
                role="columnheader"
                className={styles.columnHeader}
                data-guide={focused && current.column === headerIndex ? 'true' : undefined}
              >
                {column.color !== undefined && isHexColor(column.color) ? (
                  <Swatch color={column.color} size="sm" decorative />
                ) : null}
                <span className={styles.columnLabel}>{column.label}</span>
              </div>
            ))}
            {showCount ? (
              <div role="columnheader" className={styles.countHeader}>
                {countLabel}
              </div>
            ) : null}
          </div>
          {rows.map((row, rowIndex) => {
            let count = 0;
            const cells = columns.map((column, columnIndex) => {
              const linked = isLinked(row.id, column.id);
              if (linked) count += 1;
              let color = column.color;
              if (color !== undefined && !isHexColor(color)) {
                reportInvalid(
                  `MatrixGrid column "${column.id}" expects a hex color (#rgb or #rrggbb), received "${color}".`,
                );
                color = undefined;
              }
              const cellStyle =
                color === undefined
                  ? undefined
                  : ({ '--ds-matrix-grid-color': color } as CSSProperties);
              const tone =
                color === undefined ? 'dark' : readableTextOn(color) === 'light' ? 'light' : 'dark';
              const isPending = pending.has(`${row.id}\u0000${column.id}`);
              const isActive = rowIndex === current.row && columnIndex === current.column;
              return (
                <div
                  key={column.id}
                  role="gridcell"
                  className={styles.cellBox}
                  aria-busy={isPending || undefined}
                  data-guide={focused && columnIndex === current.column ? 'true' : undefined}
                >
                  <Button
                    className={classNames(styles.cell)}
                    {...(cellStyle ? { style: cellStyle } : {})}
                    aria-label={(isPending ? t.cellPending : t.cell)(
                      row.label,
                      column.label,
                      linked,
                    )}
                    data-pending={isPending ? 'true' : undefined}
                    excludeFromTabOrder={!isActive}
                    data-matrix-cell=""
                    data-row={rowIndex}
                    data-column={columnIndex}
                    data-linked={linked ? 'true' : undefined}
                    data-tone={tone}
                    onFocus={() => {
                      setActive({ row: rowIndex, column: columnIndex });
                    }}
                    onPress={() => {
                      toggle(row, column);
                    }}
                  >
                    {isPending ? (
                      <Spinner size="sm" decorative />
                    ) : (
                      <Icon icon={linked ? CheckIcon : PlusIcon} size="md" />
                    )}
                  </Button>
                </div>
              );
            });
            return (
              <div
                key={row.id}
                role="row"
                className={styles.row}
                data-guide={focused && rowIndex === current.row ? 'true' : undefined}
              >
                <div role="rowheader" className={styles.rowHeader}>
                  <span className={styles.rowLabel}>{row.label}</span>
                  {row.meta ? <span className={styles.rowMeta}>{row.meta}</span> : null}
                </div>
                {cells}
                {showCount ? (
                  <div role="gridcell" className={styles.count}>
                    {formatNumber(count, locale)}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <VisuallyHidden>
        <span role="status">{failure}</span>
      </VisuallyHidden>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
