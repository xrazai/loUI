# RankList

> An ordered list of items with a value, a bar relative to the largest value and an optional
> detail. Rows can be plain or buttons.

The list renders the items as given; pass `sort` and `limit` for a "top N". Put it in a
`Card` with `padding="none"`.

An ordered list of items with a value, a bar relative to the largest value and an optional detail. Rows can be plain or buttons. Meant to sit inside a `Card` without body padding.

- Import: `import { RankList } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/RankList/RankList.tsx`
- Stories (Storybook title `Components/RankList`): Default, SortedAndLimited, WithoutPositions, WithoutSwatchOrMeta, Actionable, Empty, LongLabels, BarsAlign, PortugueseBrazil

## Props

| Prop              | Type                           | Required | Default | Description                                                                                                                                                                                                                 |
| ----------------- | ------------------------------ | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`           | `readonly RankItem[]`          | yes      |         | The rows, rendered **in the order given** unless `sort` is set. This differs from the handoff, which always sorted descending and kept only six rows: sorting and truncating silently changes the data, so both are opt-in. |
| `aria-label`      | `string`                       |          |         | Accessible name of the list ("Top fabrics"). Optional: a list inside a titled `Card` is already named by it.                                                                                                                |
| `aria-labelledby` | `string`                       |          |         | Id of the element that names the list.                                                                                                                                                                                      |
| `sort`            | `'desc' \| 'asc'`              |          |         | Sorts by `value` (`desc` largest first, `asc` smallest first) before `limit` is applied. Ties keep their input order.                                                                                                       |
| `limit`           | `number`                       |          |         | Shows only the first `limit` rows (after `sort`). Default: all rows.                                                                                                                                                        |
| `format`          | `(value: number) => ReactNode` |          |         | Formats each value. Default: `formatNumber` with the active locale; use `formatCurrency` for money.                                                                                                                         |
| `showPosition`    | `boolean`                      |          | `true`  | Shows the position (1, 2, 3...) before each row. The list is ordered either way. Default `true`.                                                                                                                            |
| `emptyState`      | `ReactNode`                    |          |         | Content when there are no rows. Default: the "No data for this period" message.                                                                                                                                             |
| `messages`        | `Partial<{ empty: string; }>`  |          |         | Per-instance overrides of the built-in messages.                                                                                                                                                                            |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ RankList: { ... } }}>`.

| Key     | English default           | Notes                               |
| ------- | ------------------------- | ----------------------------------- |
| `empty` | `No data for this period` | Text shown when there are no items. |

## Design tokens used

`--ds-accent`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-lh-meta`, `--ds-lh-small`, `--ds-line`, `--ds-radius-pill`, `--ds-rank-list-bar-h`, `--ds-rank-list-padding-block`, `--ds-rank-list-padding-inline`, `--ds-rank-list-position-w`, `--ds-rank-list-share`, `--ds-space-2`, `--ds-space-3`, `--ds-space-6`, `--ds-surface-row-hover`, `--ds-text`, `--ds-text-2`, `--ds-weight-medium`

## When to use

- "Top fabrics", "best customers", "colors by sales": a short ranking with comparable values.

## When not to use

- Several columns, sorting by the user, selection: use `DataTable`.
- Parts of a whole: use `ProportionBar`.
- A trend over time: use `Chart`.

## Anatomy

```
div.root
  ol (role=list)
    li > div | button     grid, shared columns for all rows (subgrid)
      position            decorative number (aria-hidden); the ol already numbers the items
      label               optional swatch (aria-hidden) + text, truncated
      value               mono, formatted
      bar                 4px track + fill, relative to the largest value (aria-hidden)
      meta                mono detail, optional
```

## Props (key ones)

| Prop           | Type                   | Default | Notes                                                                       |
| -------------- | ---------------------- | ------- | --------------------------------------------------------------------------- |
| `items`        | `RankItem[]`           | -       | `id`, `label`, `value`, `meta`, `swatch`, `onAction`. Rendered **as given** |
| `sort`         | `asc \| desc`          |         | Opt-in sort by value (stable ties)                                          |
| `limit`        | `number`               |         | Opt-in truncation, applied after `sort`                                     |
| `format`       | `(value) => ReactNode` | `Intl`  | Use `formatCurrency` for money                                              |
| `showPosition` | `boolean`              | `true`  | Numbers 1, 2, 3 of the rows shown                                           |
| `emptyState`   | `ReactNode`            |         | Default: "No data for this period" (messages)                               |
| `aria-label`   | `string`               |         | Optional name of the list                                                   |
| `messages`     | `Partial<messages>`    |         | `empty`                                                                     |

## Accessibility

- A real ordered list (`ol`, explicit `role="list"` so Safari keeps the semantics with `list-style: none`).
- Rows with `onAction` are `<button>`s (React Aria `Button`): Tab, Enter, Space. Their name is the label followed by the value; position, bar and swatch are hidden from assistive technology.
- The bar and swatch are decorative: the value (and `meta`) carry the information as text.
- Bars of all rows share one grid, so their lengths are comparable.
- Text colors: label `text`, meta `text-2` (stays above 4.5:1 on hover); focus is an inset accent outline (system color in forced colors).

## Content rules

- Labels are names, not sentences. Meta is short and mono: `12 units · 18%`.
- Use this for things (fabrics, colors, customers). Give customers an `onAction` that opens the profile.

## Example

```tsx
<Card padding="none" title="Top fabrics">
  <RankList
    sort="desc"
    limit={6}
    format={(v) => formatCurrency(v, 'USD', locale)}
    items={fabrics.map((f) => ({
      id: f.id,
      label: f.name,
      value: f.totalMinor,
      swatch: f.hex,
      meta: `${f.units} units · ${f.pct}`,
    }))}
  />
</Card>
```

## Related components

- Instead, see DataTable: Several columns, sorting by the user, selection: use `DataTable`.
- Instead, see ProportionBar: Parts of a whole: use `ProportionBar`.
- Instead, see Chart: A trend over time: use `Chart`.
- Renders: Swatch
