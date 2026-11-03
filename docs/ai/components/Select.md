# Select

> A single-choice dropdown built on React Aria `Select`: a button that opens a listbox in a
> popover. Keyboard: Enter, Space or the arrow keys open it; typing selects by prefix (typeahead);
> Escape closes it and returns focus to the trigger. A hidden native `<select>` carries `name` and
> the value into form submission and browser autofill.

Use it for 4 or more options; for 2 to 4 prefer `RadioGroup`.

Single-choice dropdown: a button that opens a listbox in a popover. Built on React Aria `Select` (`Button`, `SelectValue`, `Popover`, `ListBox`). A hidden native `<select>` carries `name` and the value into form submission and autofill. Shared field behavior is in [Field](../Field/Field.md).

- Import: `import { Select } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Select/Select.tsx`
- Stories (Storybook title `Components/Select`): Default, KeyboardAndTypeahead, EscapeClosesAndRestoresFocus, Open, WithSelection, WithDescription, Required, Invalid, Disabled, Sizes, DisabledOptions, Sections, LongLabels, FullWidthInRow

## Props

| Prop               | Type                                                            | Required | Default | Description                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`          | `readonly (SelectOption \| SelectGroup)[]`                      | yes      |         | The options, or groups of options. Keep the order you want users to see (see Select.md).                                                                                                  |
| `value`            | `string \| null`                                                |          |         | The selected `value`; `null` means nothing is selected. Pair with `onChange`.                                                                                                             |
| `defaultValue`     | `string \| null`                                                |          |         | The initially selected `value` when uncontrolled.                                                                                                                                         |
| `onChange`         | `((value: string \| null) => void)`                             |          |         | Called with the new `value`.                                                                                                                                                              |
| `description`      | `ReactNode`                                                     |          |         | Helper text under the control. Linked with `aria-describedby`.                                                                                                                            |
| `descriptionTone`  | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'`   |          |         | Tone of the description: `success`, `warning`, `danger` or `accent` for a live check such as "Matches" or "Over by $5". The text carries the meaning; colour only reinforces it.          |
| `errorMessage`     | `FieldErrorMessage`                                             |          |         | Error text, shown while the field is invalid and the error is displayed. See `Input`.                                                                                                     |
| `placeholder`      | `string`                                                        |          |         | Trigger text while nothing is selected. Default from messages: "Select an option".                                                                                                        |
| `size`             | `'sm' \| 'md' \| 'lg'`                                          |          | `'md'`  | Control height: `sm` 32px, `md` 40px (default), `lg` 48px.                                                                                                                                |
| `fullWidth`        | `boolean`                                                       |          | `false` | Take the free space of a flex row (an `Inline`): the field grows to fill it and can shrink below its content width. Off by default. In a block context the field already spans the width. |
| `className`        | `string`                                                        |          |         | Class name for the field root.                                                                                                                                                            |
| `popoverClassName` | `string`                                                        |          |         | Class name for the popover that holds the options.                                                                                                                                        |
| `messages`         | `Partial<{ placeholder: string; } & { requiredMark: string; }>` |          |         | Message overrides for this instance: `placeholder`, `requiredMark`.                                                                                                                       |
| `ref`              | `Ref<HTMLDivElement>`                                           |          |         | Ref to the field root `<div>`.                                                                                                                                                            |
| `label`            | `ReactNode`                                                     |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                       |
| `aria-label`       | `string`                                                        |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                   |
| `aria-labelledby`  | `string`                                                        |          |         | Id of the element that names the field.                                                                                                                                                   |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaSelectProps` (react-aria): `autoComplete`, `form`, `name`
- From `CollectionBase` (@react-types/shared): `disabledKeys`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `SelectProps` (react-stately): `allowsEmptyCollection`, `defaultOpen`, `isOpen`, `onOpenChange`, `shouldCloseOnSelect`
- From `SlotProps` (react-aria-components): `slot`
- From `Validation` (@react-types/shared): `isInvalid`, `isRequired`, `validate`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Select: { ... } }}>`.

| Key           | English default    | Notes                                           |
| ------------- | ------------------ | ----------------------------------------------- |
| `placeholder` | `Select an option` | Shown in the trigger while nothing is selected. |

## Design tokens used

`--ds-accent`, `--ds-field-control-padding-inline`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-small`, `--ds-item-h`, `--ds-lh-caption`, `--ds-lh-small`, `--ds-line`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-radius-sm`, `--ds-select-popover-max-height`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-space-2`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-tracking-caption`, `--ds-z-dropdown`

## When to use

- A choice from 4 or more options.

## When not to use

- 2 to 4 options that users compare: `RadioGroup` (or a segmented control).
- Typing to filter a long list: `ComboBox` (planned).
- Several selections: `CheckboxGroup`.

## Props (key ones)

| Prop                                                      | Notes                                                                                               |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `label`, `description`, `descriptionTone`, `errorMessage` | As in `Input`.                                                                                      |
| `options`                                                 | `SelectOption[]` (`value`, `label`, `isDisabled`) or groups `{ id, label, options }`, mixed freely. |
| `value` / `defaultValue` / `onChange(value)`              | The selected option `value`; `null` means nothing selected. `onChange` receives `string \| null`.   |
| `placeholder`                                             | Trigger text while empty. Default from messages: "Select an option" (pt-BR "Selecione uma opção").  |
| `size`                                                    | `sm` 32px, `md` 40px (default), `lg` 48px.                                                          |
| `fullWidth`                                               | Take the free space of a flex row such as `Inline` (`flex: 1 1 auto`, can shrink). Off by default.  |
| `name`, `isRequired`, `isInvalid`, `isDisabled`           | Standard. `name` is submitted through the hidden `<select>`.                                        |
| `popoverClassName`, `className`, `ref`                    | Styling hooks; `ref` is the field root.                                                             |
| `messages`                                                | `placeholder`, `requiredMark`.                                                                      |

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

## Related components

- Instead, see RadioGroup: 2 to 4 options that users compare: `RadioGroup` (or a segmented control).
- Instead, see CheckboxGroup: Several selections: `CheckboxGroup`.
- Renders: FieldMessages, Icon, Label
