# SegmentedControl

> A segmented control picks one value from a few options, like a radio group drawn as a
> bar. It is a value control: it does not own panels (use `Tabs` for that). Exactly one
> option is always selected.

Built on React Aria `ToggleButtonGroup` with single selection and no empty selection:
it is exposed as a radio group, with one tab stop and arrow-key navigation.

A bar of two to five options where exactly one is selected, like a radio group drawn as buttons. It is a value control: it changes how something is shown or filtered, it does not own panels. Built on React Aria `ToggleButtonGroup` with single selection and no empty selection.

- Handoff source: `components/forms/SegmentedControl.jsx` (TODO `CMP-FRM-09`).

- Import: `import { SegmentedControl } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/SegmentedControl/SegmentedControl.tsx`
- Stories (Storybook title `Components/SegmentedControl`): Default, Small, FullWidth, WithCounts, DisabledOption, DisabledGroup, KeyboardSelection, Controlled, LongLabels, PortugueseCounts, RightToLeft, Focused

## Props

| Prop              | Type                                | Required | Default | Description                                                                          |
| ----------------- | ----------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------ |
| `options`         | `readonly SegmentedControlOption[]` | yes      |         | The options, in display order. Two to five fit comfortably.                          |
| `aria-label`      | `string`                            |          |         | Accessible name of the group ("View"). Required: name this or use `aria-labelledby`. |
| `aria-labelledby` | `string`                            |          |         | Id of the element that names the group.                                              |
| `value`           | `string`                            |          |         | Selected option (controlled).                                                        |
| `defaultValue`    | `string`                            |          |         | Initially selected option (uncontrolled). Defaults to the first enabled option.      |
| `onChange`        | `(value: string) => void`           |          |         | Called with the new value when the user selects another option.                      |
| `size`            | `'sm' \| 'md'`                      |          | `'md'`  | Height of the segments: `sm` 24px, `md` 32px (default).                              |
| `fullWidth`       | `boolean`                           |          | `false` | Stretch to the container; the segments share the width equally.                      |
| `className`       | `string`                            |          |         |                                                                                      |
| `ref`             | `Ref<HTMLDivElement>`               |          |         | Ref to the group element.                                                            |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `DOMRenderProps` (react-aria-components): `render`
- From `SlotProps` (react-aria-components): `slot`
- From `ToggleGroupProps` (react-stately): `isDisabled`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-line-control`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-md`, `--ds-radius-sm`, `--ds-segmented-control-height-md`, `--ds-segmented-control-height-sm`, `--ds-segmented-control-padding`, `--ds-space-2`, `--ds-space-3`, `--ds-surface`, `--ds-surface-hover`, `--ds-text`, `--ds-text-2`, `--ds-weight-medium`, `--ds-weight-regular`

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

## Related components

- Instead, see Tabs: To switch between panels of content: use `Tabs`.
- Instead, see Select: For more than five options, or long labels: use `Select` or `RadioGroup`.
- Instead, see RadioGroup: For more than five options, or long labels: use `Select` or `RadioGroup`.
- Instead, see Switch: For on/off settings: use `Switch`.
- Renders: VisuallyHidden
