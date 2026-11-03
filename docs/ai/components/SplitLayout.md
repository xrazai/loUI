# SplitLayout

> A main column with a fixed-width side panel beside it: an editor with a chat, a list with a
> summary. The side panel can stay in view while the main content scrolls, and stacks under the
> main content when the layout is narrow. Use `Grid` for equal columns, and the `AppShell`
> `detail` prop for the detail pane of a whole screen.

The main content comes first in the DOM (reading and Tab order); `asidePosition="start"` only
changes where it is drawn.

A main column with a fixed-width side panel beside it. The side panel can stay in view while the main content scrolls, and it stacks under the main content when the layout is narrow.

- Import: `import { SplitLayout } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/SplitLayout/SplitLayout.tsx`
- Stories (Storybook title `Layout/SplitLayout`): End, Start, SmallAside, LargeAside, WithoutLandmark, Sticky, CollapsedNarrowContainer, CollapseNever, RightToLeft

## Props

| Prop            | Type                                                                                                           | Required | Default | Description                                                                                                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`      | `ReactNode`                                                                                                    |          |         | The main content. It takes the free width and can shrink, so long words wrap instead of widening the page.                                                                                                                                                                  |
| `aside`         | `ReactNode`                                                                                                    |          |         | The side panel: a chat, a filter, a summary. Without it, only the main content renders.                                                                                                                                                                                     |
| `asideLabel`    | `string`                                                                                                       |          |         | Accessible name of the side panel. With it the panel is an `aside` landmark; without it, a plain `div`, because a layout primitive must not add unnamed landmarks.                                                                                                          |
| `asideWidth`    | `'sm' \| 'md' \| 'lg'`                                                                                         |          | `'md'`  | Width of the side panel: `sm` 280px, `md` 360px (default, same as the `AppShell` detail pane), `lg` 480px.                                                                                                                                                                  |
| `asidePosition` | `'start' \| 'end'`                                                                                             |          | `'end'` | Side of the side panel in the reading direction: `end` (default) or `start`. It is logical, so it flips in right-to-left text. The DOM order stays main first.                                                                                                              |
| `gap`           | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 12 \| 16 \| '1' \| '2' \| '3' \| '4' \| '5' \| '6' \| '8' \| '12' \| '16'` |          | `6`     | Space between the main content and the aside, as a key of the space scale. Default `6` (24px).                                                                                                                                                                              |
| `sticky`        | `boolean`                                                                                                      |          | `false` | Keeps the aside in view while the main content scrolls (`position: sticky`). The aside is limited to the height of the viewport and scrolls on its own, and becomes a keyboard stop while it scrolls. Sticky only works beside the main content: it is off while collapsed. |
| `collapseBelow` | `'sm' \| 'md' \| 'lg' \| 'never'`                                                                              |          | `'md'`  | Width of the layout (its own width, measured with a container query) under which the aside stacks under the main content: `sm` 480px, `md` 768px (default), `lg` 1024px, or `never`. The widths are the `--ds-breakpoint-*` tokens.                                         |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-line-control`, `--ds-space-1`, `--ds-split-layout-aside-w-lg`, `--ds-split-layout-aside-w-md`, `--ds-split-layout-aside-w-sm`, `--ds-split-layout-gap`, `--ds-split-layout-sticky-offset`, `--ds-toast-clearance`

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

## Related components

- Instead, see Grid: Equal columns: use `Grid`.
- Instead, see AppShell: The detail pane of a whole screen (beside the page content, with its own scroll and landmark): use the `detail` prop of `AppShell`.
- Instead, see Sheet: A panel that slides over the page: use `Sheet`.
