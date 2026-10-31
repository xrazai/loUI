/** Result of `niceScale`: an evenly spaced axis that starts and ends on round numbers. */
export interface NiceScale {
  /** Lowest tick (a multiple of `step`, never above 0). */
  min: number;
  /** Highest tick (a multiple of `step`, never below 0). */
  max: number;
  /** Distance between ticks: 1, 2, 2.5, 5 or 10 times a power of ten. */
  step: number;
  /** Tick values from `min` to `max`, cleaned of floating point noise. */
  ticks: number[];
}

/** Candidate step multipliers with the largest raw residual each one is chosen for. */
const NICE_STEPS = [
  [1.5, 1],
  [2.25, 2],
  [3.5, 2.5],
  [7, 5],
] as const;
/** Hard cap on the number of ticks, whatever the input. */
const MAX_TICKS = 101;

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/** Removes float noise such as `0.30000000000000004` without changing real digits. */
function clean(value: number): number {
  return Number(value.toPrecision(12));
}

/**
 * Computes a "nice" value axis for data between `minValue` and `maxValue`.
 *
 * The axis always includes zero (bars grow from it), so an all-positive data set starts at 0,
 * an all-negative one ends at 0, and mixed data spans both sides. The step is a round number
 * (1, 2, 2.5, 5 or 10 times a power of ten) and the ends are multiples of it, aiming for about
 * `tickCount` ticks. It handles zero data (axis 0 to 1), tiny values (`0.00003`), huge values
 * and non-finite input (treated as 0).
 *
 * ```ts
 * niceScale(0, 42).ticks; // [0, 10, 20, 30, 40, 50]
 * niceScale(-3, 8).ticks; // [-5, -2.5, 0, 2.5, 5, 7.5, 10]
 * ```
 */
export function niceScale(minValue: number, maxValue: number, tickCount = 5): NiceScale {
  let low = Math.min(finite(minValue), finite(maxValue), 0);
  let high = Math.max(finite(minValue), finite(maxValue), 0);
  if (low === high) {
    // No data range at all (every value is 0): show a unit axis instead of a flat line.
    high = 1;
    low = 0;
  }
  const segments = Math.max(1, Math.floor(tickCount) - 1);
  const rawStep = (high - low) / segments;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  const factor = NICE_STEPS.find(([limit]) => residual < limit)?.[1] ?? 10;
  let step = clean(factor * magnitude);
  let min = clean(Math.floor(low / step) * step);
  let max = clean(Math.ceil(high / step) * step);
  // Guard against pathological ranges that would produce an enormous tick list.
  while ((max - min) / step > MAX_TICKS - 1) {
    step = clean(step * 2);
    min = clean(Math.floor(low / step) * step);
    max = clean(Math.ceil(high / step) * step);
  }
  const count = Math.round((max - min) / step);
  const ticks = Array.from({ length: count + 1 }, (_, index) => clean(min + index * step));
  return { min, max, step, ticks };
}
