# Dialog

Status: experimental

A modal dialog, and `ConfirmDialog` for destructive confirmations. Built on React Aria `DialogTrigger`, `ModalOverlay`, `Modal` and `Dialog`.

- Handoff source: `components/feedback/Dialog` (CMP-FBK-03). Overlay management: ARCH-005.

## When to use

- A short task or decision that blocks the page: edit a record in a small form, confirm a deletion.
- `ConfirmDialog`: every deletion. "Deleting always asks for confirmation" (AGENTS.md section 5).

## When not to use

- Reversible actions (mark, link, change status): do them and offer **Undo** in a `Toast`. Do not confirm.
- Viewing or editing a record next to its list: use `Sheet`.
- Interactive content anchored to a control: use `Popover`.
- A message about the page: use `Alert`.
- Nesting dialogs more than two deep.

## Anatomy

```
DialogTrigger
  trigger            Button                                (optional when controlled)
  ModalOverlay       --ds-overlay, z dialog
    Modal            raised surface, strong line, radius lg, dialog shadow, width sm | md | lg
      Dialog         role=dialog | alertdialog, aria-labelledby = title, aria-describedby = description
        header       h2 title (17/24, 600) · description (14/22, text-2)
        body         scrolls
        footer       actions aligned to the end; divider when there is a body
```

## Props

`Dialog`

| Prop                                      | Type                                    | Default  | Notes                                                   |
| ----------------------------------------- | --------------------------------------- | -------- | ------------------------------------------------------- |
| `title`                                   | `ReactNode` (required)                  | none     | Heading and accessible name.                            |
| `description`                             | `ReactNode`                             |          | Linked with `aria-describedby`.                         |
| `children`                                | `ReactNode \| ({ close }) => ReactNode` |          | Body.                                                   |
| `footer`                                  | `ReactNode \| ({ close }) => ReactNode` |          | Actions.                                                |
| `size`                                    | `'sm' \| 'md' \| 'lg'`                  | `sm`     | Max width 420 / 540 / 680 px (`--ds-dialog-width-*`).   |
| `role`                                    | `'dialog' \| 'alertdialog'`             | `dialog` |                                                         |
| `trigger`                                 | `ReactElement`                          |          | Optional when controlled.                               |
| `isOpen` / `defaultOpen` / `onOpenChange` |                                         |          | Controlled / uncontrolled open state.                   |
| `isDismissable`                           | `boolean`                               | `true`   | Press on the overlay closes it.                         |
| `isKeyboardDismissDisabled`               | `boolean`                               | `false`  | Disables `Escape`; use only while a request is running. |

`ConfirmDialog` adds: `confirmLabel` (required, names the action), `onConfirm` (required), `tone` (`danger` | `neutral`), `initialFocus` (`cancel` | `confirm`, default `cancel`), `closeOnConfirm`, `isPending`, `messages` (`cancel`). `description` is required: it is the consequence. `isDismissable` defaults to `false`.

## Accessibility

- Focus is **trapped** while open, **restored** to the element that opened it, the page behind is `inert`/`aria-hidden` and does not scroll (all React Aria).
- **Initial focus.** Plain `Dialog`: the dialog itself, or the child with `autoFocus` (put it on the first field). `ConfirmDialog`: **Cancel**, so pressing Enter or Space as soon as it opens never confirms. The handoff focused nothing.
- `Escape` closes **only the top-most layer**. A `Dialog` opened from a `Sheet` closes first and the Sheet stays (tested). Every overlay uses React Aria's shared layer stack instead of its own window listener (ARCH-005).
- Named by the title (`aria-labelledby`, from the `h2`) and described by the description (`aria-describedby`; not linked in the handoff).
- `ConfirmDialog` uses `alertdialog`, which screen readers announce with its description. A press outside does not dismiss it.
- Reduced motion: the 150 ms fade and 8 px rise are removed. Forced colors: border in `CanvasText`.
- 320 px reflow: the dialog shrinks to the viewport less the 24 px gutter and the body scrolls.

### Layers (open issue)

`--ds-z-dropdown` (40) and `--ds-z-popover` (45) are **below** `--ds-z-sheet` (50) and `--ds-z-dialog` (55). A `Select`, `Menu`, `Popover` or `Combobox` opened from inside a Dialog or Sheet is portaled to `body` with its own layer, so it is drawn **behind** the open dialog. Because a modal makes page-level popovers impossible while it is open, raising dropdown and popover above sheet and dialog is safe (sheet 50 < dialog 55 < dropdown 60 < popover 65 < toast < tooltip). This is a change to `src/tokens/z-index.json` and its order test, reported to the PM; the Dialog tests record the current order.

## Content rules

- Title: a question for confirmations that names the object ("Delete order #1048?"), otherwise verb plus object or a noun phrase ("Edit customer"). Sentence case, no exclamation marks.
- Description: the consequence in one sentence ("The order and its 14 lines will be removed. This can't be undone.").
- Buttons: Cancel (secondary) then the action, verb plus object ("Save customer", "Delete order"). Never "OK" or "Yes". One primary action.
- After a confirmed delete show a `Toast` with **Undo** when the data can come back.

## Examples

```tsx
<ConfirmDialog
  trigger={<Button variant="danger">Delete order</Button>}
  title="Delete order #1048?"
  description="The order and its 14 lines will be removed. This can't be undone."
  confirmLabel="Delete order"
  onConfirm={() => deleteOrder(1048)}
/>

<Dialog
  trigger={<Button>Edit customer</Button>}
  title="Edit customer"
  footer={({ close }) => (
    <>
      <Button onPress={close}>Cancel</Button>
      <Button variant="primary" onPress={save}>Save customer</Button>
    </>
  )}
>
  <Input label="Name" autoFocus />
</Dialog>
```

## Differences from the handoff

- Focus trap, restore, initial focus, scroll lock and inert background from React Aria; the handoff had none.
- `aria-labelledby` and a linked `aria-describedby` instead of `aria-label={title}`.
- No window-level `Escape` listener per dialog; stack-aware.
- `width` (420 / 440) became `size` (`sm` / `md` / `lg`) with component tokens; `contained` mode is not ported (a story frame hosts open dialogs in the docs).
- New: `ConfirmDialog` implementing the destructive-confirmation principle, controlled and uncontrolled state, messages (English and pt-BR).
