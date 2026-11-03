# SearchInput

A search box: leading search icon, clear button, optional decorative shortcut hint and optional suggestions with accent-insensitive match highlighting. Built on React Aria `SearchField` (plain) or `ComboBox` (with `suggestions`). Task: CMP-INP-06.

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

## Differences from the handoff

- Suggestions use the combobox pattern with ARIA wiring (the handoff list had no roles), accent-insensitive highlighting (it matched by lowercase index) and an empty state from messages.
- Clear button, `Escape`, `role="search"` option, `onSubmit` and `onClear` are new. The shortcut is a decorative `Kbd` hint; registering it is the consumer's job (`useHotkey`).
- Uses RAC `ComboBox` rather than `Autocomplete` for suggestions: the floating list needs a popover and the ComboBox contract is already tested in `Combobox`.
