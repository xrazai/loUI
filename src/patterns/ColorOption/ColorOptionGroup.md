# ColorOptionGroup

Status: experimental

A named group of `ColorOption`s that shares one value: the list of chosen option ids. It adds the group name, helper text, an error linked with `aria-describedby`, per-option disabling and roving arrow-key navigation. Import it from `loui-ds/patterns`.

- Origin: TODO `GAP-026` (consumers hand-built `<Inline role="group">` and controlled `isSelected` per option).

## When to use

- Choose any number of colors from a list, with a visible group label, helper text and a validation error.
- Choose exactly one color with swatches: `selectionMode="single"`.

## When not to use

- A single color with no swatch: `ChoiceTiles` or `RadioGroup`.
- A single standalone toggle: use `ColorOption` alone.

## Anatomy

```
div
  label            (visible, optional; or aria-label / aria-labelledby)
  toolbar | radiogroup   (aria-describedby: description, error)
    ColorOption ...
  description
  ErrorText        (only while isInvalid)
```

## Props

| Prop                                       | Type                            | Default      | Notes                                                                                  |
| ------------------------------------------ | ------------------------------- | ------------ | -------------------------------------------------------------------------------------- |
| `label` / `aria-label` / `aria-labelledby` | `ReactNode` / `string`          | one required | Group name.                                                                            |
| `children`                                 | `ColorOption`s                  | required     | Each needs a unique `id`; that is its value in the group. Set `isDisabled` per option. |
| `value` / `defaultValue`                   | `string[]`                      | `[]`         | Ids of the chosen options (controlled / uncontrolled).                                 |
| `onChange`                                 | `(value: string[]) => void`     | none         | Called with all chosen ids.                                                            |
| `selectionMode`                            | `'multiple' \| 'single'`        | `'multiple'` | `single` makes a radio group.                                                          |
| `description`                              | `ReactNode`                     | none         | Helper text, linked with `aria-describedby`.                                           |
| `isInvalid` / `errorMessage`               | `boolean` / `FieldErrorMessage` | `false`      | The error shows while invalid and is linked with `aria-describedby`.                   |
| `isDisabled`                               | `boolean`                       | `false`      | Disables every option.                                                                 |
| `columns`                                  | `number`                        | `2`          | Maximum columns; collapses on narrow containers (`--ds-color-option-group-min-width`). |

## Accessibility

- Semantics follow React Aria `ToggleButtonGroup`: `role="toolbar"` of toggle buttons in `multiple` mode, `role="radiogroup"` of radios in `single` mode. Both are named by the label.
- One tab stop. `←` `→` move between enabled options and stop at the ends; `Space` and `Enter` choose the focused option; disabled options are skipped.
- The error text (`ErrorText`) and the description are linked with `aria-describedby` on the group. `aria-invalid` is not allowed on a toolbar, so the invalid state is carried by the error text and a danger border on the unselected options (never color alone). Move focus to the first option on submit so the error is read, or use `ErrorText announce` yourself for errors with no focus move.

## Content rules

- List options alphabetically by label (AGENTS.md section 5b); the group keeps the order you give.
- Error: say how to fix it ("Choose at least one color.").

## Examples

```tsx
<ColorOptionGroup
  label="Available colors"
  description="Customers choose from the colors you tick."
  value={colors}
  onChange={setColors}
  isInvalid={submitted && colors.length === 0}
  errorMessage="Choose at least one color."
>
  <ColorOption id="brick" color="#c0392b" label="Brick red" />
  <ColorOption id="green" color="#27ae60" label="Green" isDisabled />
  <ColorOption id="navy" color="#1f3a93" label="Navy" />
</ColorOptionGroup>
```
