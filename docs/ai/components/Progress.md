# Progress

> A thin bar for a task that makes progress: determinate with a `value`, or indeterminate
> when the amount is unknown. Built on React Aria `ProgressBar` (`role="progressbar"`).
> For a measured quantity that is not a task (disk used, quota) use `Meter`.

A thin bar (4 px) with a label and a value in mono type. `Progress` shows the progress of a task, determinate or indeterminate (React Aria `ProgressBar`, `role="progressbar"`). `Meter` shows a quantity within a range (React Aria `Meter`, `role="meter"`) and shares the same look.

- Import: `import { Progress } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Progress/Progress.tsx`
- Stories (Storybook title `Components/Progress`): Default, WithoutLabel, ShowValue, Empty, Complete, Warning, Danger, Indeterminate, AllTones, AsMeter, RightToLeft

## Props

| Prop        | Type                                             | Required | Default    | Description                                                                                                                                                                                        |
| ----------- | ------------------------------------------------ | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`     | `ReactNode`                                      |          |            | Visible label, wired to the bar with `aria-labelledby`. Required unless you set `aria-label` or `aria-labelledby`: a bar without a name is an accessibility bug (React Aria warns in development). |
| `meta`      | `ReactNode`                                      |          |            | Text on the right of the label, in mono type: "6.2 / 10 GB". It is visual only. If it says more than the percentage, also pass `valueLabel` so screen readers hear the same thing.                 |
| `showValue` | `boolean`                                        |          |            | Shows the formatted percentage (`62%`, from `Intl` with the active locale) as `meta` when `meta` is not given.                                                                                     |
| `tone`      | `'accent' \| 'success' \| 'warning' \| 'danger'` |          | `'accent'` | Color of the fill. Color is never the only signal: pair it with a label or `meta`. Default `accent`.                                                                                               |
| `className` | `string`                                         |          |            |                                                                                                                                                                                                    |
| `ref`       | `Ref<HTMLDivElement>`                            |          |            |                                                                                                                                                                                                    |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `DOMProps` (@react-types/shared): `id`
- From `ProgressBarBaseProps` (react-aria): `formatOptions`, `maxValue`, `minValue`, `value`, `valueLabel`
- From `ProgressBarProps` (react-aria): `isIndeterminate`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `tone`: `accent`, `success`, `warning`, `danger`

## Design tokens used

`--ds-accent`, `--ds-danger`, `--ds-duration-progress`, `--ds-ease`, `--ds-font-mono`, `--ds-fs-label`, `--ds-lh-label`, `--ds-progress-height`, `--ds-progress-indeterminate-duration`, `--ds-progress-indeterminate-width`, `--ds-radius-pill`, `--ds-space-2`, `--ds-space-3`, `--ds-success`, `--ds-surface-hover`, `--ds-text-2`, `--ds-warning`

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

## Related components

- Instead, see Spinner: Waiting with no known structure and no label: use `Spinner`.
- Instead, see Skeleton: Content that is loading: use `Skeleton`.
- Used by: FileUpload
