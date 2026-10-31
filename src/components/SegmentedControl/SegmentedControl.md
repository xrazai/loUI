# SegmentedControl

Status: experimental

A bar of two to five options where exactly one is selected, like a radio group drawn as buttons. It is a value control: it changes how something is shown or filtered, it does not own panels. Built on React Aria `ToggleButtonGroup` with single selection and no empty selection.

- Handoff source: `components/forms/SegmentedControl.jsx` (TODO `CMP-FRM-09`).

## When to use

- A view mode (List, Board, Calendar), a period (Day, Week, Month) or a small filter (All, Open, Closed).
- When the options are always visible and the change applies immediately.

## When not to use

- To switch between panels of content: use `Tabs`.
- For more than five options, or long labels: use `Select` or `RadioGroup`.
- For on/off settings: use `Switch`.

## Anatomy

```
div[role=radiogroup] aria-label        (bordered track)
  button[role=radio] aria-checked      (one per option)
    label
    count                              (optional, mono)
```

## Props

| Prop                             | Type                       | Default      | Notes                                                                      |
| -------------------------------- | -------------------------- | ------------ | -------------------------------------------------------------------------- |
| `options`                        | `SegmentedControlOption[]` | required     | `{ value, label, count?, countLabel?, isDisabled? }`.                      |
| `aria-label` / `aria-labelledby` | `string`                   | one required | Names the group ("View"). Enforced by the types.                           |
| `value` / `defaultValue`         | `string`                   | first option | Controlled / uncontrolled selection. Defaults to the first enabled option. |
| `onChange`                       | `(value: string) => void`  | none         | Called only when the selection changes.                                    |
| `size`                           | `'sm' \| 'md'`             | `'md'`       | Segment height: 24px (`sm`, the minimum target) or 32px (`md`).            |
| `fullWidth`                      | `boolean`                  | `false`      | Stretch to the container; segments share the width equally.                |
| `isDisabled`                     | `boolean`                  | `false`      | Disables every option.                                                     |

Counts are formatted for the active locale. `countLabel` is the text a screen reader hears after the label ("Open 12 open").

## Accessibility

- Semantics: `radiogroup` with `radio` buttons and `aria-checked`. It is deliberately not a `tablist`.
- Keyboard: one tab stop; `←` / `→` move focus between options, `Space` selects the focused option. React Aria does not wrap at the ends. Disabled options are skipped. The selection can never be empty.
- Selected state is shown by a raised background, a line and ink text, not by color alone. The track border uses `--ds-line-control` (3:1).
- The count uses `--ds-text-2`: `--ds-text-3` would fail 4.5:1 on the selected surface.
- Focus: accent border and ring. Forced colors: the selected segment border uses `Highlight`.

## Content rules

- Labels are one word or a short phrase in sentence case ("Open", "This week").
- Same-length labels look best; avoid mixing a count on some options only.

## Examples

```tsx
<SegmentedControl
  aria-label="View"
  options={[
    { value: 'list', label: 'List' },
    { value: 'board', label: 'Board' },
  ]}
  value={view}
  onChange={setView}
/>

<SegmentedControl
  aria-label="Order status"
  size="sm"
  options={[
    { value: 'all', label: 'All', count: 1248 },
    { value: 'open', label: 'Open', count: 12, countLabel: '12 open' },
  ]}
/>
```

## Differences from the handoff

- `role="tablist"` / `tab` is replaced by `radiogroup` / `radio`: the control sets a value, not a panel.
- Roving focus and keyboard behavior come from React Aria; the handoff had none.
- `onChange` receives the value, is not called when the value does not change, and the group needs an accessible name.
- Counts are localized and can have a text alternative. Small segments are 24px (handoff 26px), medium 32px; both are tokens (`--ds-segmented-control-*`).
- The track border is `--ds-line-control` instead of `--ds-line` to meet 3:1 for UI boundaries.
