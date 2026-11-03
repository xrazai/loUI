# Tooltip

> An ink-style hint for a control, built on React Aria `TooltipTrigger` and `Tooltip`.

It opens on hover (after a delay) and on keyboard focus, closes with `Escape` (WCAG 1.4.13),
stays open while the pointer is over it, and describes the trigger through `aria-describedby`.
A tooltip is a supplement: the trigger must already have its own accessible name.

A short, ink-style hint for a control. Built on React Aria `TooltipTrigger` and `Tooltip`.

- Handoff source: `components/feedback/Tooltip` (CMP-FBK-04).

- Import: `import { Tooltip } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Tooltip/Tooltip.tsx`
- Stories (Storybook title `Components/Tooltip`): Default, Open, WithShortcut, Bottom, Start, End, LongText, OnIconButton, Disabled

## Props

| Prop           | Type                                                          | Required | Default | Description                                                                                                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`     | `ReactElement<unknown, string \| JSXElementConstructor<any>>` | yes      |         | The element the tooltip describes. It must be focusable and built on React Aria, such as `Button`, `IconButton` or `Link`, so the tooltip opens on keyboard focus as well as hover.                                                                               |
| `content`      | `ReactNode`                                                   | yes      |         | Short text, a few words. It is linked to the trigger with `aria-describedby`, so it must add detail only: never put the only copy of essential information in a tooltip, because touch users cannot hover and the text is not shown until the trigger is focused. |
| `shortcut`     | `string`                                                      |          |         | Keyboard shortcut shown after the text in mono type ("⌘K"). Pair it with `aria-keyshortcuts` on the trigger.                                                                                                                                                      |
| `placement`    | `'top' \| 'bottom' \| 'start' \| 'end'`                       |          | `'top'` | Side of the trigger, `top` by default. `start` and `end` follow the writing direction.                                                                                                                                                                            |
| `delay`        | `number`                                                      |          | `500`   | Milliseconds before opening on hover. Default 500. Focus opens it immediately.                                                                                                                                                                                    |
| `closeDelay`   | `number`                                                      |          | `0`     | Milliseconds before closing after the pointer leaves. Default 0.                                                                                                                                                                                                  |
| `isDisabled`   | `boolean`                                                     |          |         | Never opens when `true`, for example while the trigger is disabled.                                                                                                                                                                                               |
| `isOpen`       | `boolean`                                                     |          |         | Controlled open state. Pair with `onOpenChange`.                                                                                                                                                                                                                  |
| `defaultOpen`  | `boolean`                                                     |          |         | Initial open state when uncontrolled.                                                                                                                                                                                                                             |
| `onOpenChange` | `(isOpen: boolean) => void`                                   |          |         | Called when the tooltip opens or closes.                                                                                                                                                                                                                          |
| `className`    | `string`                                                      |          |         | Class name for the tooltip bubble.                                                                                                                                                                                                                                |
| `ref`          | `Ref<HTMLDivElement>`                                         |          |         | Ref to the tooltip bubble.                                                                                                                                                                                                                                        |

## Design tokens used

`--ds-duration`, `--ds-ease`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-primary-bg`, `--ds-primary-fg`, `--ds-primary-fg-muted`, `--ds-radius-sm`, `--ds-space-1`, `--ds-space-2`, `--ds-tooltip-max-width`, `--ds-weight-medium`, `--ds-weight-regular`

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

## Related components

- Instead, see Popover: Interactive content (links, buttons, forms): use `Popover`.
- Used by: IconButton, Toggle
