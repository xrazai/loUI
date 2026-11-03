# SearchInput

> A search box: leading search icon, clear button (and `Escape` clears), optional decorative
> shortcut hint, optional suggestions with accent-insensitive match highlighting. Built on React
> Aria `SearchField` (plain) or `ComboBox` (with `suggestions`).

`onSubmit(text)` fires on `Enter` when no suggestion is highlighted.

A search box: leading search icon, clear button, optional decorative shortcut hint and optional suggestions with accent-insensitive match highlighting. Built on React Aria `SearchField` (plain) or `ComboBox` (with `suggestions`). Task: CMP-INP-06.

- Import: `import { SearchInput } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/SearchInput/SearchInput.tsx`
- Stories (Storybook title `Components/SearchInput`): Default, ClearButton, WithShortcutHint, Landmark, WithSuggestions, AccentInsensitiveHighlight, NoSuggestions, Disabled, VisibleLabel, Sizes, FullWidthInRow

## Props

| Prop               | Type                                                                                              | Required | Default | Description                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`            | `string`                                                                                          |          |         | The text. Pair with `onChange`.                                                                                                                                                                                                                                                                                                                                   |
| `defaultValue`     | `string`                                                                                          |          |         | The initial text when uncontrolled.                                                                                                                                                                                                                                                                                                                               |
| `onChange`         | `((value: string) => void)`                                                                       |          |         | Called with the new text on every keystroke and when it is cleared.                                                                                                                                                                                                                                                                                               |
| `suggestions`      | `readonly (string \| SearchSuggestion)[]`                                                         |          |         | Suggestions shown under the box while typing, matched accent- and case-insensitively against `label` with the matching part highlighted. Strings are shorthand for `{ label }`. Without this prop the component is a plain search field (`role="searchbox"`); with it the input is a combobox (`role="combobox"`). Keep the array order: it is the order shown.   |
| `onSelect`         | `((suggestion: SearchSuggestion) => void)`                                                        |          |         | Called when a suggestion is chosen (click or `Enter` on the highlighted one).                                                                                                                                                                                                                                                                                     |
| `maxResults`       | `number`                                                                                          |          |         | Most suggestions shown. Default `6`.                                                                                                                                                                                                                                                                                                                              |
| `shortcut`         | `readonly string[]`                                                                               |          |         | A decorative hint of the global shortcut that focuses the search (`['Mod', 'K']`, `['/']`), drawn with `Kbd` while the box is empty. It does not register the shortcut: use `useHotkey` and focus `inputRef` yourself. Hidden from assistive technology, since the hint is only useful when the shortcut exists; announce it with `aria-keyshortcuts` if it does. |
| `placeholder`      | `string`                                                                                          |          |         | Text shown while the box is empty. Default from messages: "Search".                                                                                                                                                                                                                                                                                               |
| `landmark`         | `boolean`                                                                                         |          |         | Wraps the field in a `role="search"` landmark named by the label. Use it once per page for the main search of a page or site; not for filters inside a table.                                                                                                                                                                                                     |
| `size`             | `'sm' \| 'md' \| 'lg'`                                                                            |          |         | Control height: `sm` 32px, `md` 40px (default), `lg` 48px.                                                                                                                                                                                                                                                                                                        |
| `fullWidth`        | `boolean`                                                                                         |          |         | Take the free space of a flex row (an `Inline`): the field grows to fill it and can shrink below its content width. Off by default. In a block context the field already spans the width.                                                                                                                                                                         |
| `className`        | `string`                                                                                          |          |         | Class name for the field root.                                                                                                                                                                                                                                                                                                                                    |
| `popoverClassName` | `string`                                                                                          |          |         | Class name for the popover that holds the suggestions.                                                                                                                                                                                                                                                                                                            |
| `inputRef`         | `Ref<HTMLInputElement>`                                                                           |          |         | Ref to the `<input>` element. The `ref` prop points at the field root.                                                                                                                                                                                                                                                                                            |
| `messages`         | `Partial<{ clear: string; placeholder: string; noResults: string; } & { requiredMark: string; }>` |          |         | Message overrides for this instance: `clear`, `placeholder`, `noResults`.                                                                                                                                                                                                                                                                                         |
| `ref`              | `Ref<HTMLDivElement>`                                                                             |          |         | Ref to the field root `<div>`.                                                                                                                                                                                                                                                                                                                                    |
| `label`            | `ReactNode`                                                                                       |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                                                                                                                                                                                               |
| `aria-label`       | `string`                                                                                          |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                                                                                                                                                                                           |
| `aria-labelledby`  | `string`                                                                                          |          |         | Id of the element that names the field.                                                                                                                                                                                                                                                                                                                           |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaSearchFieldProps` (react-aria): `enterKeyHint`, `type`
- From `AriaTextFieldProps` (react-aria): `aria-activedescendant`, `aria-autocomplete`, `aria-controls`, `aria-haspopup`
- From `AriaValidationProps` (@react-types/shared): `aria-errormessage`
- From `DOMProps` (@react-types/shared): `id`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`, `name`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `SearchFieldProps` (react-stately): `onClear`, `onSubmit`
- From `SlotProps` (react-aria-components): `slot`
- From `TextInputDOMEvents` (@react-types/shared): `onBeforeInput`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onCopy`, `onCut`, `onInput`, `onPaste`
- From `TextInputDOMProps` (@react-types/shared): `autoComplete`, `autoCorrect`, `inputMode`, `maxLength`, `minLength`, `pattern`, `spellCheck`
- From `Validation` (@react-types/shared): `isInvalid`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ SearchInput: { ... } }}>`.

| Key           | English default | Notes                                                        |
| ------------- | --------------- | ------------------------------------------------------------ |
| `clear`       | `Clear search`  | Accessible name of the clear button.                         |
| `placeholder` | `Search`        | Placeholder when none is given.                              |
| `noResults`   | `No results`    | Shown in the suggestions list when nothing matches the text. |

## Design tokens used

`--ds-combobox-popover-max-height`, `--ds-field-control-padding-inline`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-small`, `--ds-item-h`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line-strong`, `--ds-radius-lg`, `--ds-radius-sm`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-space-6`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-target-min`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`, `--ds-z-dropdown`

