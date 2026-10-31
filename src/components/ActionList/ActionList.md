# ActionList

Status: experimental

A vertical list of records. Each row has an optional leading node, a title, an optional description, a mono meta value and an optional "more actions" menu. Built on React Aria `GridList`, so rows are reachable with the arrow keys and can run an action.

## When to use

- Short lists of things with a few actions each: files, saved filters, members, recent items.
- One main line of text per record, with secondary detail.

## When not to use

- Many comparable columns, sorting or selection: use `DataTable`.
- Navigation between pages: use `NavItem` or `Tabs`.
- Choosing options in a form: use `RadioGroup`, `CheckboxGroup` or `Select`.

## Anatomy

```
div[role=grid]            named by aria-label / aria-labelledby
  div[role=row]           one tab stop for the whole list; arrow keys move between rows
    span  leading         optional (Avatar, Icon)
    span  title / description
    span  meta            mono, text-2
    MoreActionsMenu       IconButton "More actions for {title}" + Menu (optional)
```

## Props (key ones)

| Prop         | Type                | Default | Notes                                                                                 |
| ------------ | ------------------- | ------- | ------------------------------------------------------------------------------------- |
| `items`      | `ActionListItem[]`  | -       | `id`, `title`, `textValue`, `description`, `meta`, `leading`, `actions`, `isDisabled` |
| `aria-label` | `string`            | -       | Required (or `aria-labelledby`)                                                       |
| `onAction`   | `(item) => void`    |         | Row click or Enter. Makes the row a press target                                      |
| `bordered`   | `boolean`           | `true`  | Border, surface and radius. Turn off inside a `Card`                                  |
| `emptyState` | `ReactNode`         |         | Default: compact `EmptyState` with built-in text                                      |
| `messages`   | `Partial<messages>` |         | `moreActions(title)`, `emptyTitle`, `emptyDescription`                                |

`actions` is a node: `MenuItem`, `MenuSection` and `MenuSeparator` elements from `Menu`. Put the handler on the item (`<MenuItem onAction={...}>`). Destructive items use `tone="danger"` and still ask for confirmation in a dialog.

The list renders `items` in the order given. Lists are alphabetical by default in this design system: pass them through `sortByText` first (exceptions: tasks by urgency, dated records newest first).

## Accessibility

- `GridList` gives `role="grid"` with `row` and `gridcell` roles; rows are not a `list`/`listitem` pair because they are focusable and actionable.
- Keyboard: `Tab` enters the list on one row (one tab stop); Arrow Up/Down, Home and End move between rows; Arrow Right moves from the row to its menu button (Arrow Left back); `Enter` on a row runs `onAction`; the menu button follows the Menu contract (`Enter`/`Space`/`Arrow Down` opens, `Escape` closes and focus returns to the button).
- Every menu button has its own name ("More actions for Price list 2026") so a screen reader user can tell them apart.
- Row actions never rely on color; the meta value is text. Disabled rows are dimmed and skipped.
- Known quirk: React Aria moves focus to the row after an overlay inside a row closes. The component hands focus back to the button that was pressed.

## Content rules

- Titles are the record name, not a sentence. Descriptions say who or when ("Updated by Ana").
- Menu items are verb + object ("Download file", "Delete file").

## Examples

```tsx
<ActionList
  aria-label="Files"
  items={sortByText(files, (f) => f.name, locale).map((file) => ({
    id: file.id,
    title: file.name,
    description: `Updated by ${file.author}`,
    meta: formatBytes(file.size),
    actions: (
      <>
        <MenuItem onAction={() => download(file)}>Download file</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger" onAction={() => askToDelete(file)}>
          Delete file
        </MenuItem>
      </>
    ),
  }))}
  onAction={(item) => openFile(item.id)}
/>
```

## Differences from the handoff

- Real list semantics and keyboard support (`GridList`) instead of clickable `div`s; rows can be activated with `Enter`.
- The `···` button is the shared `MoreActionsMenu` (label from messages, names the row, `Menu` keyboard model) instead of a hand-made popover.
- `actions` is a `MenuItem` node (composition) instead of an array of `{ label, danger, separator }`; `onItemClick` is `onAction`; `title`/`description`/`meta` accept nodes.
- Text uses `text-2` for descriptions (contrast stays above 4.5:1 on hover and raised surfaces).
- Empty state and disabled rows added. Drag handle is not included.
