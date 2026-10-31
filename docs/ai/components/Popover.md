# Popover

> A floating surface for interactive content (filters, a small form, a color picker), built on
> React Aria `DialogTrigger`, `Popover` and `Dialog`.

It is not for lists of commands (use `Menu`), for choosing one option (use `Select`) or for
plain hints (use `Tooltip`). `Escape` and an outside press close it and focus returns to the
trigger; when the content has focusable elements, `Tab` stays inside until it is closed.

A floating surface that opens from a trigger and holds interactive content. Built on React Aria `DialogTrigger`, `Popover` and `Dialog`.

- Handoff source: `components/navigation/Popover` (CMP-NAV-04).

- Import: `import { Popover } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Popover/Popover.tsx`
- Stories (Storybook title `Components/Popover`): Default, Open, WithArrow, AboveTrigger, AlignedToEnd, KeyboardOpenAndRestoreFocus, CloseFromInside

## Props

| Prop           | Type                                                                                                                                                                                                                                                                                                                     | Required | Default          | Description                                                                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `trigger`      | `ReactElement<unknown, string \| JSXElementConstructor<any>>`                                                                                                                                                                                                                                                            | yes      |                  | The element that opens the popover: a `Button`, `IconButton` or any React Aria pressable. It receives `aria-expanded` and `aria-haspopup="dialog"`.                                                                                                    |
| `label`        | `string`                                                                                                                                                                                                                                                                                                                 | yes      |                  | Accessible name of the popover (for example "Filters"). The popover is a `dialog`, so it needs a name; a visible heading inside it can be linked with `aria-labelledby` instead.                                                                       |
| `children`     | `ReactNode \| ((options: { close: () => void; }) => ReactNode)`                                                                                                                                                                                                                                                          | yes      |                  | Interactive content. A function receives `close` to dismiss the popover from inside.                                                                                                                                                                   |
| `placement`    | `'bottom' \| 'bottom left' \| 'bottom right' \| 'bottom start' \| 'bottom end' \| 'top' \| 'top left' \| 'top right' \| 'top start' \| 'top end' \| 'left' \| 'left top' \| 'left bottom' \| 'start' \| 'start top' \| 'start bottom' \| 'right' \| 'right top' \| 'right bottom' \| 'end' \| 'end top' \| 'end bottom'` |          | `'bottom start'` | Side and alignment relative to the trigger. Default `bottom start`. Flips on collision.                                                                                                                                                                |
| `showArrow`    | `boolean`                                                                                                                                                                                                                                                                                                                |          | `false`          | Draws an arrow that points at the trigger.                                                                                                                                                                                                             |
| `isNonModal`   | `boolean`                                                                                                                                                                                                                                                                                                                |          | `false`          | Keeps the page outside the popover available to assistive technology and does not hide it. Leave it off unless the popover is a long-lived tool the user returns to; React Aria's guidance is that most popovers should stay modal for screen readers. |
| `isOpen`       | `boolean`                                                                                                                                                                                                                                                                                                                |          |                  | Controlled open state. Pair with `onOpenChange`.                                                                                                                                                                                                       |
| `defaultOpen`  | `boolean`                                                                                                                                                                                                                                                                                                                |          |                  | Initial open state when uncontrolled.                                                                                                                                                                                                                  |
| `onOpenChange` | `(isOpen: boolean) => void`                                                                                                                                                                                                                                                                                              |          |                  | Called when the popover opens or closes.                                                                                                                                                                                                               |
| `className`    | `string`                                                                                                                                                                                                                                                                                                                 |          |                  | Class name for the popover surface.                                                                                                                                                                                                                    |
| `ref`          | `Ref<HTMLElement>`                                                                                                                                                                                                                                                                                                       |          |                  | Ref to the popover surface.                                                                                                                                                                                                                            |

## Design tokens used

`--ds-duration`, `--ds-ease`, `--ds-font-sans`, `--ds-fs-small`, `--ds-lh-small`, `--ds-line-strong`, `--ds-popover-arrow-size`, `--ds-popover-min-width`, `--ds-popover-padding`, `--ds-radius-lg`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-surface-raised`, `--ds-text`

## When to use

- Filters, a small form, a date range, a color picker: content the user operates and then dismisses.

## When not to use

- A list of commands: use `Menu`.
- Choosing one option from a list: use `Select` or `Combobox`.
- A hint on hover or focus: use `Tooltip`.
- A decision that blocks the task: use `Dialog`.

## Anatomy

```
DialogTrigger
  trigger            Button | IconButton            aria-haspopup=dialog, aria-expanded, aria-controls
  Popover            raised surface, strong line, radius lg, overlay shadow, z popover
    OverlayArrow     optional
    Dialog           role=dialog, aria-label = label
      children
```

## Accessibility

- The trigger gets `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`. The handoff used a `span` with a click handler and no ARIA.
- The surface is a `dialog` named by `label`. A menu is **not** a dialog: use `Menu` for commands.
- Keys: `Enter`/`Space` on the trigger opens it and moves focus inside; `Tab` moves through the content; `Esc` closes it and focus returns to the trigger.
- Outside press closes it. React Aria hides the rest of the page from assistive technology while it is open (`isNonModal` turns that off; React Aria recommends it only for long-lived tool popovers).
- Focus is restored to the trigger on close.
- Placement is collision-aware. Forced colors: the arrow uses `CanvasText`/`Canvas`.
- Layer: `--ds-z-popover`. A popover opened from inside a `Dialog` or `Sheet` sits **below** them in the current z-index scale (see the Dialog doc, "Layers").

## Content rules

- `label` is a noun phrase: "Filters", "Date range".
- Put the confirming action inside the content ("Apply filters"); verb plus object.

## Examples

```tsx
<Popover trigger={<Button>Filters</Button>} label="Filters" placement="bottom end">
  {({ close }) => (
    <>
      <Input label="Customer" />
      <Button variant="primary" onPress={close}>
        Apply filters
      </Button>
    </>
  )}
</Popover>
```

## Related components

- Instead, see Menu: A list of commands: use `Menu`.
- Instead, see Select: Choosing one option from a list: use `Select` or `Combobox`.
- Instead, see Combobox: Choosing one option from a list: use `Select` or `Combobox`.
- Instead, see Tooltip: A hint on hover or focus: use `Tooltip`.
- Instead, see Dialog: A decision that blocks the task: use `Dialog`.
