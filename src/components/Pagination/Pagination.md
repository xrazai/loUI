# Pagination

Status: experimental

Previous and next buttons, numbered page buttons with ellipses and a text that says where you are ("11–20 of 42"). The list logic is a tested pure function, `getPageItems`.

- Handoff source: `components/data/Pagination.jsx` (TODO `CMP-DAT-02`).

## When to use

- Below a table or list that is split into pages on the server or the client.

## When not to use

- For endless feeds: use a "Load more" `Button`.
- For a handful of items that fit on one screen.
- For moving through steps: use a stepper.

## Anatomy

```
div.root
  span[role=status, aria-live=polite]   "11–20 of 42"  or  "Page 2 of 5"
  nav[aria-label="Pagination"]
    ul
      li  IconButton  Previous page
      li  button      1    (aria-label "Page 1", aria-current="page" on the current one)
      li  …                (aria-hidden)
      li  IconButton  Next page
```

## Props

| Prop                   | Type                     | Default | Notes                                                                                   |
| ---------------------- | ------------------------ | ------- | --------------------------------------------------------------------------------------- |
| `page` / `defaultPage` | `number`                 | `1`     | Current page (1-based), controlled / uncontrolled. Clamped into range.                  |
| `onChange`             | `(page: number) => void` | none    | Called only when the page changes.                                                      |
| `pageCount`            | `number`                 | derived | Needed unless `total` and `pageSize` are given.                                         |
| `total`, `pageSize`    | `number`                 | none    | Together they enable the range text and derive `pageCount`.                             |
| `messages`             | partial catalog          | catalog | `navLabel`, `previous`, `next`, `page(n)`, `range(from, to, total)`, `empty`, `pageOf`. |

Exported helpers: `getPageItems(current, pageCount)`, `getPageCount(total, pageSize)`, `getItemRange(page, pageSize, total)`.

## Page list algorithm

Up to 7 pages every page is shown. Beyond that: the first page, the last page, the current page and its two neighbours; each gap becomes an ellipsis. A gap that would hide exactly one page shows that page instead (the handoff showed an ellipsis for it, which is wider than the page it hides). The page list never exceeds 7 slots.

## Accessibility

- `nav` named "Pagination" (from the catalog). Page buttons have `aria-label="Page 3"` and show only the number; the current one has `aria-current="page"`.
- The summary is a polite live region: when the page changes, a screen reader announces the new range ("11–20 of 42"). It is not announced on first render.
- Previous and next are disabled at the ends. When pressing one disables it, focus moves to the current page button, so focus is never lost to the page body.
- Ellipses are `aria-hidden` list items. In right-to-left locales the previous and next chevrons swap direction.
- Targets are 32px; page numbers are mono with tabular figures. Numbers are formatted for the locale ("1.248" in pt-BR).
- Keys: `Tab` to move; `Enter` and `Space` press.

## Content rules

- Do not repeat the total elsewhere. Keep the labels from the catalog unless your product uses another word for the items ("rows", "orders").

## Examples

```tsx
<Pagination total={42} pageSize={10} page={page} onChange={setPage} />

<Pagination pageCount={8} defaultPage={3} />
```

## Differences from the handoff

- Labels, range and the page text come from the message catalog (the handoff was hard-coded pt-BR); numbers use `Intl`.
- Buttons are React Aria / `IconButton` components; hover and disabled are CSS; the disabled opacity is the shared token.
- `onChange` is only called for real changes; `page` can be controlled; focus is kept when an edge button becomes disabled.
- Not included yet: page size selector (P2).
