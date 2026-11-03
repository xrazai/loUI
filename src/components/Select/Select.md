# Select

Single-choice dropdown: a button that opens a listbox in a popover. Built on React Aria `Select` (`Button`, `SelectValue`, `Popover`, `ListBox`). A hidden native `<select>` carries `name` and the value into form submission and autofill. Shared field behavior is in [Field](../Field/Field.md).

## When to use

- A choice from 4 or more options.

## When not to use

- 2 to 4 options that users compare: `RadioGroup` (or a segmented control).
- Typing to filter a long list: `ComboBox` (planned).
- Several selections: `CheckboxGroup`.

## Props (key ones)

| Prop                                            | Notes                                                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `label`, `description`, `errorMessage`          | As in `Input`.                                                                                      |
| `options`                                       | `SelectOption[]` (`value`, `label`, `isDisabled`) or groups `{ id, label, options }`, mixed freely. |
| `value` / `defaultValue` / `onChange(value)`    | The selected option `value`; `null` means nothing selected. `onChange` receives `string \| null`.   |
| `placeholder`                                   | Trigger text while empty. Default from messages: "Select an option" (pt-BR "Selecione uma opção").  |
| `size`                                          | `sm` 32px, `md` 40px (default), `lg` 48px.                                                          |
| `name`, `isRequired`, `isInvalid`, `isDisabled` | Standard. `name` is submitted through the hidden `<select>`.                                        |
| `popoverClassName`, `className`, `ref`          | Styling hooks; `ref` is the field root.                                                             |
| `messages`                                      | `placeholder`, `requiredMark`.                                                                      |

Option order is yours: the component never reorders. The product rule that lists are alphabetical by default applies to what you pass in: use `sortByText(options, (o) => o.label, locale)` from `loui-ds` (locale- and accent-aware) unless the order carries meaning (sizes, steps).

## Anatomy and styling

- Trigger: the same box as `Input` (`--ds-line-control` border, focus ring, no hover fill), with a chevron.
- Popover: raised surface, `--ds-shadow-overlay`, radius `lg`, layer `--ds-z-dropdown`, at least as wide as the trigger, scrolls above `--ds-select-popover-max-height`.
- Option: `--ds-item-h` (36px) tall, hover and keyboard focus use `--ds-surface-hover`, the selected option shows a check (`Icon`), disabled options use the shared opacity.
- Section captions are mono, uppercase by CSS, in `--ds-text-2` (`--ds-text-3` fails contrast on the raised surface).

## Accessibility and keyboard

| Key                                      | Behavior                                                       |
| ---------------------------------------- | -------------------------------------------------------------- |
| `Enter`, `Space`, `ArrowDown`, `ArrowUp` | Open the list and focus the selected (or first/last) option    |
| `ArrowDown` / `ArrowUp`                  | Next / previous enabled option                                 |
| `Home` / `End`                           | First / last option                                            |
| Letters                                  | Typeahead: focus the option starting with what you type        |
| `Enter` / `Space`                        | Select the focused option, close, focus returns to the trigger |
| `Escape`                                 | Close without changing; focus returns to the trigger           |
| Typing on the closed trigger             | Selects by prefix without opening                              |

The trigger is a `button` with `aria-haspopup="listbox"`, named by the label and described by the description and error. Options are `role="option"` with `aria-selected`; sections are `role="group"` named by their caption; disabled options have `aria-disabled`.

## Example

```tsx
<Select
  label="Region"
  name="region"
  options={[
    { value: 'eu', label: 'EU: Frankfurt' },
    { value: 'us', label: 'US: Virginia' },
  ]}
  isRequired
  errorMessage="Choose a region."
/>
```

## Differences from the handoff

- A custom accessible listbox replaces the native `<select>` (ADR-0001), with a hidden native select kept for forms and autofill. This resolves the "native or custom" question of CMP-FRM-05.
- Label association, description, error, `aria-invalid`, required, placeholder and groups are new; handoff `onChange(value, event)` is `onChange(value)`.
- No inline chevron data URI; the chevron is an `Icon` using the icon set.
- Focus styling is CSS and survives consumer `onFocus`/`onBlur`.
