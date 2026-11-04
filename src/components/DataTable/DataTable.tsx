import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  useTableOptions,
} from 'react-aria-components';
import type { Key, Selection, SortDescriptor } from 'react-aria-components';
import { useControllableState } from '../../hooks';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { isDev } from '../../utils/env';
import { formatNumber } from '../../utils/number';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { EmptyState } from '../EmptyState';
import { Icon } from '../Icon';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from '../Icon/icons';
import { Pagination } from '../Pagination';
import { Skeleton } from '../Skeleton';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './DataTable.messages';
import styles from './DataTable.module.css';
import { sortRows } from './sortRows';
import type { SortableValue, SortDirection } from './sortRows';

export type DataTableAlign = 'start' | 'end';
export type DataTableSelectionMode = 'none' | 'single' | 'multiple';

/** The current sort: a column key and a direction. `null` means "as given" (no sort). */
export interface DataTableSort {
  /** `key` of the sorted column. */
  key: string;
  /** `asc` or `desc`. */
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** Stable id of the column. Also the default property read from the row for display and sorting. */
  key: string;
  /** Header text. A string, because it names the column for assistive technology and for sorting. */
  label: string;
  /** CSS width of the column (`96px`, `20%`). Columns without a width share the remaining space equally. */
  width?: string;
  /**
   * CSS minimum width of the column (`120px`, `8rem`). The column never gets narrower: when the
   * container is too small the table area scrolls horizontally instead of squashing the column.
   * Without `width`, the column still shares the free space with the other flexible columns, but
   * never below this value. Use it for columns whose content breaks when squeezed (a row of
   * swatches, a badge, a mono code). Note that a table with a `minWidth` column scrolls inside
   * its own area, so with `stickyHeader` also set `maxHeight`.
   */
  minWidth?: string;
  /**
   * Whether text that does not fit is cut with an ellipsis (default `true`, one line) or wraps
   * onto more lines (`false`; the row grows). It applies to the header and the cells of the
   * column: with `false` a long mono header such as "Supplier name" can use two lines instead of
   * being cut to "SUPPL…". The full text stays in the DOM in both cases.
   */
  truncate?: boolean;
  /**
   * Hides the header text visually, for columns that hold only an icon or an action button.
   * `label` stays the accessible name of the column header. Default `false`.
   */
  hideLabel?: boolean;
  /** Alignment of header and cells: `start` (default) or `end` (numbers, amounts). Follows the writing direction. */
  align?: DataTableAlign;
  /** Mono type for codes, dates and numbers. */
  mono?: boolean;
  /** Secondary text color (`text-2`). */
  muted?: boolean;
  /**
   * Whether the header sorts the column. Default `true`: set `false` for columns that are not
   * a property of the row (actions, badges built from several fields).
   */
  sortable?: boolean;
  /** Value to sort by when it differs from `row[key]`, for example a number behind formatted text. */
  sortValue?: (row: T) => SortableValue;
  /** Custom cell content. Without it the cell shows `row[key]` as text. */
  render?: (row: T) => ReactNode;
  /**
   * Marks the column whose text names each row for assistive technology and completes the
   * selection checkbox name ("Select row Zeta Supplies"). Choose the most descriptive column.
   * Default: the first column.
   */
  isRowHeader?: boolean;
}

