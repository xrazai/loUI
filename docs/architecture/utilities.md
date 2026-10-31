# Locale-aware utilities and hooks

Pure functions in `src/utils/`, exported from the package root. They are node-testable, SSR-safe and take the locale explicitly: get it with `useDSLocale()` in components. **Never** build a currency, date, number or sort order by hand (AGENTS.md section 6, rule 5b).

## Utilities

| Function                                                    | Contract                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formatCurrency(minorUnits, currency, locale, options?)`    | Money is an **integer in minor units** (ADR-0006). Digits come from `Intl`, so JPY has 0 and KWD has 3. Exact for any safe integer. Non-integers throw `RangeError` in development, are rounded in production. Options: `currencyDisplay`, `signDisplay`, `notation`. |
| `parseCurrencyInput(text, currency, locale)`                | Digits-only typing model: every digit shifts in from the right, everything else is ignored (typing `1`,`2`,`3` gives `123`, shown as `$1.23`). Locale and full-width digits count. Empty is `0`. Max 15 digits.                                                       |
| `getCurrencyDigits(currency, locale)`                       | Minor-unit exponent.                                                                                                                                                                                                                                                  |
| `formatNumber`, `formatPercent(ratio, ...)`                 | `Intl.NumberFormat` with a cache.                                                                                                                                                                                                                                     |
| `formatDate(iso, locale, style)`                            | Input is `YYYY-MM-DD` (type `ISODate`), formatted in UTC so the day never shifts. Styles: `short`, `medium`, `long`, `full`, `monthDay`, `monthYear`.                                                                                                                 |
| `toISODate(date, { utc? })`                                 | `Date` to `YYYY-MM-DD` using the local day (or the UTC day).                                                                                                                                                                                                          |
| `daysBetween(isoA, isoB)`                                   | Whole days, positive if B is later. UTC math, DST-safe.                                                                                                                                                                                                               |
| `dueStatus(dueISO, todayISO)`                               | `{ days, tone }`: `< 0` danger, `0..7` warning, `> 7` neutral. **Text is not included**: render it from messages, together with the tone (color is never the only signal).                                                                                            |
| `formatRelativeDays(days, locale)`                          | `Intl.RelativeTimeFormat`, `numeric: 'auto'` (yesterday, today, tomorrow).                                                                                                                                                                                            |
| `compareText(a, b, locale)`, `createTextCollator(locale)`   | Accent- and case-insensitive, natural number order.                                                                                                                                                                                                                   |
| `sortByText(items, getText, locale)`                        | New array, stable. Use for every alphabetical list, group, column and select option.                                                                                                                                                                                  |
| `normalizeSearch`, `matchesSearch(text, query)`             | Accent- and case-insensitive substring match; empty query matches all.                                                                                                                                                                                                |
| `highlightMatch(text, query)`                               | `{ text, match }[]` segments that reassemble to the original text. Render `match` segments in `<mark>`.                                                                                                                                                               |
| `relativeLuminance`, `contrastRatio`, `readableTextOn(hex)` | WCAG 2.x. `readableTextOn` returns `'light'` or `'dark'` (the text tone with more contrast). Use it instead of any luma shortcut.                                                                                                                                     |
| `warnDeprecated(name, message)`                             | Dev-only, once per name.                                                                                                                                                                                                                                              |
| `ComponentStatus`                                           | `'experimental' \| 'stable' \| 'deprecated'`, for lifecycle metadata.                                                                                                                                                                                                 |

Invalid input is a programmer error: utilities throw `RangeError` with a `[loui-ds]` prefix in development and fall back quietly in production (documented per function), so bad data can never blank a screen.

Not provided on purpose: `formatPhone` (product-specific).

## Hooks (`src/hooks/`)

Only what react-aria / react-stately / RAC do not cover. Reuse theirs first (`useLocale`, `useFilter`, `useId`, `useControlledState`, overlay and focus management).

| Hook                                                      | Notes                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useControllableState({ value, defaultValue, onChange })` | `value` / `defaultValue` / `onValueChange` convention. Thin wrapper over react-stately's `useControlledState`.                                                                                                                                                                                     |
| `useMediaQuery(query, defaultValue?)`                     | `useSyncExternalStore`; SSR returns `defaultValue` (`false`). Prefer CSS for styling.                                                                                                                                                                                                              |
| `usePrefersReducedMotion()`                               | `prefers-reduced-motion: reduce`.                                                                                                                                                                                                                                                                  |
| `useHotkey(combo, handler, options?)`                     | One combo such as `Mod+K`, `Shift+/`, `Escape`. `Mod` is Command on macOS and Control elsewhere. Ignores editable fields (`allowInEditable`), IME composition, auto-repeat (`allowRepeat`) and already-prevented events. `scope` ref limits it to an element. A full shortcut registry is GAP-004. |

## Example: a list row

```tsx
const locale = useDSLocale();
const t = useMessages('InvoiceRow', messages);
const { days, tone } = dueStatus(invoice.dueISO, todayISO);

return (
  <li data-tone={tone}>
    <span>
      {highlightMatch(invoice.customer, query).map((s, i) =>
        s.match ? <mark key={i}>{s.text}</mark> : s.text,
      )}
    </span>
    <span>{formatCurrency(invoice.totalMinor, invoice.currency, locale)}</span>
    <span>{t.due(days)}</span>{' '}
    {/* "Due tomorrow" from messages, using formatRelativeDays(days, locale) */}
  </li>
);
```

`const sorted = sortByText(customers, (c) => c.name, locale)` for the list itself.

## Tests

Utility tests are `*.test.ts` (node project). Hook tests are `*.test.tsx` (browser project). In production-mode behavior tests use `vi.stubEnv('NODE_ENV', 'production')`.
