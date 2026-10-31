# DonutMeter

Status: experimental

A circular meter for one proportion: how much of a whole is used, done or filled (storage used, goal reached, stock level). The percentage is printed in the center, formatted with `Intl` for the active locale. Built on React Aria `Meter` (`role="meter"`). It is a separate component from `Progress`/`Meter`, in its own folder, and does not change them.

- TODO `GAP-007`.

## When to use

- One share of a known total, as a compact visual in a card or a table cell.
- When the center number is the main message and the ring supports it.

## When not to use

- Progress of a task that is running: use `Progress`.
- A bar in a column or a row: use `Meter` (`Progress` module).
- Several parts of a whole: use `ProportionBar`.
- A trend over time: use `Sparkline` or `Chart`.

## Anatomy

```
div[role=meter] aria-valuenow/min/max/valuetext
  div.ring
    svg[aria-hidden]   (track circle + filled circle)
    span.center        (percentage or centerLabel)
  label                (optional, under the ring)
```

## Props

| Prop                    | Type                                                          | Default     | Notes                                                                                     |
| ----------------------- | ------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `value`                 | `number`                                                      | `0`         | Within `minValue` and `maxValue`; clamped.                                                |
| `minValue` / `maxValue` | `number`                                                      | `0` / `100` |                                                                                           |
| `label`                 | `ReactNode`                                                   | none        | Visible name under the ring. One of `label`, `aria-label`, `aria-labelledby` is required. |
| `valueLabel`            | `string`                                                      | percentage  | What screen readers hear ("6.2 of 10 GB"). The center still shows the percentage.         |
| `tone`                  | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | `'accent'`  | Color of the ring. Never the only signal.                                                 |
| `size`                  | `'sm' \| 'md' \| 'lg'`                                        | `'md'`      | Diameter 48 / 72 / 96px (`--ds-donut-meter-size-*`).                                      |
| `showValue`             | `boolean`                                                     | `true`      | Prints the percentage in the center.                                                      |
| `centerLabel`           | `ReactNode`                                                   | none        | Replaces the percentage in the center (visual only; pair with `valueLabel`).              |

## Accessibility

- `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` from React Aria. An accessible name is required (types and a development warning). The drawing is hidden from assistive technology; the center text is covered by `aria-valuetext`.
- Color is never the only signal: the percentage is printed in the center. The ring and track keep 3:1 against the surface in every tone.
- Motion: the ring animates 300ms; none under `prefers-reduced-motion`. Forced colors: track `GrayText`, ring `CanvasText`.
- Not interactive and not focusable.

## Content rules

- Label: what is measured, in sentence case ("Storage used"). The unit and total belong in `valueLabel` ("6.2 of 10 GB").
- Pair a tone change with text that says why ("Almost full").

## Examples

```tsx
<DonutMeter label="Storage used" value={62} />

<DonutMeter
  label="Storage"
  value={6.2}
  maxValue={10}
  valueLabel="6.2 of 10 GB"
  tone="warning"
  size="lg"
/>

<DonutMeter aria-label="Trial" value={40} centerLabel="12 d" valueLabel="12 days left" />
```
