# Input

> Single-line text field: label, control, description and error wired together
> (`for`, `aria-describedby`, `aria-invalid`), built on React Aria `TextField`.

Consumer `onFocus`, `onBlur`, `onKeyDown` etc. are composed with the internal handlers, so
they never break the focus ring (a defect of the handoff).

Single-line text field with a label, helper text and error text wired together. Built on React Aria `TextField` + `Input`; see [Field](../Field/Field.md) for the shared states, spacing and validation timing.

- Import: `import { Input } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Input/Input.tsx`
- Stories (Storybook title `Components/Input`): Default, WithDescription, Required, Invalid, Disabled, ReadOnly, Mono, Sizes, WithAdornments, LongLabel, Focused, FocusKeepsRingWithConsumerHandlers

## Props

| Prop              | Type                                 | Required | Default | Description                                                                                                                                                                                                                                             |
| ----------------- | ------------------------------------ | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`     | `ReactNode`                          |          |         | Helper text under the control (handoff `hint`). Linked with `aria-describedby`.                                                                                                                                                                         |
| `errorMessage`    | `FieldErrorMessage`                  |          |         | Error text (handoff `error`). Shown while the field is invalid _and_ the error is displayed: after a submit attempt with the default `validationBehavior="native"`, or at once when you control `isInvalid`. A function receives the validation result. |
| `placeholder`     | `string`                             |          |         | Text shown while the field is empty. Never a substitute for the label.                                                                                                                                                                                  |
| `mono`            | `boolean`                            |          | `false` | Geist Mono with tabular figures, for codes, identifiers and numbers.                                                                                                                                                                                    |
| `leading`         | `ReactNode`                          |          |         | Decoration before the text, usually an `Icon`. Keep it decorative or give it its own name.                                                                                                                                                              |
| `trailing`        | `ReactNode`                          |          |         | Content after the text: a unit, a shortcut hint (`Kbd`), or an `IconButton`.                                                                                                                                                                            |
| `size`            | `'sm' \| 'md' \| 'lg'`               |          | `'md'`  | Control height: `sm` 32px, `md` 40px (default), `lg` 48px.                                                                                                                                                                                              |
| `className`       | `string`                             |          |         | Class name for the field root (label, control and messages).                                                                                                                                                                                            |
| `inputClassName`  | `string`                             |          |         | Class name for the `<input>` element.                                                                                                                                                                                                                   |
| `inputRef`        | `Ref<HTMLInputElement>`              |          |         | Ref to the `<input>` element. The `ref` prop points at the field root.                                                                                                                                                                                  |
| `messages`        | `Partial<{ requiredMark: string; }>` |          |         | Message overrides for this instance (`requiredMark`).                                                                                                                                                                                                   |
| `ref`             | `Ref<HTMLDivElement>`                |          |         | Ref to the field root `<div>`.                                                                                                                                                                                                                          |
| `label`           | `ReactNode`                          |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                                                                                     |
| `aria-label`      | `string`                             |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                                                                                 |
| `aria-labelledby` | `string`                             |          |         | Id of the element that names the field.                                                                                                                                                                                                                 |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaTextFieldProps` (react-aria): `aria-activedescendant`, `aria-autocomplete`, `aria-controls`, `aria-haspopup`, `enterKeyHint`
- From `AriaValidationProps` (@react-types/shared): `aria-errormessage`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`, `name`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `SlotProps` (react-aria-components): `slot`
- From `TextFieldProps` (react-aria-components): `isInvalid`
- From `TextInputDOMEvents` (@react-types/shared): `onBeforeInput`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onCopy`, `onCut`, `onInput`, `onPaste`, `onSelect`
- From `TextInputDOMProps` (@react-types/shared): `autoComplete`, `autoCorrect`, `inputMode`, `maxLength`, `minLength`, `pattern`, `spellCheck`, `type`
- From `Validation` (@react-types/shared): `isRequired`, `validate`
- From `ValueBase` (@react-types/shared): `defaultValue`, `onChange`, `value`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Design tokens used

