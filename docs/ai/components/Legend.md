# Legend

> A list of the series of a chart: swatch, name and, optionally, a value. With `interactive`
> each item is a toggle button that hides or shows its series, and the legend reports the
> hidden ids so the chart can leave those series out (`StackedBar` does this itself; with
> `Chart` keep `hiddenIds` in state and filter your data).

The swatch is never the only identification: every item has its text label, a hatch pattern
tells apart series beyond the fourth, and a hidden series shows a hollow swatch and a struck
label in addition to the pressed state read by screen readers.

A list of the series of a chart: swatch, name and, optionally, a value. With `interactive` each item is a toggle button that hides or shows its series, and the legend reports which ones are hidden so the chart can leave them out.

- Import: `import { Legend } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Legend/Legend.tsx`
- Stories (Storybook title `Components/Legend`): Default, Vertical, NamesOnly, EightSeries, ExplicitColors, Interactive, InteractiveWithHiddenSeries, LongLabels, WithChart, PortugueseBrazil, RightToLeft

## Props

| Prop                | Type                                              | Required | Default        | Description                                                                                                                                                                               |
| ------------------- | ------------------------------------------------- | -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`             | `readonly LegendItem[]`                           | yes      |                | The series, in the same order as in the chart (the order sets the swatch of items without `color`).                                                                                       |
| `orientation`       | `'horizontal' \| 'vertical'`                      |          | `'horizontal'` | `horizontal` (default) wraps items in a row; `vertical` stacks them, one per line.                                                                                                        |
| `interactive`       | `boolean`                                         |          | `false`        | Turns each item into a toggle button (`aria-pressed`: pressed means the series is shown), so readers can hide series in the chart that consumes the legend. Off by default: a plain list. |
| `hiddenIds`         | `readonly string[]`                               |          |                | Controlled list of hidden series ids (interactive legends).                                                                                                                               |
| `defaultHiddenIds`  | `readonly string[]`                               |          | `[]`           | Initial hidden series ids when uncontrolled.                                                                                                                                              |
| `onHiddenIdsChange` | `(hiddenIds: string[]) => void`                   |          |                | Called with the new list of hidden ids whenever the user toggles an item.                                                                                                                 |
| `messages`          | `Partial<{ label: string; toggleHint: string; }>` |          |                | Per-instance overrides of the built-in messages.                                                                                                                                          |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Legend: { ... } }}>`.

| Key          | English default                      | Notes                                                                                                         |
| ------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `label`      | `Legend`                             | Accessible name of the legend list, unless the consumer passes `aria-label` or `aria-labelledby`.             |
| `toggleHint` | `Press a series to show or hide it.` | Accessible description of an interactive legend: what pressing an item does. Read after the name of the list. |

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-chart-series-1`, `--ds-chart-series-2`, `--ds-chart-series-3`, `--ds-chart-series-4`, `--ds-chart-series-hatch-size`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-fs-label`, `--ds-fs-small`, `--ds-legend-color`, `--ds-legend-gap`, `--ds-legend-swatch-size`, `--ds-lh-small`, `--ds-radius-sm`, `--ds-space-1`, `--ds-space-2`, `--ds-surface-hover`, `--ds-target-min`, `--ds-text`, `--ds-text-2`, `--ds-text-3`

## When to use

- Naming the series of a multi-series chart (`StackedBar` renders one itself).
- Letting readers hide series to compare the rest.
- Next to a `Chart` when you plot one series at a time and let the reader pick which.

## When not to use

- One series: name the chart instead.
- Choosing between views or filters unrelated to a chart: use `SegmentedControl`, `ToggleGroup` or `Tabs`.
- Showing the parts of a single bar with percentages: `ProportionBar` has its own legend.

## Anatomy

```
ul[aria-label="Legend"]
  li  swatch (aria-hidden) · name · value (optional)
  li  button[aria-pressed] (interactive)  swatch · name · value
VisuallyHidden  hint, linked with aria-describedby (interactive only)
```

## Props (key ones)

| Prop                | Type                              | Default        | Notes                                                 |
| ------------------- | --------------------------------- | -------------- | ----------------------------------------------------- |
| `items`             | `{ id, label, value?, color? }[]` | -              | Same order as the chart: the position sets the swatch |
| `orientation`       | `'horizontal' \| 'vertical'`      | `'horizontal'` | Row that wraps, or one item per line                  |
| `interactive`       | `boolean`                         | `false`        | Items become toggle buttons                           |
| `hiddenIds`         | `readonly string[]`               |                | Controlled hidden series                              |
| `defaultHiddenIds`  | `readonly string[]`               | `[]`           | Initial hidden series when uncontrolled               |
| `onHiddenIdsChange` | `(ids: string[]) => void`         |                | Called on every toggle                                |
| `messages`          | `Partial<messages>`               |                | `label` (list name), `toggleHint`                     |

## Telling series apart without color

The swatch follows the same neutral ramp as `StackedBar` and `ProportionBar` (`--ds-chart-series-1` to `-4`, which are `text`, `text-2`, `text-3` and `line-control`). From the fifth series on the ramp repeats with a hatch pattern, so up to eight series look different. Beyond that, pass `color` or group the tail into "Other". The text label always identifies the series; the swatch only helps sighted users.

A hidden series is shown with a hollow swatch and a struck-through label, in addition to `aria-pressed="false"`.

## Accessibility

- A real list named "Legend" (override with `aria-label` or `aria-labelledby`).
- Interactive items are native buttons (React Aria `ToggleButton`): `Tab` moves between them, `Space` and `Enter` toggle. `aria-pressed="true"` means the series is **shown**. The list is described by a hint ("Press a series to show or hide it.").
- Toggle buttons are at least 24 px tall (target size 2.5.8) and have a visible focus ring; forced colors use system colors for swatches and focus.
- The chart that consumes the legend must update visibly when a series is toggled. If it can end up with nothing to show, say so in text (`StackedBar` does).

## Content rules

- Series names are short nouns in sentence case ("Online", "Store").
- Values are formatted text; use `Intl` helpers for the locale.

## Example

```tsx
const [hidden, setHidden] = useState<string[]>([]);

<Legend
  interactive
  items={[
    { id: 'online', label: 'Online' },
    { id: 'store', label: 'Store' },
  ]}
  hiddenIds={hidden}
  onHiddenIdsChange={setHidden}
/>;
```

## Related components

- Instead, see SegmentedControl: Choosing between views or filters unrelated to a chart: use `SegmentedControl`, `ToggleGroup` or `Tabs`.
- Instead, see ToggleGroup: Choosing between views or filters unrelated to a chart: use `SegmentedControl`, `ToggleGroup` or `Tabs`.
- Instead, see Tabs: Choosing between views or filters unrelated to a chart: use `SegmentedControl`, `ToggleGroup` or `Tabs`.
- Instead, see ProportionBar: Showing the parts of a single bar with percentages: `ProportionBar` has its own legend.
- Renders: VisuallyHidden
- Used by: StackedBar
