# Combobox

A text input with a filtered list of options in a popover (ARIA combobox pattern). Built on React Aria `ComboBox` (`Input`, `Button`, `Popover`, `ListBox`). Shared field behavior is in [Field](../Field/Field.md). Task: CMP-INP-01.

## When to use

- Choosing from a long list (10 or more options): customers, products, cities.
- Choosing from a list or typing a new value (`allowsCustomValue`).
- Options loaded from a server as the user types (see Async).

## When not to use

- 2 to 4 options: `RadioGroup`. 4 to 9 options: `Select`.
- Searching the whole app or a table: `SearchInput`.
- Several selections: not supported yet (multiple selection is P3).

## Props (key ones)

| Prop                                                                                                                                   | Notes                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `label` / `aria-label` / `aria-labelledby`                                                                                             | One is required.                                                                                                                                                                                                                                                                                 |
| `options`                                                                                                                              | `ComboboxOption[]` (`value`, `label`, `description`, `meta`, `leading`, `isDisabled`) or groups `{ id, label, options }`.                                                                                                                                                                        |
| `value` / `defaultValue` / `onChange(value)`                                                                                           | The selected option `value`, `null` for none.                                                                                                                                                                                                                                                    |
| `inputValue` / `defaultInputValue` / `onInputChange`                                                                                   | The text in the box (React Aria props, passed through).                                                                                                                                                                                                                                          |
| `allowsCustomValue`                                                                                                                    | The typed text is a valid value; the form then receives the text.                                                                                                                                                                                                                                |
| `filter`                                                                                                                               | Default accent- and case-insensitive "contains" on the label (`matchesSearch`). A function `(label, query, option) => boolean` (the whole option is the third argument, so you can search a code in `value` or `meta`; two-argument functions keep working), or `false` for no client filtering. |
| `onCreate(text)`                                                                                                                       | Adds a `Create “text”` row when the typed text matches no option; see Create new below.                                                                                                                                                                                                          |
| `fullWidth`                                                                                                                            | In an `Inline` row the field takes the free space (`flex: 1 1 auto`, can shrink). Off by default; in a block context the field already spans the width.                                                                                                                                          |
| `selectFirstOnEnter`                                                                                                                   | Default `false`. `Enter` with no option highlighted selects the first enabled match (typing "tri" then `Enter` picks "Trimestral").                                                                                                                                                              |
| `isLoading`                                                                                                                            | Spinner in the box; "Loading" row when there are no options yet.                                                                                                                                                                                                                                 |
| `menuTrigger`                                                                                                                          | `input` (default), `focus` or `manual`.                                                                                                                                                                                                                                                          |
| `description`, `descriptionTone`, `errorMessage`, `size`, `placeholder`, `name`, `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly` | As in `Select`.                                                                                                                                                                                                                                                                                  |
| `messages`                                                                                                                             | `noResults`, `loading`, `showOptions`, `createOption`, `requiredMark`.                                                                                                                                                                                                                           |

Option order is yours (see `Select.md`): sort with `sortByText` unless the order carries meaning.

## Option leading (swatch, icon, avatar)

`leading` on an option puts a node before its label (a `Swatch`, an `Icon`, an `Avatar`). It is hidden from assistive technology: the option name stays its text (label, meta, description), so put anything that carries meaning in the text, never only in the node. While an option with `leading` is selected and the input shows its label, the same node appears at the start of the input (a colour picker shows the chosen colour); it disappears as soon as the text is edited.

```tsx
<Combobox
  label="Colour"
  options={[{ value: 'navy', label: 'Navy', leading: <Swatch color="#1f3a5f" decorative /> }]}
/>
```

## Create new (`onCreate`)

While the typed text is not blank and matches no option label (accent- and case-insensitive), the list ends with a `Create “text”` row (message `createOption`; `Criar “text”` in pt-BR). It is a normal option: `ArrowDown` reaches it, `Enter` or a click chooses it. Choosing it calls `onCreate` with the trimmed text and does **not** call `onChange`, and the typed text is never replaced by the row's text. In the handler add the option to `options` and set `value` to it; the input then shows its label.

```tsx
<Combobox
  label="Label"
  options={labels}
  value={value}
  onChange={setValue}
  onCreate={(name) => {
    const created = { value: slug(name), label: name };
    setLabels((list) => [...list, created]);
    setValue(created.value);
  }}
/>
```

Keep `value` controlled. If the handler selects nothing, the input empties when the list closes, as in any combobox without `allowsCustomValue`; with `allowsCustomValue` the typed text stays as the value (there the Create row is rarely needed). The row is not offered when the field is read-only. Creating is reversible: offer Undo with `useUndoable`. The full flow (create, select, toast with Undo) is the `create-on-the-fly` recipe (`docs/recipes/create-on-the-fly.md`).

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

`Enter` with nothing highlighted keeps the typed text and selects nothing, as in the WAI-ARIA editable combobox. Turn on `selectFirstOnEnter` for lookup fields where the typed text alone is never a valid value (it does nothing while the list is closed, empty or has only disabled options; a highlighted option always wins).

Hotkeys: A consumer `onKeyDown` does not hide keys from `useHotkeys(..., { allowInEditable: true })` shortcuts: a key keeps bubbling unless your handler called `event.preventDefault()` on it. Recipe: `Enter` confirms and `Escape` cancels (both with `preventDefault()`), every other key stays a hotkey. See `docs/architecture/hotkeys.md`.

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

## Differences from the handoff

- A real combobox: the search box is the field itself (the handoff had a button that opened a popover with an unlabelled search input), with ARIA wiring, `Escape` behavior and form submission of the option value.
- Filtering is accent-insensitive (the handoff used `toLowerCase`).
- `searchPlaceholder`, `emptyText` and `placeholder` strings became messages and `placeholder`; `meta` and `description` are kept/added; sections, custom values, loading, sizes and invalid/disabled/read-only states are new.
- The popover is limited to the viewport width: a full-width box on a narrow screen no longer overflows the page.
