# ToggleGroup

> A row (or column) of related `Toggle`s that share one value: the list of pressed `id`s.

With the default `multiple` selection the toggles are independent (bold, italic, underline;
or a set of filters) and the group is a `toolbar`. With `single` selection it behaves like
a radio group that can also be empty.

`ToggleGroup` vs `SegmentedControl`: a `SegmentedControl` is one value of one setting (View:
List, Board), exactly one option is always selected. A `ToggleGroup` is a set of on/off
choices where none, one or several are on.

Built on React Aria `ToggleButtonGroup`: one tab stop, arrow keys move between toggles (they
stop at the ends), `Space` and `Enter` toggle the focused one.

A row (or column) of related `Toggle`s that share one value: the list of pressed `id`s. With the default `multiple` selection the toggles are independent (bold, italic, underline; a set of filters). With `single` selection at most one is pressed. Built on React Aria `ToggleButtonGroup`.

- TODO `GAP-005`.

- Import: `import { ToggleGroup } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/ToggleGroup/ToggleGroup.tsx`
- Stories (Storybook title `Components/ToggleGroup`): Default, Preselected, Ghost, Small, Large, Vertical, IconOnly, SingleSelection, DisabledToggle, DisabledGroup, KeyboardSelection, Controlled, Wrapping, RightToLeft, Focused

## Props

| Prop                     | Type                         | Required | Default        | Description                                                                                                                                                                                                                                                   |
| ------------------------ | ---------------------------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`               | `ReactNode`                  | yes      |                | The `Toggle` children. Each needs an `id` that is unique in the group.                                                                                                                                                                                        |
| `aria-label`             | `string`                     |          |                | Accessible name of the group ("Text formatting"). Required: name this or use `aria-labelledby`.                                                                                                                                                               |
| `aria-labelledby`        | `string`                     |          |                | Id of the element that names the group.                                                                                                                                                                                                                       |
| `selectionMode`          | `'single' \| 'multiple'`     |          | `'multiple'`   | `multiple` (default): any number of toggles can be pressed, independently (text formatting, filters); the group is a toolbar. `single`: at most one is pressed; the group is a radio group. To pick exactly one value of a setting prefer `SegmentedControl`. |
| `value`                  | `readonly string[]`          |          |                | The `id`s of the pressed toggles (controlled). Pair with `onChange`.                                                                                                                                                                                          |
| `defaultValue`           | `readonly string[]`          |          |                | The `id`s of the toggles that start pressed (uncontrolled).                                                                                                                                                                                                   |
| `onChange`               | `(value: string[]) => void`  |          |                | Called with the `id`s of all pressed toggles after the user presses or releases one.                                                                                                                                                                          |
| `disallowEmptySelection` | `boolean`                    |          |                | Keeps at least one toggle pressed. Pointless in `multiple` mode unless you want that rule.                                                                                                                                                                    |
| `orientation`            | `'horizontal' \| 'vertical'` |          | `'horizontal'` | Layout and arrow keys: `horizontal` (default, `←` `→`) or `vertical` (`↑` `↓`).                                                                                                                                                                               |
| `variant`                | `'secondary' \| 'ghost'`     |          |                | Visual style handed down to every `Toggle` that does not set its own.                                                                                                                                                                                         |
| `size`                   | `'sm' \| 'md' \| 'lg'`       |          |                | Size handed down to every `Toggle` that does not set its own.                                                                                                                                                                                                 |
| `className`              | `string`                     |          |                |                                                                                                                                                                                                                                                               |
| `ref`                    | `Ref<HTMLDivElement>`        |          |                | Ref to the group element.                                                                                                                                                                                                                                     |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `ToggleGroupProps` (react-stately): `isDisabled`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `variant`: `secondary`, `ghost`
- `size`: `sm`, `md`, `lg`

## Design tokens used

`--ds-space-2`

## ToggleGroup or SegmentedControl

|           | `SegmentedControl`                           | `ToggleGroup`                                                    |
| --------- | -------------------------------------------- | ---------------------------------------------------------------- |
| Meaning   | One value of one setting (View: List, Board) | Independent on/off choices (Bold, Italic; filters)               |
| Selection | Exactly one option, always                   | None, one or several (`multiple`), or none/one                   |
| Role      | `radiogroup` of `radio`                      | `toolbar` of `button[aria-pressed]` (`radiogroup` when `single`) |
| Value     | `string`                                     | `string[]`                                                       |
| Content   | `options` array with optional counts         | `Toggle` children, text or icon-only                             |

Rule of thumb: if choosing one option makes the others "not selected" and one must always be on, use `SegmentedControl`. If each choice can stand alone, use `ToggleGroup`. Use `single` here only when "nothing selected" is meaningful (for example an optional filter).

## When to use

- Text formatting (Bold, Italic), list markers, or a small set of filters that combine.

## When not to use

- A single on/off choice: use `Toggle`.
- Choosing one value of a setting: use `SegmentedControl`.
- A long list of filters: use `CheckboxGroup` or a `Select`/`Combobox` with multiple selection.

## Anatomy

```
div[role=toolbar] aria-label       (or role=radiogroup when single)
  button[aria-pressed]             (one `Toggle` per choice, each with an id)
```

## Accessibility

- Semantics: `multiple` is a `toolbar` (a group of buttons with `aria-pressed`); `single` is a `radiogroup` of `radio` buttons. The group needs an accessible name (enforced by the types).
- Keyboard: one tab stop; `←` / `→` (`↑` / `↓` when vertical) move focus and stop at the ends (React Aria does not wrap); `Space` and `Enter` press the focused toggle. Disabled toggles are skipped.
- Pressed state is shown by border, fill and ink text, not by color alone.
- Icon-only toggles need a `label`.

## Content rules

- Group name: a noun phrase ("Text formatting", "Filters"). Toggle labels: one word or a short phrase in sentence case.

## Examples

```tsx
<ToggleGroup aria-label="Text formatting" value={marks} onChange={setMarks}>
  <Toggle id="fav" icon={StarIcon} label="Favorite" />
  <Toggle id="pin" icon={StarIcon} label="Pinned" />
</ToggleGroup>

<ToggleGroup aria-label="Order filters" defaultValue={['mine']}>
  <Toggle id="mine">Only mine</Toggle>
  <Toggle id="late">Late</Toggle>
</ToggleGroup>
```

## Related components

- Instead, see Toggle: A single on/off choice: use `Toggle`.
- Instead, see SegmentedControl: Choosing one value of a setting: use `SegmentedControl`.
- Instead, see CheckboxGroup: A long list of filters: use `CheckboxGroup` or a `Select`/`Combobox` with multiple selection.
- Instead, see Select: A long list of filters: use `CheckboxGroup` or a `Select`/`Combobox` with multiple selection.
- Instead, see Combobox: A long list of filters: use `CheckboxGroup` or a `Select`/`Combobox` with multiple selection.
