# ScrollArea

> A scrolling container with thin, themed scrollbars. It scrolls inside the space its parent
> gives it: give it a height (or put it in a flex column and let it shrink).

While its content overflows it becomes a keyboard stop (`tabindex="0"`) and a labelled
`region`, so keyboard users can scroll it with the arrow keys (WCAG 2.1.1). When nothing
overflows it is a plain container, with no tab stop and no landmark. A name is therefore
always required.

A scrolling container with thin, themed scrollbars that stays keyboard accessible.

- Import: `import { ScrollArea } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/ScrollArea/ScrollArea.tsx`
- Stories (Storybook title `Layout/ScrollArea`): Default, NotScrollable, Horizontal, Both, LabelledBy, RightToLeft

## Props

| Prop              | Type                                   | Required | Default      | Description                                      |
| ----------------- | -------------------------------------- | -------- | ------------ | ------------------------------------------------ |
| `orientation`     | `'both' \| 'horizontal' \| 'vertical'` |          | `'vertical'` | Which axes scroll. Default `vertical`.           |
| `aria-label`      | `string`                               |          |              | Accessible name of the region ("Order history"). |
| `aria-labelledby` | `string`                               |          |              | Id of the element that names the region.         |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-line-control`, `--ds-space-1`, `--ds-text-3`

## When to use

- A bounded list, log or panel inside a page: a notification list, a long form step, a code output.
- A region that must scroll on its own while the page around it does not.

## When not to use

- For the page itself: let the document scroll, or use `AppShell`'s `main`.
- For a table: `DataTable` has its own horizontal scroll and sticky parts.
- Inside a Dialog or Sheet body: those already scroll their body.

## Anatomy

```
div (overflow auto, scrollbar-width: thin)
  div (content wrapper, observed for size changes)
    children
```

## Accessibility

- A scroll container must be reachable by keyboard (WCAG 2.1.1). While the content overflows, the area gets `tabindex="0"` and `role="region"` with your label; with nothing to scroll it is a plain container (no tab stop, no landmark). A `ResizeObserver` keeps this in sync as content or size changes.
- Because focusability is dynamic, the type always requires a name, so a scrollable area is never unlabelled.
- Arrow keys, `PageUp`/`PageDown`, `Home`/`End` scroll it natively.
- The focus ring is drawn inside the box, so a clipping parent cannot hide it.
- Scrollbars are the browser's thin scrollbars colored with `--ds-line-control` (3:1 on the background); on hover they brighten to `--ds-text-3`.

## Content rules

- Name it for what it holds: "Order history", "Activity", not "Scrollable area".

## Examples

```tsx
<div style={{ blockSize: 240 }}>
  <ScrollArea aria-label="Activity">{events.map(renderEvent)}</ScrollArea>
</div>
```

## Related components

- Instead, see AppShell: For the page itself: let the document scroll, or use `AppShell`'s `main`.
- Instead, see DataTable: For a table: `DataTable` has its own horizontal scroll and sticky parts.
