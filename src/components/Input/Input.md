# Input

Single-line text field with a label, helper text and error text wired together. Built on React Aria `TextField` + `Input`; see [Field](../Field/Field.md) for the shared states, spacing and validation timing.

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

## Differences from the handoff

- Focus styling is CSS (`:focus-within`), not React state, and consumer `onFocus`/`onBlur` no longer break it (regression test).
- `hint` is `description`, `error` is `errorMessage`; the error is only shown for an invalid field.
- Ids are generated; `aria-invalid`, `aria-describedby`, `required` and `readOnly` are wired.
- Disabled uses the shared opacity and a dashed border; read-only is new.
- The handoff `style` / `inputStyle` escape hatches are replaced by `className` and `inputClassName`.
