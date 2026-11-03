# SplitLayout

Status: experimental

A main column with a fixed-width side panel beside it. The side panel can stay in view while the main content scrolls, and it stacks under the main content when the layout is narrow.

## When to use

- An editor or a long form with a chat, a summary or a help panel that should stay visible: `sticky`.
- A list with a filter or preview panel next to it, inside a page.

## When not to use

- Equal columns: use `Grid`.
- The detail pane of a whole screen (beside the page content, with its own scroll and landmark): use the `detail` prop of `AppShell`.
- A panel that slides over the page: use `Sheet`.

## Anatomy

```
div (container)
  div (grid)
    div            main content (children)
    aside | div    side panel (aside), after the main content in the DOM
```

## Props

| Prop            | Type                              | Default | Notes                                                                                                              |
| --------------- | --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `children`      | `ReactNode`                       |         | The main content; it can shrink                                                                                    |
| `aside`         | `ReactNode`                       |         | The side panel. Without it only the main content renders                                                           |
| `asideLabel`    | `string`                          |         | Names the panel as an `aside` landmark. Without it the panel is a plain `div`                                      |
| `asideWidth`    | `'sm' \| 'md' \| 'lg'`            | `'md'`  | 280 / 360 / 480px (`--ds-split-layout-aside-w-*`); `md` is the `AppShell` detail width (`--ds-app-shell-detail-w`) |
| `asidePosition` | `'start' \| 'end'`                | `'end'` | Logical: flips in right-to-left text                                                                               |
| `gap`           | space key (`1` to `16`)           | `6`     | Space between main and aside                                                                                       |
| `sticky`        | `boolean`                         | `false` | The aside stays in view (16px from the top) and scrolls on its own if taller than the viewport                     |
| `collapseBelow` | `'sm' \| 'md' \| 'lg' \| 'never'` | `'md'`  | Layout width under which the aside stacks under the main content: 480 / 768 / 1024px                               |

Other `div` attributes and `ref` go to the root.

## Responsive behavior

- The layout measures its own width (a container query), so it behaves the same inside a frame, a preview or a test as on the page. The pixel values in the CSS repeat the `--ds-breakpoint-*` tokens; the test suite asserts that they agree.
- Collapsed: one column, main content first, the aside under it. Sticky is off while collapsed.
- `sticky` limits the aside to the viewport height (`100dvh`). Inside a scrolling region shorter than the viewport, such as the `main` of an `AppShell`, give the aside content its own bounded height, or accept that the aside scrolls to its end when the region ends.

## Accessibility

- The DOM order is main first, then aside: reading order and Tab order follow it, also with `asidePosition="start"` (only the drawing order changes). Put content people need first in `children`.
- `asideLabel` makes the panel a named `aside` (complementary) landmark. A layout primitive adds no unnamed landmark, so leave it off when the panel is not worth a landmark. Do not use it inside `AppShell` for the same content as `detail`.
- A sticky aside that is taller than the viewport scrolls on its own and becomes a keyboard stop (`tabindex="0"`) so the arrow keys scroll it; with nothing to scroll there is no extra tab stop. The scroll padding keeps focused controls clear of the toast region (WCAG 2.4.11).
- Reflow: nothing needs a minimum width; below the collapse width the layout is a single column (WCAG 1.4.10).

## Examples

```tsx
<SplitLayout aside={<ChatPanel … />} asideLabel="Assistant" sticky>
  <Stack gap={4}>
    <EditorSection … />
    <EditorSection … />
  </Stack>
</SplitLayout>

<SplitLayout asidePosition="start" asideWidth="sm" aside={<FilterList … />}>
  <OrdersTable … />
</SplitLayout>
```
