# Popover

Status: experimental

A floating surface that opens from a trigger and holds interactive content. Built on React Aria `DialogTrigger`, `Popover` and `Dialog`.

- Handoff source: `components/navigation/Popover` (CMP-NAV-04).

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

## Props

| Prop                     | Type                                    | Default        | Notes                                                   |
| ------------------------ | --------------------------------------- | -------------- | ------------------------------------------------------- |
| `trigger`                | `ReactElement`                          | none           | A `Button`, `IconButton` or other React Aria pressable. |
| `label`                  | `string` (required)                     | none           | Accessible name of the dialog.                          |
| `children`               | `ReactNode \| ({ close }) => ReactNode` | none           | Interactive content.                                    |
| `placement`              | React Aria `Placement`                  | `bottom start` | Flips when there is no room.                            |
| `showArrow`              | `boolean`                               | `false`        | Arrow pointing at the trigger.                          |
| `isNonModal`             | `boolean`                               | `false`        | See Accessibility.                                      |
| `isOpen` / `defaultOpen` | `boolean`                               |                | Controlled / uncontrolled.                              |
| `onOpenChange`           | `(isOpen: boolean) => void`             |                |                                                         |

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

## Differences from the handoff

- Real positioning with collision handling instead of `position: absolute` offsets.
- `role` is `dialog` with a name; ARIA attributes on the trigger; focus moves in and returns.
- Outside press and `Escape` are handled by React Aria (the handoff used `mousedown` and a window `keydown` listener per instance).
- The handoff's `width` and `style` props are gone: size the content, not the surface.
