# Legend

Status: experimental

A list of the series of a chart: swatch, name and, optionally, a value. With `interactive` each item is a toggle button that hides or shows its series, and the legend reports which ones are hidden so the chart can leave them out.

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
