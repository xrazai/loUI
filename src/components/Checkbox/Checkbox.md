# Checkbox and CheckboxGroup

A checkbox with a native `<input type="checkbox">`, an 18px box and an optional description, plus a labelled group for several related checkboxes. Built on React Aria `CheckboxField` + `CheckboxButton` (the non-deprecated pair that supports a description and an error outside the label) and `CheckboxGroup`. Shared field behavior is in [Field](../Field/Field.md).

## When to use

- Independent yes/no choices, agreement ("I accept the terms"), selecting rows, picking several items from a list (`CheckboxGroup`).
- `isIndeterminate` for a parent that summarizes partly selected children.

## When not to use

- An on/off setting that applies at once: `Switch`.
- One choice from several: `RadioGroup`.

## Props (key ones)

| Prop                                                      | Notes                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `label`                                                   | Visible label. Without it pass `aria-label` or `aria-labelledby` (type error otherwise).         |
| `description`                                             | Secondary text under the label, linked by `aria-describedby`, not part of the name.              |
| `errorMessage`                                            | Error for a single checkbox (for example a required agreement). In a group, set it on the group. |
| `isSelected` / `defaultSelected` / `onChange(isSelected)` | React Aria naming for controlled and uncontrolled use.                                           |
| `isIndeterminate`                                         | Shows a minus; the native input is `indeterminate` until toggled.                                |
| `name`, `value`                                           | Submitted with the form while checked (`value` defaults to `on`).                                |
| `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly`     | Standard states.                                                                                 |
| `inputRef` / `ref`                                        | `inputRef` is the `<input>`, `ref` the field root.                                               |

`CheckboxGroup` takes `label`, `description`, `errorMessage`, `orientation` (`vertical` default, `horizontal`), `name`, `value`/`defaultValue`/`onChange(values: string[])`, `isRequired`, `isInvalid`, `isDisabled`. Each child `Checkbox` needs a `value`.

## Look

- 18px box, radius from `--ds-checkbox-radius` (5px), `--ds-line-control` border (3:1 or better in every state), accent fill with a `--ds-text-inverse` check when selected, minus when indeterminate.
- Hover brightens the border; it never changes the fill.
- The whole row is the click target and is at least 24px tall (WCAG 2.5.8).
- A disabled group dims once as a whole; disabled single checkboxes use `--ds-opacity-disabled`.

## Accessibility

- Space toggles the focused checkbox. Tab moves between checkboxes; each checkbox is a tab stop.
- Name comes from the label only; the description is `aria-describedby`.
- Group: `role="group"` named by the label, with the group description and error.
- Forced colors: borders and the check glyph use system colors; the glyph (check or minus) carries the state.

## Example

```tsx
<Checkbox label="I accept the terms" name="terms" isRequired errorMessage="Accept the terms to continue." />

<CheckboxGroup label="Notify me about" name="topics" defaultValue={['orders']}>
  <Checkbox value="orders" label="New orders" />
  <Checkbox value="stock" label="Low stock" description="When a product drops below its minimum." />
</CheckboxGroup>
```

## Differences from the handoff

- A native input replaces `div role="checkbox"`; `name` and `value` take part in forms.
- Accessible name is required by the types; the label row is the click target.
- New: indeterminate, group, required, invalid, read-only, error text.
- Radius is a component token (the handoff hard-coded 5px); the fill is accent as in the handoff.
- Controlled props follow React Aria (`isSelected`, `onChange`) instead of `checked`/`onChange(checked)`.
