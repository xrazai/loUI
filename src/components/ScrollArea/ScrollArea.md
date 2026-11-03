# ScrollArea

Status: experimental

A scrolling container with thin, themed scrollbars that stays keyboard accessible.

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

## Props

| Prop                             | Type                                   | Default      | Notes                                                                                                                      |
| -------------------------------- | -------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `aria-label` / `aria-labelledby` | `string`                               | **required** | One of them. It names the region while it scrolls                                                                          |
| `orientation`                    | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Which axes scroll                                                                                                          |
| `maxBlockSize`                   | `string \| number`                     | none         | Height cap (CSS length, or pixels as a number). The region grows with its content up to it, then scrolls (stays focusable) |

Other `div` attributes (not `role`, `tabIndex`) and `ref` go to the root. Give the area a height, or put it in a flex column and let it shrink; it scrolls inside the space its parent gives it.

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

## Differences from the handoff

- The handoff scrolled with unlabelled `overflow: auto` divs that keyboard users could not reach. Scrollbar colors come from tokens.
