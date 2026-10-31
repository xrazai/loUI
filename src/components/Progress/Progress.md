# Progress

Status: experimental

A thin bar (4 px) with a label and a value in mono type. `Progress` shows the progress of a task, determinate or indeterminate (React Aria `ProgressBar`, `role="progressbar"`). `Meter` shows a quantity within a range (React Aria `Meter`, `role="meter"`) and shares the same look.

## When to use

- `Progress`: an upload, an import, a multi-step job. Use indeterminate when the amount is unknown.
- `Meter`: disk used, quota consumed, a score. The value is a measurement, not a task that will finish.

## When not to use

- Waiting with no known structure and no label: use `Spinner`.
- Content that is loading: use `Skeleton`.

## Anatomy

```
div[role=progressbar|meter]
  div.header      Label (left) · meta (right, mono)
  div.track       4px, pill
    div.fill      width = percentage (or a sweeping segment when indeterminate)
```

## Props

| Prop                            | Type                                             | Default    | Notes                                                                                              |
| ------------------------------- | ------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------- |
| `value`                         | `number`                                         | `0`        | Clamped to the range                                                                               |
| `minValue`, `maxValue`          | `number`                                         | `0`, `100` |                                                                                                    |
| `isIndeterminate`               | `boolean` (`Progress` only)                      |            | No `aria-valuenow`; the fill sweeps                                                                |
| `label`                         | `ReactNode`                                      |            | Visible label, wired as the accessible name                                                        |
| `aria-label`, `aria-labelledby` | `string`                                         |            | Use when there is no visible label. One of the three is required (React Aria warns in development) |
| `meta`                          | `ReactNode`                                      |            | Visual text on the right ("6.2 / 10 GB")                                                           |
| `showValue`                     | `boolean`                                        | `false`    | Shows the formatted percentage as `meta`; hidden when indeterminate                                |
| `valueLabel`                    | `ReactNode`                                      |            | The spoken value (`aria-valuetext`). Pass it when `meta` says more than a percentage               |
| `formatOptions`                 | `Intl.NumberFormatOptions`                       | percent    | Formatting of the automatic value text                                                             |
| `tone`                          | `'accent' \| 'success' \| 'warning' \| 'danger'` | `'accent'` | Fill color                                                                                         |

Other React Aria props, `className` and `ref` go to the root.

## Accessibility

- The bar is named by the visible label (`aria-labelledby`) or `aria-label`; React Aria warns in development when a bar has neither.
- `aria-valuenow`, `aria-valuemin` and `aria-valuemax` are set, and `aria-valuetext` is the percentage formatted with `Intl` for the active locale ("62%", "62,5%" in pt-BR). If you show "6.2 / 10 GB", set `valueLabel="6.2 of 10 GB"` so screen readers hear the same thing.
- An indeterminate bar has no `aria-valuenow`, so assistive technology reports it as busy without a number.
- Progress does not announce changes by itself. For long tasks, announce milestones and completion in a live region (for example with a `Toast`).
- Color is not the only signal: the label and the value text carry the meaning. The fill is 4 px high but the track and fill are a graphic that keeps at least 3:1 against the surface; the track is a neutral surface step.
- **Reduced motion:** the width change has no transition and the indeterminate sweep becomes a static segment centered in the track. **Forced colors:** the track gets a border and the fill uses the text color.

## Content rules

- Labels are nouns or short phrases in sentence case ("Storage", "Importing orders").
- Put units and ratios in `meta`, in the formatted form of the active locale.

## Examples

```tsx
<Progress value={62} label="Storage" meta="6.2 / 10 GB" valueLabel="6.2 of 10 GB" />
<Progress isIndeterminate label="Importing orders" />
<Meter value={82} tone="warning" label="Quota" showValue />
```

## Differences from the handoff

- Built on React Aria: `role`, name, `aria-valuetext` and the label wiring come from it. The handoff `div role="progressbar"` had no name.
- Indeterminate mode, `valueLabel`, `showValue` and `Meter` are new.
- Width changes use the motion tokens and are disabled under reduced motion. Height and sweep settings are component tokens (`--ds-progress-*`).
- `Progress` no longer takes a `style` prop.
