# Combobox

> A text input with a filtered list of options in a popover (ARIA combobox pattern, built on
> React Aria `ComboBox`): the input has `role="combobox"` with `aria-expanded`,
> `aria-controls`, `aria-autocomplete="list"` and `aria-activedescendant`, so focus stays in
> the input while the arrow keys move through the list.

Typing filters the options accent- and case-insensitively. `Enter` selects the highlighted
option, `Escape` closes the list and then restores the selected text, `ArrowDown` / `ArrowUp`
open the list and move, `Home` / `End` move the caret in the input (React Aria keeps them for
text editing). With `allowsCustomValue` the typed text itself is a valid value.

Use it for long lists (10 or more options); for fewer prefer `Select`.

A text input with a filtered list of options in a popover (ARIA combobox pattern). Built on React Aria `ComboBox` (`Input`, `Button`, `Popover`, `ListBox`). Shared field behavior is in [Field](../Field/Field.md). Task: CMP-INP-01.

- Import: `import { Combobox } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Combobox/Combobox.tsx`
- Stories (Storybook title `Components/Combobox`): Default, Open, KeyboardContract, WithDescriptionAndMeta, WithSelection, Sections, DisabledOption, NoResults, CustomValue, Loading, AsyncFromServer, Required, Invalid, Disabled, ReadOnly, Sizes, LongText

## Props

| Prop               | Type                                                                                                | Required | Default | Description                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`          | `readonly (ComboboxOption \| ComboboxGroup)[]`                                                      | yes      |         | The options, or groups of options. Keep the order you want users to see (see Combobox.md).                                                                                                                                                                                                                                                                       |
| `value`            | `string \| null`                                                                                    |          |         | The selected option `value`; `null` means nothing is selected. Pair with `onChange`.                                                                                                                                                                                                                                                                             |
| `defaultValue`     | `string \| null`                                                                                    |          |         | The initially selected `value` when uncontrolled.                                                                                                                                                                                                                                                                                                                |
| `onChange`         | `((value: string \| null) => void)`                                                                 |          |         | Called with the selected `value`, or `null` when the selection is cleared.                                                                                                                                                                                                                                                                                       |
| `filter`           | `false \| ((label: string, query: string) => boolean)`                                              |          |         | How options are matched against the typed text. Default: accent- and case-insensitive "contains" on the label (`matchesSearch`), so `cafe` finds `Café`. Pass your own function, or `false` to show `options` as given: use it when the list is loaded from a server as the user types (listen to `onInputChange`, update `options`, set `isLoading` meanwhile). |
| `isLoading`        | `boolean`                                                                                           |          | `false` | Shows a spinner in the box and, when there are no options yet, a "Loading" row instead of "No results". The consumer owns the data: see `filter={false}` and `onInputChange`.                                                                                                                                                                                    |
| `description`      | `ReactNode`                                                                                         |          |         | Helper text under the control. Linked with `aria-describedby`.                                                                                                                                                                                                                                                                                                   |
| `errorMessage`     | `FieldErrorMessage`                                                                                 |          |         | Error text, shown while the field is invalid and the error is displayed. See `Input`.                                                                                                                                                                                                                                                                            |
| `placeholder`      | `string`                                                                                            |          |         | Text shown while the box is empty. Never a substitute for the label.                                                                                                                                                                                                                                                                                             |
| `size`             | `'sm' \| 'md' \| 'lg'`                                                                              |          | `'md'`  | Control height: `sm` 32px, `md` 40px (default), `lg` 48px.                                                                                                                                                                                                                                                                                                       |
| `className`        | `string`                                                                                            |          |         | Class name for the field root.                                                                                                                                                                                                                                                                                                                                   |
| `popoverClassName` | `string`                                                                                            |          |         | Class name for the popover that holds the options.                                                                                                                                                                                                                                                                                                               |
| `inputClassName`   | `string`                                                                                            |          |         | Class name for the `<input>` element.                                                                                                                                                                                                                                                                                                                            |
| `inputRef`         | `Ref<HTMLInputElement>`                                                                             |          |         | Ref to the `<input>` element. The `ref` prop points at the field root.                                                                                                                                                                                                                                                                                           |
| `messages`         | `Partial<{ noResults: string; loading: string; showOptions: string; } & { requiredMark: string; }>` |          |         | Message overrides for this instance: `noResults`, `loading`, `showOptions`, `requiredMark`.                                                                                                                                                                                                                                                                      |
| `ref`              | `Ref<HTMLDivElement>`                                                                               |          |         | Ref to the field root `<div>`.                                                                                                                                                                                                                                                                                                                                   |
| `label`            | `ReactNode`                                                                                         |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                                                                                                                                                                                              |
| `aria-label`       | `string`                                                                                            |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                                                                                                                                                                                          |
| `aria-labelledby`  | `string`                                                                                            |          |         | Id of the element that names the field.                                                                                                                                                                                                                                                                                                                          |

### Inherited props

- From `AriaComboBoxProps` (react-aria): `shouldFocusWrap`
- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `CollectionBase` (@react-types/shared): `disabledKeys`
- From `ComboBoxProps` (react-stately): `allowsCustomValue`, `defaultInputValue`, `inputValue`, `menuTrigger`, `onInputChange`, `onOpenChange`
- From `DOMProps` (@react-types/shared): `id`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`, `name`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `SlotProps` (react-aria-components): `slot`
- From `Validation` (@react-types/shared): `isInvalid`, `isRequired`, `validate`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Combobox: { ... } }}>`.

| Key           | English default | Notes                                                                                       |
| ------------- | --------------- | ------------------------------------------------------------------------------------------- |
| `noResults`   | `No results`    | Shown in the list when the typed text matches no option.                                    |
| `loading`     | `Loading`       | Shown in the list while options are loading and there are none yet; also names the spinner. |
| `showOptions` | `Show options`  | Accessible name of the button that opens the list.                                          |

## Design tokens used

`--ds-accent`, `--ds-combobox-popover-max-height`, `--ds-field-control-padding-inline`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-small`, `--ds-item-h`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-radius-sm`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-space-6`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-target-min`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-tracking-caption`, `--ds-z-dropdown`

