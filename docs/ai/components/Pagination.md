# Pagination

> Previous and next buttons, numbered page buttons with ellipses, and a text that says where
> you are ("11–20 of 42", or "Page 2 of 5" when only the page count is known).

The text is a polite live region, so a screen reader announces the new range when the page
changes. The current page button has `aria-current="page"`. The buttons that cannot be used
(previous on page 1) are disabled; when pressing a button disables it, focus moves to the
current page button so it is never lost.

Previous and next buttons, numbered page buttons with ellipses and a text that says where you are ("11–20 of 42"). The list logic is a tested pure function, `getPageItems`.

- Handoff source: `components/data/Pagination.jsx` (TODO `CMP-DAT-02`).

- Import: `import { Pagination } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Pagination/Pagination.tsx`
- Stories (Storybook title `Components/Pagination`): Default, WithRange, MiddlePage, LastPage, FewPages, SinglePage, NoResults, KeyboardNavigation, FocusStaysAfterLastPage, Controlled, Portuguese, NarrowContainer, RightToLeft, Focused

## Props

| Prop          | Type                                                                                                                                                                                                                         | Required | Default | Description                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `page`        | `number`                                                                                                                                                                                                                     |          |         | Current page, 1-based (controlled).                                                                          |
| `defaultPage` | `number`                                                                                                                                                                                                                     |          | `1`     | Page shown first (uncontrolled). Default `1`.                                                                |
| `onChange`    | `(page: number) => void`                                                                                                                                                                                                     |          |         | Called with the new page when the user picks one.                                                            |
| `pageCount`   | `number`                                                                                                                                                                                                                     |          |         | Number of pages. Optional when `total` and `pageSize` are given (then it is derived from them). Default `1`. |
| `total`       | `number`                                                                                                                                                                                                                     |          |         | Total number of items. With `pageSize` it enables the "1–10 of 42" range text.                               |
| `pageSize`    | `number`                                                                                                                                                                                                                     |          |         | Items per page.                                                                                              |
| `messages`    | `Partial<{ navLabel: string; previous: string; next: string; page: (page: string) => string; range: (from: string, to: string, total: string) => string; empty: string; pageOf: (page: string, count: string) => string; }>` |          |         | Per-instance overrides of the built-in messages.                                                             |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Pagination: { ... } }}>`.

| Key                                              | English default          | Notes                                                                                     |
| ------------------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------- |
| `navLabel`                                       | `Pagination`             | Accessible name of the pagination navigation landmark.                                    |
| `previous`                                       | `Previous page`          |                                                                                           |
| `next`                                           | `Next page`              |                                                                                           |
| `page(page: string)`                             | `Page {page}`            | Accessible name of a page button; the button shows only the number.                       |
| `range(from: string, to: string, total: string)` | `{from}–{to} of {total}` | Visible and announced range of items. All arguments are already formatted for the locale. |
| `empty`                                          | `No results`             | Visible and announced text when `total` is 0.                                             |
| `pageOf(page: string, count: string)`            | `Page {page} of {count}` | Visible and announced text when only the page count is known.                             |

## Design tokens used

`--ds-accent`, `--ds-control-h-sm`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-label`, `--ds-lh-label`, `--ds-line-strong`, `--ds-radius-md`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-space-5`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`

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

## Related components

- Instead, see Button: For endless feeds: use a "Load more" `Button`.
- Renders: IconButton
- Used by: DataTable
