# Tooltip

Status: experimental

A short, ink-style hint for a control. Built on React Aria `TooltipTrigger` and `Tooltip`.

- Handoff source: `components/feedback/Tooltip` (CMP-FBK-04).

## When to use

- Name or add a shortcut to an icon-only control ("Add order", with `N`).
- Explain a truncated label, in a few words.

## When not to use

- Essential information (an error, a requirement, a price). **A tooltip is never the only source of essential information**: touch users cannot hover, and the text is not shown until the trigger is focused or hovered.
- Interactive content (links, buttons, forms): use `Popover`.
- A long explanation: put it in the page, or use a `Popover`.

## Anatomy

```
TooltipTrigger
  trigger            Button | IconButton | Link   (focusable, React Aria based)
  Tooltip            role=tooltip, primary background, label type, radius sm
    content          text
    shortcut         optional, mono caption, --ds-primary-fg-muted
```

## Props

| Prop                     | Type                                    | Default | Notes                                                           |
| ------------------------ | --------------------------------------- | ------- | --------------------------------------------------------------- |
| `children`               | `ReactElement`                          | none    | The trigger. Must be focusable and React Aria based.            |
| `content`                | `ReactNode`                             | none    | A few words.                                                    |
| `shortcut`               | `string`                                |         | Mono text after the content ("Ctrl+K").                         |
| `placement`              | `'top' \| 'bottom' \| 'start' \| 'end'` | `top`   | `start`/`end` follow the writing direction; collisions flip it. |
| `delay`                  | `number`                                | `500`   | ms before a hover opens it. Focus opens it immediately.         |
| `closeDelay`             | `number`                                | `0`     | ms before it closes after the pointer leaves.                   |
| `isDisabled`             | `boolean`                               | `false` | Never opens.                                                    |
| `isOpen` / `defaultOpen` | `boolean`                               |         | Controlled / uncontrolled.                                      |
| `onOpenChange`           | `(isOpen: boolean) => void`             |         |                                                                 |

`TOOLTIP_DELAY` (500) is exported. The handoff used no delay; React Aria's own default (1500 ms) feels slow for a dense tool.

## Accessibility

- Role `tooltip`, linked to the trigger with `aria-describedby` while open. The trigger keeps its own accessible name.
- Opens on **keyboard focus and hover**, closes on blur, pointer leave or `Escape` (WCAG 1.4.13: dismissible). The pointer can move onto the tooltip without closing it (hoverable), and it stays until dismissed (persistent).
- Placement is collision-aware.
- Contrast: `--ds-primary-fg` on `--ds-primary-bg`; the shortcut uses `--ds-primary-fg-muted` (at least 4.5:1 on the ink surface).
- Reduced motion: the 150 ms fade is disabled. Forced colors: a `CanvasText` border is drawn.
- Layer: `--ds-z-tooltip`, the top of the stack.

## Content rules

- Sentence case, no final period for a fragment, no exclamation marks.
- Do not repeat a visible label; add the shortcut or the missing detail.

## Examples

```tsx
<Tooltip content="Add order" shortcut="N">
  <IconButton label="Add order" icon={PlusIcon} />
</Tooltip>
```

`IconButton` also takes a `tooltip` prop that does this for you.

## Differences from the handoff

- Built on React Aria: focus and hover, `Escape`, `aria-describedby`, hoverable content and collision-aware placement came for free; the handoff used a `span` with mouse handlers and absolute positioning.
- All four sides; delay; controlled state; `isDisabled`.
- No `forceOpen`: use `defaultOpen` or `isOpen`.