## When to use

- Searching a list, a table or the app, with or without suggestions.

## When not to use

- Choosing a value from a list: `Combobox` (it keeps a selected value; SearchInput keeps free text).
- Filters with several fields: compose `Input`, `Select`.

## Modes

| Mode               | Element                                  | Notes                                                                                                                                                      |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plain (default)    | `input[type=search]`, `role="searchbox"` | Clear button; `Escape` clears; `onSubmit(text)` on `Enter`.                                                                                                |
| With `suggestions` | `role="combobox"`                        | List under the box while there is text. `Escape` closes the list, then clears. `Enter` on a highlighted suggestion calls `onSelect`; otherwise `onSubmit`. |

## Props (key ones)

| Prop                                                                                                  | Notes                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `aria-label` / `label` / `aria-labelledby`                                                            | One is required. Most searches use `aria-label` ("Search products") and no visible label.                                                                                      |
| `value` / `defaultValue` / `onChange(text)`                                                           | Controlled / uncontrolled text.                                                                                                                                                |
| `onSubmit(text)`, `onClear()`                                                                         | `Enter` and the clear action.                                                                                                                                                  |
| `suggestions`, `onSelect`, `maxResults`                                                               | Strings or `{ label, meta, data }`. Matched on `label` with `matchesSearch`, highlighted with `highlightMatch`, at most `maxResults` (default 6), in the order given.          |
| `shortcut`                                                                                            | Decorative hint such as `['Mod', 'K']`, drawn with `Kbd` while the box is empty. It registers nothing: use `useHotkey` and focus `inputRef`. Hidden from assistive technology. |
| `landmark`                                                                                            | Wraps the field in `role="search"` named by the label. Once per page.                                                                                                          |
| `size`, `placeholder`, `name`, `isDisabled`, `isReadOnly`, `autoFocus`, `inputRef`, `ref`, `messages` | `messages`: `clear`, `placeholder`, `noResults`.                                                                                                                               |
| `fullWidth`                                                                                           | Take the free space of a flex row such as `Inline` (`flex: 1 1 auto`, can shrink). Off by default.                                                                             |

## Accessibility and keyboard

| Key                     | Behavior                                                                    |
| ----------------------- | --------------------------------------------------------------------------- |
| Typing                  | Plain: updates the text. Suggestions: opens the list when there are matches |
| `ArrowDown` / `ArrowUp` | (Suggestions) move through the list; focus stays in the input               |
| `Enter`                 | Select the highlighted suggestion, else `onSubmit(text)`                    |
| `Escape`                | Plain: clear. Suggestions: close the list, then clear                       |

The clear button is "Clear search" (from messages), out of the tab order in suggestions mode, hidden while the box is empty. Highlighted parts are `<mark>` without a background: only weight and brightness change, so contrast holds.

## Content rules

`aria-label` names the scope ("Search products"), not the control. Placeholder "Search" is a hint, never the name.

## Example

```tsx
<SearchInput
  aria-label="Search products"
  value={query}
  onChange={setQuery}
  suggestions={products}
  onSelect={(product) => open(product.data)}
  shortcut={['/']}
/>
```

## Related components

- Instead, see Combobox: Choosing a value from a list: `Combobox` (it keeps a selected value; SearchInput keeps free text).
- Instead, see Input: Filters with several fields: compose `Input`, `Select`.
- Instead, see Select: Filters with several fields: compose `Input`, `Select`.
- Renders: Icon, Kbd
