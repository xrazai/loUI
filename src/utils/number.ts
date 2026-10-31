import { createCache } from './formatCache';

const cache = createCache<Intl.NumberFormat>();

/** Returns a cached `Intl.NumberFormat`. Internal. */
export function getNumberFormat(
  locale: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  return cache.get(
    `${locale}|${options ? JSON.stringify(options) : ''}`,
    () => new Intl.NumberFormat(locale, options),
  );
}

/** Options for `formatNumber`; the `style` is fixed by the function. */
export type FormatNumberOptions = Omit<
  Intl.NumberFormatOptions,
  'style' | 'currency' | 'currencyDisplay' | 'currencySign'
>;

/** Formats a decimal number for `locale` (`1234.5` becomes `1,234.5` in `en-US`). */
export function formatNumber(value: number, locale: string, options?: FormatNumberOptions): string {
  return getNumberFormat(locale, { ...options, style: 'decimal' }).format(value);
}

/**
 * Formats a ratio as a percentage: `0.256` becomes `26%` in `en-US`.
 * Pass `maximumFractionDigits` for more precision.
 */
export function formatPercent(
  ratio: number,
  locale: string,
  options?: Omit<FormatNumberOptions, 'unit' | 'unitDisplay'>,
): string {
  return getNumberFormat(locale, { ...options, style: 'percent' }).format(ratio);
}