## When to use

- Choosing from a long list (10 or more options): customers, products, cities.
- Choosing from a list or typing a new value (`allowsCustomValue`).
- Options loaded from a server as the user types (see Async).

## When not to use

- 2 to 4 options: `RadioGroup`. 4 to 9 options: `Select`.
- Searching the whole app or a table: `SearchInput`.
- Several selections: not supported yet (multiple selection is P3).

## Props (key ones)

| Prop                                                                                                                | Notes                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `label` / `aria-label` / `aria-labelledby`                                                                          | One is required.                                                                                                                |
| `options`                                                                                                           | `ComboboxOption[]` (`value`, `label`, `description`, `meta`, `isDisabled`) or groups `{ id, label, options }`.                  |
| `value` / `defaultValue` / `onChange(value)`                                                                        | The selected option `value`, `null` for none.                                                                                   |
| `inputValue` / `defaultInputValue` / `onInputChange`                                                                | The text in the box (React Aria props, passed through).                                                                         |
| `allowsCustomValue`                                                                                                 | The typed text is a valid value; the form then receives the text.                                                               |
| `filter`                                                                                                            | Default accent- and case-insensitive "contains" on the label (`matchesSearch`). A function, or `false` for no client filtering. |
| `isLoading`                                                                                                         | Spinner in the box; "Loading" row when there are no options yet.                                                                |
| `menuTrigger`                                                                                                       | `input` (default), `focus` or `manual`.                                                                                         |
| `description`, `errorMessage`, `size`, `placeholder`, `name`, `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly` | As in `Select`.                                                                                                                 |
| `messages`                                                                                                          | `noResults`, `loading`, `showOptions`, `requiredMark`.                                                                          |

Option order is yours (see `Select.md`): sort with `sortByText` unless the order carries meaning.

## Async options (documented pattern; a full async list is P2)

Set `filter={false}`, keep the query from `onInputChange`, fetch, and pass the result as `options` with `isLoading` meanwhile. The component never fetches and does not virtualize; for thousands of options filter on the server.

## Accessibility and keyboard

| Key                     | Behavior                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Typing                  | Opens the list and filters                                                                       |
| `ArrowDown` / `ArrowUp` | Open the list (first / last option) and move; focus stays in the input (`aria-activedescendant`) |
| `Enter`                 | Select the highlighted option and close                                                          |
| `Escape`                | Close the list; pressed again, restore the selected text (clear with `allowsCustomValue`)        |
| `Home` / `End`          | Move the caret in the input (React Aria keeps them for text editing, not for the list)           |
| `Tab`                   | Commit and leave                                                                                 |

The input has `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`. The chevron button ("Show options") is out of the tab order. While the list is open React Aria hides the rest of the page from assistive technology. An option's accessible name contains label, meta and description. The empty state is a single option-like row so screen readers announce it.

## Content rules

Label with the noun ("Customer"). Empty state text is "No results" (sentence case, no punctuation); localize with `messages`.

## Example

```tsx
<Combobox
  label="Customer"
  name="customer"
  options={sortByText(customers, (c) => c.label, locale)}
  onChange={setCustomerId}
/>
```

## Related components

- Instead, see RadioGroup: 2 to 4 options: `RadioGroup`. 4 to 9 options: `Select`.
- Instead, see Select: 2 to 4 options: `RadioGroup`. 4 to 9 options: `Select`.
- Instead, see SearchInput: Searching the whole app or a table: `SearchInput`.
- Renders: FieldMessages, Icon, Label, Spinner