interface DataTableBaseProps<T> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'onChange' | 'defaultValue' | 'aria-label' | 'aria-labelledby'
> {
  /** Column definitions, in display order. */
  columns: readonly DataTableColumn<T>[];
  /**
   * The rows, in the order you want them shown until the user sorts. Lists are alphabetical by
   * default in this design system (AGENTS.md rule 5b): sort the rows before passing them, or
   * pass `defaultSort` for a text column. The table never reorders rows on its own.
   */
  rows: readonly T[];
  /** Property of a row that holds its unique id. Default `id`. The value is converted to a string. */
  rowKey?: keyof T & string;

  /** `none` (default), `single` or `multiple`. Selecting adds a checkbox column. */
  selectionMode?: DataTableSelectionMode;
  /** Selected row ids (controlled). Selection survives page changes; "select all" applies to the rows of the current page. */
  selectedKeys?: ReadonlySet<string>;
  /** Selected row ids when uncontrolled. */
  defaultSelectedKeys?: ReadonlySet<string>;
  /** Called with the new set of selected row ids. */
  onSelectionChange?: (keys: ReadonlySet<string>) => void;
  /** Content of the bulk action bar, shown while rows are selected: usually small `Button`s. `clear` empties the selection. */
  bulkActions?: (selectedKeys: ReadonlySet<string>, clear: () => void) => ReactNode;

  /** Current sort (controlled). `null` means no sort. */
  sort?: DataTableSort | null;
  /** Sort applied first when uncontrolled, for example `{ key: 'customer', direction: 'asc' }`. */
  defaultSort?: DataTableSort | null;
  /** Called when the user changes the sort. Header presses cycle ascending, descending, none. */
  onSortChange?: (sort: DataTableSort | null) => void;

  /** Rows per page; `false` shows all rows without pagination. Default `10`. Pagination appears only when there is more than one page. */
  pageSize?: number | false;
  /** Current page, 1-based (controlled). */
  page?: number;
  /** Page shown first when uncontrolled. Default `1`. The page returns to 1 when the sort or the set of rows changes. */
  defaultPage?: number;
  /** Called with the new page. */
  onPageChange?: (page: number) => void;

  /** Called when the user activates a row (click, or Enter on the focused row). Adds a pointer cursor and hover style. */
  onRowAction?: (row: T) => void;
  /** Id of the active row (for example the one open in a side sheet). It gets the raised background and the ink bar. */
  activeKey?: string;

  /** Replaces the rows with skeleton rows and announces "Loading rows". */
  isLoading?: boolean;
  /** Number of skeleton rows while loading. Default `5`. */
  loadingRowCount?: number;
  /** Content when there are no rows. Default: an `EmptyState` with built-in text. */
  emptyState?: ReactNode;

  /**
   * Keeps the space of the bulk action bar free while nothing is selected, so the table does not
   * jump down when the first row is selected (fixed positions). Turn off to let the table move
   * up. Default `true`; only applies when `selectionMode` is not `none`.
   */
  reserveBulkBarSpace?: boolean;

  /** Keeps the header visible while the body scrolls. Set `maxHeight` to scroll inside the table; without it the header sticks to the page scroll. */
  stickyHeader?: boolean;
  /** Maximum height of the table area before it scrolls (a number is px, or any CSS length). */
  maxHeight?: number | string;

  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

type DataTableNaming =
  | {
      /** Accessible name of the table. Required unless `aria-labelledby` is set. */
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      'aria-label'?: string;
      /** Id of the element that names the table (a visible heading). */
      'aria-labelledby': string;
    };

export type DataTableProps<T> = DataTableBaseProps<T> & DataTableNaming;

const EMPTY_SET: ReadonlySet<string> = new Set<string>();

function keyOf(row: object, rowKey: string): string {
  const value = (row as Record<string, unknown>)[rowKey];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function toLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${String(value)}px` : value;
}

/**
 * Sizes derived from the columns' `minWidth` values. Browsers ignore `min-width` on cells in a
 * fixed table layout, so the table itself gets a minimum width: the sum of every column's own
 * minimum (fixed columns at `max(width, minWidth)`, flexible ones at their `minWidth`, or zero).
 * Each flexible column is then sized as its own minimum plus an equal share of what is left over
 * (`calc(min + (100% - tableMin) / flexibleCount)`, see the stylesheet), so a column never gets
 * less than its own minimum and the widths add up to the table width. `undefined` when no column
 * has a `minWidth` (layout unchanged).
 */
function tableSizes<T>(
  columns: readonly DataTableColumn<T>[],
  hasSelection: boolean,
): { minWidth: string; flexibleCount: number } | undefined {
  if (!columns.some((column) => column.minWidth !== undefined)) return undefined;
  const parts: string[] = [hasSelection ? 'var(--ds-data-table-selection-col-w)' : '0px'];
  let flexibleCount = 0;
  for (const column of columns) {
    if (column.width === undefined) {
      flexibleCount += 1;
      if (column.minWidth !== undefined) parts.push(column.minWidth);
    } else {
      parts.push(
        column.minWidth === undefined ? column.width : `max(${column.width}, ${column.minWidth})`,
      );
    }
  }
  return { minWidth: `calc(${parts.join(' + ')})`, flexibleCount };
}

/** Name of the first column whose `%` size cannot be part of the minimum width maths, if any. */
function percentColumnWithMinWidth<T>(columns: readonly DataTableColumn<T>[]): string | undefined {
  if (!columns.some((column) => column.minWidth !== undefined)) return undefined;
  const isPercent = (value: string | number | undefined) =>
    typeof value === 'string' && value.includes('%');
  const found = columns.find((column) => isPercent(column.width) || isPercent(column.minWidth));
  return found?.key;
}

function readValue(row: object, key: string): SortableValue {
  const value = (row as Record<string, unknown>)[key];
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
      return value;
    case 'object':
      return value instanceof Date ? value : null;
    default:
      return null;
  }
}

function readText(row: object, key: string): ReactNode {
  const value = (row as Record<string, unknown>)[key];
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return String(value);
  return null;
}

interface HeaderProps<T> {
  columns: readonly DataTableColumn<T>[];
  selectAllLabel: string;
  selectionLabel: string;
  /** Whether flexible columns are sized from their own `minWidth` (see `tableSizes`). */
  isMinSized: boolean;
}

function DataTableHeader<T>({
  columns,
  selectAllLabel,
  selectionLabel,
  isMinSized,
}: HeaderProps<T>) {
  const { selectionBehavior, selectionMode } = useTableOptions();
  const hasRowHeader = columns.some((column) => column.isRowHeader);
  return (
    <TableHeader className={classNames(styles.header)}>
      {selectionBehavior === 'toggle' ? (
        <Column className={classNames(styles.selectionColumn)} aria-label={selectAllLabel}>
          {selectionMode === 'multiple' ? (
            <Checkbox slot="selection" aria-label={selectAllLabel} />
          ) : (
            <VisuallyHidden>{selectionLabel}</VisuallyHidden>
          )}
        </Column>
      ) : null}
      {columns.map((column, index) => (
        <Column
          key={column.key}
          id={column.key}
          textValue={column.label}
          allowsSorting={column.sortable !== false}
          isRowHeader={hasRowHeader ? column.isRowHeader === true : index === 0}
          className={classNames(styles.column)}
          data-align={column.align ?? 'start'}
          data-wrap={column.truncate === false || undefined}
          data-sized={column.width === undefined ? undefined : true}
          data-flex={isMinSized && column.width === undefined ? '' : undefined}
          {...(column.width === undefined && column.minWidth === undefined
            ? {}
            : {
                style: {
                  ...(column.width === undefined ? {} : { '--ds-data-table-col-w': column.width }),
                  ...(column.minWidth === undefined
                    ? {}
                    : { '--ds-data-table-col-min-w': column.minWidth }),
                } as CSSProperties,
              })}
        >
          {({ allowsSorting, sortDirection }) => (
            <span className={classNames(styles.columnContent)}>
              {column.hideLabel ? (
                <VisuallyHidden>{column.label}</VisuallyHidden>
              ) : (
                <span
                  className={classNames(styles.columnLabel)}
                  {...(column.truncate === false ? {} : { title: column.label })}
                >
                  {column.label}
                </span>
              )}
              {allowsSorting ? (
                <Icon
                  icon={
                    sortDirection === 'ascending'
                      ? ArrowUpIcon
                      : sortDirection === 'descending'
                        ? ArrowDownIcon
                        : ChevronsUpDownIcon
                  }
                  size="xs"
                  className={classNames(styles.sortIcon)}
                  data-sorted={sortDirection ? '' : undefined}
                />
              ) : null}
            </span>
          )}
        </Column>
      ))}
    </TableHeader>
  );
}

interface DataRowProps<T extends object> {
  id: string;
  row: T;
  columns: readonly DataTableColumn<T>[];
  textValue: string;
  selectRowLabel: string;
  isActive: boolean;
  isClickable: boolean;
}

function DataRow<T extends object>({
  id,
  row,
  columns,
  textValue,
  selectRowLabel,
  isActive,
  isClickable,
}: DataRowProps<T>) {
  const { selectionBehavior } = useTableOptions();
  return (
    <Row
      id={id}
      textValue={textValue}
      className={classNames(styles.row)}
      data-active={isActive || undefined}
      data-clickable={isClickable || undefined}
    >
      {selectionBehavior === 'toggle' ? (
        <Cell className={classNames(styles.selectionCell)}>
          <Checkbox slot="selection" aria-label={selectRowLabel} />
        </Cell>
      ) : null}
      {columns.map((column) => (
        <Cell
          key={column.key}
          className={classNames(styles.cell)}
          data-align={column.align ?? 'start'}
          data-wrap={column.truncate === false || undefined}
          data-mono={column.mono || undefined}
          data-muted={column.muted || undefined}
        >
          {column.render ? column.render(row) : readText(row, column.key)}
        </Cell>
      ))}
    </Row>
  );
}

function SkeletonRow<T>({
  id,
  columns,
  loadingLabel,
}: {
  id: string;
  columns: readonly DataTableColumn<T>[];
  loadingLabel: string;
}) {
  const { selectionBehavior } = useTableOptions();
  return (
    <Row id={id} isDisabled textValue="" className={classNames(styles.row)} data-skeleton="">
      {selectionBehavior === 'toggle' ? (
        <Cell className={classNames(styles.selectionCell)}>{null}</Cell>
      ) : null}
      {columns.map((column, index) => (
        <Cell
          key={column.key}
          className={classNames(styles.cell)}
          data-align={column.align ?? 'start'}
        >
          {index === 0 ? <VisuallyHidden>{loadingLabel}</VisuallyHidden> : null}
          <Skeleton width="60%" />
        </Cell>
      ))}
    </Row>
  );
}

/**
 * A data table with locale-aware sorting, row selection with a bulk action bar, client-side
 * pagination, loading and empty states. Built on React Aria `Table` (a real `<table>` with
 * grid keyboard navigation): the header cell of a sortable column is a press target with
 * `aria-sort`, and the selection checkboxes are labelled.
 *
 * Sorting cycles ascending, descending, none, and is stable: rows that compare equal keep the
 * order you passed. Strings compare with the active locale (accent- and case-insensitive,
 * natural number order), numbers numerically. The table never reorders rows on its own;
 * lists are alphabetical by default in this design system, so pass sorted rows or `defaultSort`.
 */
export function DataTable<T extends object>({
  columns,
  rows,
  rowKey = 'id' as keyof T & string,
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  bulkActions,
  sort: sortProp,
  defaultSort,
  onSortChange,
  pageSize = 10,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  onRowAction,
  activeKey,
  isLoading = false,
  loadingRowCount = 5,
  emptyState,
  reserveBulkBarSpace = true,
  stickyHeader = false,
  maxHeight,
  messages: overrides,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  ...rest
}: DataTableProps<T>) {
  const locale = useDSLocale();
  const t = useMessages('DataTable', messages, overrides);

  const [sort, setSort] = useControllableState<DataTableSort | null>({
    value: sortProp,
    defaultValue: defaultSort ?? null,
    onChange: onSortChange,
  });
  const [selected, setSelected] = useControllableState<ReadonlySet<string>>({
    value: selectedKeys,
    defaultValue: defaultSelectedKeys ?? EMPTY_SET,
    onChange: onSelectionChange,
  });
  const [rawPage, setPage] = useControllableState<number>({
    value: pageProp,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });

  const rowHeaderKey = (columns.find((column) => column.isRowHeader) ?? columns[0])?.key ?? '';
  const getKey = useCallback((row: T): string => keyOf(row, rowKey), [rowKey]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((candidate) => candidate.key === sort.key);
    if (!column) return rows;
    const getValue = column.sortValue ?? ((row: T) => readValue(row, column.key));
    return sortRows(rows, getValue, sort.direction, locale);
  }, [rows, columns, sort, locale]);

  const size = pageSize === false ? Math.max(1, sorted.length) : Math.max(1, Math.floor(pageSize));
  const pageCount = Math.max(1, Math.ceil(sorted.length / size));
  const page = Math.min(Math.max(1, rawPage), pageCount);
  const viewRows = useMemo(
    () => sorted.slice((page - 1) * size, page * size),
    [sorted, page, size],
  );
  const showPagination = pageSize !== false && !isLoading && sorted.length > size;

  // Back to the first page when the sort or the set of rows changes (not on the first render).
  const signature = `${sort ? `${sort.key}:${sort.direction}` : ''}|${rows.map(getKey).join('\u0000')}`;
  const previousSignature = useRef(signature);
  useEffect(() => {
    if (previousSignature.current === signature) return;
    previousSignature.current = signature;
    if (page !== 1) setPage(1);
    // Only a new signature may reset the page; `page` and `setPage` change on every page move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const rowByKey = useMemo(() => new Map(rows.map((row) => [getKey(row), row])), [rows, getKey]);
  // Ids that are no longer in `rows` are ignored, so the count never includes vanished rows.
  const effectiveSelected = useMemo(
    () => new Set([...selected].filter((key) => rowByKey.has(key))),
    [selected, rowByKey],
  );
  const selectedCount = effectiveSelected.size;
  const pageKeys = useMemo(() => new Set(viewRows.map(getKey)), [viewRows, getKey]);
  const racSelectedKeys = useMemo(() => new Set<Key>(effectiveSelected), [effectiveSelected]);

  const handleSelectionChange = (next: Selection) => {
    if (selectionMode === 'single') {
      setSelected(next === 'all' ? EMPTY_SET : new Set([...next].map(String)));
      return;
    }
    // Keep the selection of other pages; apply the change to the rows of this page.
    const merged = new Set([...effectiveSelected].filter((key) => !pageKeys.has(key)));
    if (next === 'all') {
      for (const key of pageKeys) merged.add(key);
    } else {
      for (const key of next) if (pageKeys.has(String(key))) merged.add(String(key));
    }
    setSelected(merged);
  };
  const clearSelection = () => {
    setSelected(EMPTY_SET);
  };

  const handleSortChange = (descriptor: SortDescriptor) => {
    const key = String(descriptor.column);
    // The third press on a column removes the sort (RAC only toggles ascending and descending).
    if (sort?.key === key && sort.direction === 'desc') {
      setSort(null);
      return;
    }
    setSort({ key, direction: descriptor.direction === 'descending' ? 'desc' : 'asc' });
  };
  const sortDescriptor: SortDescriptor | undefined = sort
    ? { column: sort.key, direction: sort.direction === 'asc' ? 'ascending' : 'descending' }
    : undefined;

  const hasSelection = selectionMode !== 'none';
  const countText = t.selectedCount(selectedCount, formatNumber(selectedCount, locale));
  const statusText = selectedCount > 0 ? countText : isLoading ? t.loading : '';

  const scrollStyle =
    maxHeight === undefined
      ? undefined
      : ({ '--ds-data-table-max-h': toLength(maxHeight) } as CSSProperties);
  // An empty table has nothing to protect from squashing: no minimum width, so the empty state
  // never scrolls sideways (the header stays visible, its labels are cut with an ellipsis).
  const isEmpty = !isLoading && viewRows.length === 0;
  const sizes = isEmpty ? undefined : tableSizes(columns, hasSelection);
  const warnedPercent = useRef(false);
  const percentColumn = percentColumnWithMinWidth(columns);
  useEffect(() => {
    if (percentColumn === undefined || warnedPercent.current || !isDev()) return;
    warnedPercent.current = true;
    console.warn(
      `[loui-ds] DataTable column "${percentColumn}" uses a percentage width or minWidth in a table with a minWidth column. Percentages are not part of the minimum width calculation, so the table can be narrower than its columns need. Use px or rem.`,
    );
  }, [percentColumn]);
  const tableStyle =
    sizes === undefined
      ? undefined
      : ({
          '--ds-data-table-min-w': sizes.minWidth,
          '--ds-data-table-flex-count': sizes.flexibleCount,
        } as CSSProperties);

  return (
    <div
      {...rest}
      className={classNames(styles.root, className)}
      data-sticky={stickyHeader || undefined}
      data-loading={isLoading || undefined}
      aria-busy={isLoading || undefined}
    >
      {hasSelection && selectedCount > 0 ? (
        <div role="group" aria-label={t.bulkActions} className={classNames(styles.bulkBar)}>
          <span className={classNames(styles.bulkCount)}>{countText}</span>
          <div className={classNames(styles.bulkActions)}>
            {bulkActions?.(effectiveSelected, clearSelection)}
            <Button variant="ghost" size="sm" onPress={clearSelection}>
              {t.clearSelection}
            </Button>
          </div>
        </div>
      ) : hasSelection && reserveBulkBarSpace ? (
        <div className={classNames(styles.bulkBar)} data-reserved aria-hidden="true" />
      ) : null}
      <div
        className={classNames(styles.scroll)}
        data-scrollable={maxHeight === undefined ? undefined : ''}
        data-min-sized={sizes === undefined ? undefined : ''}
        {...(scrollStyle ? { style: scrollStyle } : {})}
      >
        <Table
          {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
          {...(ariaLabelledBy === undefined ? {} : { 'aria-labelledby': ariaLabelledBy })}
          className={classNames(styles.table)}
          {...(tableStyle ? { style: tableStyle } : {})}
          selectionMode={selectionMode}
          selectionBehavior="toggle"
          selectedKeys={racSelectedKeys}
          onSelectionChange={handleSelectionChange}
          {...(sortDescriptor ? { sortDescriptor } : {})}
          onSortChange={handleSortChange}
          {...(onRowAction
            ? {
                onRowAction: (key: Key) => {
                  const row = rowByKey.get(String(key));
                  if (row) onRowAction(row);
                },
              }
            : {})}
        >
          <DataTableHeader
            columns={columns}
            selectAllLabel={t.selectAll}
            selectionLabel={t.selection}
            isMinSized={sizes !== undefined}
          />
          <TableBody
            renderEmptyState={() =>
              emptyState ?? (
                <EmptyState
                  compact
                  bordered={false}
                  headingLevel={3}
                  title={t.emptyTitle}
                  description={t.emptyDescription}
                />
              )
            }
          >
            {isLoading
              ? Array.from({ length: Math.max(1, loadingRowCount) }, (_, index) => (
                  <SkeletonRow
                    key={`skeleton-${String(index)}`}
                    id={`skeleton-${String(index)}`}
                    columns={columns}
                    loadingLabel={t.loading}
                  />
                ))
              : viewRows.map((row) => {
                  const id = getKey(row);
                  const headerValue = readText(row, rowHeaderKey);
                  const textValue =
                    typeof headerValue === 'string' || typeof headerValue === 'number'
                      ? String(headerValue)
                      : id;
                  return (
                    <DataRow
                      key={id}
                      id={id}
                      row={row}
                      columns={columns}
                      textValue={textValue}
                      selectRowLabel={t.selectRow}
                      isActive={activeKey === id}
                      isClickable={onRowAction !== undefined}
                    />
                  );
                })}
          </TableBody>
        </Table>
      </div>
      {showPagination ? (
        <Pagination
          page={page}
          total={sorted.length}
          pageSize={size}
          onChange={setPage}
          className={classNames(styles.pagination)}
        />
      ) : null}
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {statusText}
      </VisuallyHidden>
    </div>
  );
}
