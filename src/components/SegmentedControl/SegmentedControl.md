# SegmentedControl

Status: experimental

A bar of two to five options where exactly one is selected, like a radio group drawn as buttons. It is a value control: it changes how something is shown or filtered, it does not own panels. Built on React Aria `ToggleButtonGroup` with single selection and no empty selection.

- Handoff source: `components/forms/SegmentedControl.jsx` (TODO `CMP-FRM-09`).

## When to use

- A view mode (List, Board, Calendar), a period (Day, Week, Month) or a small filter (All, Open, Closed).
- When the options are always visible and the change applies immediately.

## When not to use

- To switch between panels of content: use `Tabs`.
- For more than five options, or labels that are whole sentences: use `Select` or `RadioGroup`. Long labels do not truncate (the bar scrolls sideways), but a scrolling bar hides options.
- For on/off settings: use `Switch`.

## Anatomy

```
div.field                              (only with label or description)
  span  label                          (names the group, aria-labelledby)
  div[role=radiogroup]                 (bordered track)
    button[role=radio] aria-checked    (one per option)
      label
      count                            (optional, mono)
  span  description                    (aria-describedby, optional tone)
```

Without `label` and `description` the track is rendered alone, named by `aria-label` or `aria-labelledby`.

## Props

| Prop                             | Type                       | Default      | Notes                                                                                                                                 |
| -------------------------------- | -------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                        | `SegmentedControlOption[]` | required     | `{ value, label, count?, countLabel?, isDisabled? }`.                                                                                 |
| `label`                          | `ReactNode`                |              | Visible label above the bar, styled like the label of `Input`. It names the group and wins over `aria-label`.                         |
| `aria-label` / `aria-labelledby` | `string`                   | one required | Names the group ("View") when there is no visible `label`. One of the three is required (the types enforce it).                       |
| `description`                    | `ReactNode`                |              | Helper text under the bar, linked with `aria-describedby`. It may contain `Kbd` (see Shortcut hints).                                 |
| `descriptionTone`                | `FieldMessageTone`         | `'neutral'`  | Tints the description (`success`, `warning`, `danger`, `accent`). The words carry the meaning. See Field.md.                          |
| `value` / `defaultValue`         | `string`                   | first option | Controlled / uncontrolled selection. Defaults to the first enabled option.                                                            |
| `onChange`                       | `(value: string) => void`  | none         | Called only when the selection changes.                                                                                               |
| `size`                           | `'sm' \| 'md'`             | `'md'`       | Segment height: 24px (`sm`, the minimum target) or 32px (`md`).                                                                       |
| `fullWidth`                      | `boolean`                  | `false`      | Stretch to the container; segments share the width equally. Off by default: the bar is as wide as its options, also inside a `Stack`. |
| `isDisabled`                     | `boolean`                  | `false`      | Disables every option.                                                                                                                |

Counts are formatted for the active locale. `countLabel` is the text a screen reader hears after the label ("Open 12 open").

`className` and `ref` always point at the bar (the `radiogroup`), also when a `label` or `description` wraps it in a plain `div`. Size the field by sizing the container.

## Width and overflow

- The bar is as wide as its options. It does not stretch in a `Stack` (which stretches its children) unless `fullWidth` is set.
- Labels never truncate or wrap. When the options are wider than the container, the bar is capped at the container width and scrolls sideways; a focused option scrolls into view, and the keyboard contract does not change. With `fullWidth` the segments share the width equally but never get narrower than their label.
- Keep labels short anyway: a scrolling bar hides options. Four short options fit in 440 px.

## Shortcut hints

`count` is text or a number and cannot show a shortcut, and an option has no slot for a `Kbd`: a hint inside an option would become part of its accessible name ("List Control 1"). Show the shortcuts once, in the `description`, where they are read as a description of the group, and register them with `useHotkey`:

```tsx
<SegmentedControl
  label="View"
  options={views}
  value={view}
  onChange={setView}
  description={
    <>
      Switch with <Kbd keys={['Alt', '1']} /> <Kbd keys={['Alt', '2']} />
    </>
  }
/>
```

## Accessibility

- Semantics: `radiogroup` with `radio` buttons and `aria-checked`. It is deliberately not a `tablist`.
- Keyboard: one tab stop; `←` / `→` move focus between options, `Space` selects the focused option. React Aria does not wrap at the ends. Disabled options are skipped. The selection can never be empty.
- The visible `label` is a `span` referenced by `aria-labelledby` (a `label` element would not name a group); the description is referenced by `aria-describedby`. A consumer `aria-describedby` is kept, in front of the description.
- A disabled control dims its label like the other fields.
- Selected state is shown by a raised background, a line and ink text, not by color alone. The track border uses `--ds-line-control` (3:1).
- The count uses `--ds-text-2`: `--ds-text-3` would fail 4.5:1 on the selected surface.
- Focus: accent border and ring. Forced colors: the selected segment border uses `Highlight`.

## Content rules

- Labels are one word or a short phrase in sentence case ("Open", "This week").
- Same-length labels look best; avoid mixing a count on some options only.
- With a `label`, name the setting, not the control ("Transaction type", not "Segmented control"); do not repeat it in the options.

## Examples

```tsx
<SegmentedControl
  label="Transaction type"
  description="Changes the fields below."
  options={types}
  value={type}
  onChange={setType}
/>

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
