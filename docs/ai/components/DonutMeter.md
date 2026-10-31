# DonutMeter

> A circular meter for one proportion: how much of a whole is used, done or filled (storage
> used, goal reached, stock level). The percentage is printed in the center, formatted with
> `Intl` for the active locale. Built on React Aria `Meter` (`role="meter"` with
> `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`).

It needs an accessible name: a visible `label` (printed under the ring), `aria-label` or
`aria-labelledby`. For a task that makes progress use `Progress`; for a bar use `Meter`;
for one proportion among several use `ProportionBar`.

A circular meter for one proportion: how much of a whole is used, done or filled (storage used, goal reached, stock level). The percentage is printed in the center, formatted with `Intl` for the active locale. Built on React Aria `Meter` (`role="meter"`). It is a separate component from `Progress`/`Meter`, in its own folder, and does not change them.

- TODO `GAP-007`.

- Import: `import { DonutMeter } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/DonutMeter/DonutMeter.tsx`
- Stories (Storybook title `Components/DonutMeter`): Default, Small, Large, Neutral, Success, Warning, Danger, Empty, Full, CustomRange, CustomCenter, WithoutCenterValue, AriaLabelOnly, LongLabel, Portuguese, RightToLeft

## Props

| Prop              | Type                                                          | Required | Default    | Description                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tone`            | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` |          | `'accent'` | Color of the ring: `accent` (default), `neutral`, `success`, `warning` or `danger`. Color is never the only signal: the percentage is printed in the center and the label says what it is. |
| `size`            | `'sm' \| 'md' \| 'lg'`                                        |          | `'md'`     | Diameter token: `sm` 48px, `md` 72px (default), `lg` 96px.                                                                                                                                 |
| `showValue`       | `boolean`                                                     |          | `true`     | Prints the percentage in the center. On by default. Turn it off when the center is empty on purpose.                                                                                       |
| `centerLabel`     | `ReactNode`                                                   |          |            | Replaces the percentage in the center ("12" over "days"). Visual only: screen readers get `valueLabel` (or the percentage) as the value of the meter.                                      |
| `className`       | `string`                                                      |          |            |                                                                                                                                                                                            |
| `ref`             | `Ref<HTMLDivElement>`                                         |          |            | Ref to the meter element.                                                                                                                                                                  |
| `label`           | `ReactNode`                                                   |          |            | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                        |
| `aria-label`      | `string`                                                      |          |            | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                    |
| `aria-labelledby` | `string`                                                      |          |            | Id of the element that names the field.                                                                                                                                                    |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `DOMProps` (@react-types/shared): `id`
- From `ProgressBarBaseProps` (react-aria): `formatOptions`, `maxValue`, `minValue`, `value`, `valueLabel`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`
- `tone`: `neutral`, `accent`, `success`, `warning`, `danger`

## Design tokens used

`--ds-accent`, `--ds-danger`, `--ds-donut-meter-color`, `--ds-donut-meter-size-lg`, `--ds-donut-meter-size-md`, `--ds-donut-meter-size-sm`, `--ds-donut-meter-stroke-w`, `--ds-donut-meter-value`, `--ds-duration-progress`, `--ds-ease`, `--ds-font-mono`, `--ds-fs-heading`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-fs-num`, `--ds-lh-heading`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-lh-num`, `--ds-space-2`, `--ds-success`, `--ds-surface-hover`, `--ds-text`, `--ds-text-2`, `--ds-warning`, `--ds-weight-medium`

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

## Related components

- Instead, see Progress: Progress of a task that is running: use `Progress`.
- Instead, see Meter: A bar in a column or a row: use `Meter` (`Progress` module).
- Instead, see ProportionBar: Several parts of a whole: use `ProportionBar`.
- Instead, see Sparkline: A trend over time: use `Sparkline` or `Chart`.
- Instead, see Chart: A trend over time: use `Sparkline` or `Chart`.
