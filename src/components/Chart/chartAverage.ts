/**
 * The arithmetic mean of chart values, for an `average` reference line:
 * `referenceLines={[{ kind: 'average', label: 'Average', value: chartAverage(data) }]}`.
 *
 * Accepts numbers or chart data (`{ value }`). Non-finite entries are ignored; with nothing
 * left to average (or the sum overflows) the result is `0`. The result is never `NaN`.
 */
export function chartAverage(values: readonly (number | { readonly value: number })[]): number {
  let sum = 0;
  let count = 0;
  for (const entry of values) {
    const value = typeof entry === 'number' ? entry : entry.value;
    if (Number.isFinite(value)) {
      sum += value;
      count += 1;
    }
  }
  const mean = count === 0 ? 0 : sum / count;
  return Number.isFinite(mean) ? mean : 0;
}
