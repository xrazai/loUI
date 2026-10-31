import { compareText } from '../../utils/text';

/** A value a column can be sorted by. `null`, `undefined` and `NaN` always sort last. */
export type SortableValue = string | number | boolean | Date | null | undefined;

export type SortDirection = 'asc' | 'desc';

function isMissing(value: SortableValue): value is null | undefined {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number') return Number.isNaN(value);
  if (value instanceof Date) return Number.isNaN(value.getTime());
  return false;
}

function toNumber(value: number | boolean | Date): number {
  if (value instanceof Date) return value.getTime();
  return Number(value);
}

/**
 * Compares two present values in ascending order. Numbers, booleans (false before true) and
 * dates compare numerically; strings compare with the locale collator (accent- and
 * case-insensitive, natural number order). Numeric values come before strings.
 */
export function compareValues(
  a: Exclude<SortableValue, null | undefined>,
  b: Exclude<SortableValue, null | undefined>,
  locale: string,
): number {
  const aText = typeof a === 'string';
  const bText = typeof b === 'string';
  if (aText && bText) return compareText(a, b, locale);
  if (aText) return 1;
  if (bText) return -1;
  return toNumber(a) - toNumber(b);
}

/**
 * Returns a new array sorted by `getValue(row)`. Stable in both directions: rows whose values
 * compare equal keep their input order (descending does not simply reverse the array). Rows
 * without a value are always placed last, whatever the direction.
 */
export function sortRows<T>(
  rows: readonly T[],
  getValue: (row: T) => SortableValue,
  direction: SortDirection,
  locale: string,
): T[] {
  const sign = direction === 'asc' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, value: getValue(row) }))
    .sort((a, b) => {
      const aMissing = isMissing(a.value);
      const bMissing = isMissing(b.value);
      if (aMissing || bMissing) {
        if (aMissing && bMissing) return a.index - b.index;
        return aMissing ? 1 : -1;
      }
      const result = compareValues(
        a.value as Exclude<SortableValue, null | undefined>,
        b.value as Exclude<SortableValue, null | undefined>,
        locale,
      );
      return result === 0 ? a.index - b.index : result * sign;
    })
    .map((entry) => entry.row);
}
