# RankList

Status: experimental

An ordered list of items with a value, a bar relative to the largest value and an optional detail. Rows can be plain or buttons. Meant to sit inside a `Card` without body padding.

## When to use

- "Top products", "best customers", "colors by sales": a short ranking with comparable values.

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
- Use this for things (products, colors, customers). Give customers an `onAction` that opens the profile.

## Example

```tsx
<Card padding="none" title="Top products">
  <RankList
    sort="desc"
    limit={6}
    format={(v) => formatCurrency(v, 'USD', locale)}
    items={products.map((f) => ({
      id: f.id,
      label: f.name,
      value: f.totalMinor,
      swatch: f.hex,
      meta: `${f.units} units · ${f.pct}`,
    }))}
  />
</Card>
```

## Differences from the handoff

- **No silent sorting or truncation.** The handoff always sorted descending and kept six rows; here the items render as given, and `sort` / `limit` are opt-in props. Migrating: add `sort="desc" limit={6}`.
- An ordered list instead of `div`s; actionable rows are buttons instead of `div role="button"`; `it.onClick` is `onAction`.
- Empty text comes from messages (the Portuguese default is gone); `showPos` is `showPosition`.
- The swatch is the core `Swatch` (`decorative`, size `sm`); it takes a hex color.
- Bars align across rows (subgrid), values and positions use `Intl`.