`--ds-field-control-padding-inline`, `--ds-font-mono`, `--ds-space-2`, `--ds-text-3`

## When to use

- Short free text, codes, emails, search terms, numbers typed as text.
- Use `mono` for codes and identifiers (`ORD-1048`).

## When not to use

- Several lines of text: `Textarea`.
- A choice from a list: `Select`, `RadioGroup`, `Checkbox`.
- Currency or quantity entry that needs masking: a dedicated field (`CurrencyInput`, planned).

## Anatomy

```
Label *                          required marker (aria-hidden)
[ leading  value / placeholder  trailing ]
Description
Error
```

## Props (key ones)

| Prop                                                                | Notes                                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `label`                                                             | Visible label. Without it you must pass `aria-label` or `aria-labelledby` (type error otherwise). |
| `description`                                                       | Helper text (handoff `hint`).                                                                     |
| `errorMessage`                                                      | Error text (handoff `error`), node or function of the validation result. Needs an invalid state.  |
| `isInvalid` / `isRequired` / `isReadOnly` / `isDisabled`            | Standard states. `isInvalid` shows the error at once.                                             |
| `size`                                                              | `sm` 32px, `md` 40px (default), `lg` 48px.                                                        |
| `mono`                                                              | Geist Mono with tabular figures.                                                                  |
| `leading` / `trailing`                                              | Adornments inside the box: an `Icon`, a unit, a `Kbd` hint, an `IconButton`.                      |
| `value` / `defaultValue` / `onChange(value)`                        | Controlled and uncontrolled, React Aria naming (`onChange` receives the string, not the event).   |
| `name`, `type`, `autoComplete`, `inputMode`, `maxLength`, `pattern` | Passed to the `<input>`; `name` and the value take part in form submission.                       |
| `validate`, `validationBehavior`                                    | See Field.md.                                                                                     |
| `inputRef` / `ref`                                                  | `inputRef` is the `<input>`, `ref` the field root.                                                |
| `messages`                                                          | `requiredMark` override.                                                                          |

All other props of React Aria `TextField` are accepted (`onFocus`, `onBlur`, `onKeyDown`, `autoFocus`, `form`, ...). They are composed with the internal handlers, never replacing them.

## Accessibility

- Native `<input>` named by `<label for>`; description and error are in `aria-describedby`; `aria-invalid` when invalid; `required` when required.
- Keyboard: standard text editing. `Enter` submits the surrounding form. Focus is visible as the accent border plus ring; in forced-colors mode it is a system outline.
- The placeholder never replaces the label.
- Click anywhere in the box (including padding) focuses the input. Clicking a decorative adornment does not; make interactive adornments real buttons with their own names.

## Content

- Label: sentence case noun ("Workspace name"). Error: how to fix it ("Enter a complete email address.").
- Description: one short sentence, no exclamation marks.

## Example

```tsx
<Input label="Workspace name" placeholder="e.g. Northwind" description="Visible to everyone." isRequired />
<Input label="Email" type="email" name="email" errorMessage="Enter a complete email address." isRequired />
<Input aria-label="Search orders" leading={<Icon icon={SearchIcon} />} trailing={<Kbd>/</Kbd>} />
```

## Related components

- Instead, see Textarea: Several lines of text: `Textarea`.
- Instead, see Select: A choice from a list: `Select`, `RadioGroup`, `Checkbox`.
- Instead, see RadioGroup: A choice from a list: `Select`, `RadioGroup`, `Checkbox`.
- Instead, see Checkbox: A choice from a list: `Select`, `RadioGroup`, `Checkbox`.
- Instead, see CurrencyInput: Currency or quantity entry that needs masking: a dedicated field (`CurrencyInput`, planned).
- Renders: FieldMessages, Label
- Used by: CurrencyInput
