# ToggleGroup

Status: experimental

A row (or column) of related `Toggle`s that share one value: the list of pressed `id`s. With the default `multiple` selection the toggles are independent (bold, italic, underline; a set of filters). With `single` selection at most one is pressed. Built on React Aria `ToggleButtonGroup`.

- TODO `GAP-005`.

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

## Props

| Prop                             | Type                         | Default          | Notes                                                       |
| -------------------------------- | ---------------------------- | ---------------- | ----------------------------------------------------------- |
| `aria-label` / `aria-labelledby` | `string`                     | one required     | Names the group ("Text formatting"). Enforced by the types. |
| `children`                       | `Toggle`s                    | required         | Each `Toggle` needs a unique `id`.                          |
| `selectionMode`                  | `'multiple' \| 'single'`     | `'multiple'`     | See the table above.                                        |
| `value` / `defaultValue`         | `readonly string[]`          | `[]`             | Controlled / uncontrolled list of pressed ids.              |
| `onChange`                       | `(value: string[]) => void`  | none             | Called with all pressed ids after each change.              |
| `disallowEmptySelection`         | `boolean`                    | `false`          | Keeps at least one toggle pressed.                          |
| `orientation`                    | `'horizontal' \| 'vertical'` | `'horizontal'`   | Layout and arrow keys.                                      |
| `variant` / `size`               | as `Toggle`                  | `secondary`/`md` | Defaults for the toggles; a toggle's own props win.         |
| `isDisabled`                     | `boolean`                    | `false`          | Disables every toggle.                                      |

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
