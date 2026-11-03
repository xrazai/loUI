# ConfirmDialog

> A destructive-action confirmation: an `alertdialog` with the question as the title, the
> consequence in one sentence, a Cancel button and a confirm button that names the action.

Initial focus is on **Cancel**, so pressing Enter or Space right after the dialog opens never
confirms. Outside presses do not dismiss it (`Escape` and Cancel do), because the user has to
answer. Follow a confirmed delete with a `Toast` that offers Undo when the data can come back.

A modal dialog, and `ConfirmDialog` for destructive confirmations. Built on React Aria `DialogTrigger`, `ModalOverlay`, `Modal` and `Dialog`.

- Handoff source: `components/feedback/Dialog` (CMP-FBK-03). Overlay management: ARCH-005.

- Import: `import { ConfirmDialog } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Dialog/ConfirmDialog.tsx`
- Stories (Storybook title `Components/ConfirmDialog`): Default, ConfirmByKeyboard, EscapeCancels, ConfirmFlow, Open, Neutral, Pending, WithDetails, Default, Open, Medium, Large, WithoutBody, LongContent, LongTitle, InsideSheet, RightToLeft

## Props

| Prop                        | Type                                                          | Required | Default    | Description                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                     | `ReactNode`                                                   | yes      |            | The question, naming the object: "Delete order #1048?". Not "Are you sure?" and not "Confirm".                                                                                     |
| `description`               | `ReactNode`                                                   | yes      |            | The consequence, in one sentence: "The order and its 14 lines will be removed. This can't be undone." Required, because a confirmation without a consequence is only a speed bump. |
| `confirmLabel`              | `string`                                                      | yes      |            | Label of the confirming button. Names the action, verb plus object: "Delete order". Never "OK", "Yes" or "Confirm".                                                                |
| `onConfirm`                 | `() => void`                                                  | yes      |            | Called when the user confirms. The dialog closes afterwards unless `closeOnConfirm` is `false`.                                                                                    |
| `children`                  | `ReactNode`                                                   |          |            | Optional extra content between the description and the buttons (for example a list of affected items).                                                                             |
| `tone`                      | `'danger' \| 'neutral'`                                       |          | `'danger'` | `danger` (default): red `danger-solid` button for a destructive action. `neutral`: the `primary` button.                                                                           |
| `initialFocus`              | `'cancel' \| 'confirm'`                                       |          | `'cancel'` | Which button gets the initial focus. `cancel` (default) is the safe choice and the product principle for destructive actions; `confirm` is for non-destructive confirmations.      |
| `closeOnConfirm`            | `boolean`                                                     |          | `true`     | Keep the dialog open after `onConfirm`, for example while an async request runs. Default `true` closes it.                                                                         |
| `isPending`                 | `boolean`                                                     |          | `false`    | Shows a spinner on the confirm button and ignores presses while a request runs.                                                                                                    |
| `messages`                  | `Partial<{ cancel: string; }>`                                |          |            | Per-instance overrides of the built-in messages.                                                                                                                                   |
| `size`                      | `'sm' \| 'md' \| 'lg'`                                        |          |            | Maximum width: `sm` 420px (default), `md` 540px, `lg` 680px. Narrower on small screens.                                                                                            |
| `trigger`                   | `ReactElement<unknown, string \| JSXElementConstructor<any>>` |          |            | The element that opens the dialog (a `Button`). Optional: omit it and control the dialog with `isOpen`. Focus returns to the element that was focused when the dialog opened.      |
| `isOpen`                    | `boolean`                                                     |          |            | Controlled open state. Pair with `onOpenChange`.                                                                                                                                   |
| `defaultOpen`               | `boolean`                                                     |          |            | Initial open state when uncontrolled.                                                                                                                                              |
| `onOpenChange`              | `(isOpen: boolean) => void`                                   |          |            | Called when the dialog opens or closes.                                                                                                                                            |
| `isDismissable`             | `boolean`                                                     |          | `false`    | Whether pressing the overlay closes the dialog. Default `true`; `ConfirmDialog` sets `false`.                                                                                      |
| `isKeyboardDismissDisabled` | `boolean`                                                     |          |            | Disables closing with `Escape`. Use it only while a request is running.                                                                                                            |
| `className`                 | `string`                                                      |          |            | Class name for the dialog panel.                                                                                                                                                   |
| `ref`                       | `Ref<HTMLElement>`                                            |          |            | Ref to the dialog panel.                                                                                                                                                           |

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`
- `tone`: `danger`, `neutral`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Dialog: { ... } }}>`.

| Key      | English default | Notes                                                                        |
| -------- | --------------- | ---------------------------------------------------------------------------- |
| `cancel` | `Cancel`        | Label of the button that dismisses a `ConfirmDialog` without doing anything. |

## Design tokens used

`--ds-dialog-gutter`, `--ds-dialog-padding`, `--ds-dialog-width-lg`, `--ds-dialog-width-md`, `--ds-dialog-width-sm`, `--ds-duration`, `--ds-ease`, `--ds-font-sans`, `--ds-fs-heading`, `--ds-fs-small`, `--ds-lh-heading`, `--ds-lh-small`, `--ds-line`, `--ds-line-strong`, `--ds-overlay`, `--ds-radius-lg`, `--ds-shadow-dialog`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-weight-semibold`

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

## Accessibility

- Focus is **trapped** while open, **restored** to the element that opened it, the page behind is `inert`/`aria-hidden` and does not scroll (all React Aria).
- **Initial focus.** Plain `Dialog`: the dialog itself, or the child with `autoFocus` (put it on the first field). `ConfirmDialog`: **Cancel**, so pressing Enter or Space as soon as it opens never confirms. The handoff focused nothing.
- `Escape` closes **only the top-most layer**. A `Dialog` opened from a `Sheet` closes first and the Sheet stays (tested). Every overlay uses React Aria's shared layer stack instead of its own window listener (ARCH-005).
- Named by the title (`aria-labelledby`, from the `h2`) and described by the description (`aria-describedby`; not linked in the handoff).
- `ConfirmDialog` uses `alertdialog`, which screen readers announce with its description. A press outside does not dismiss it.
- Reduced motion: the 150 ms fade and 8 px rise are removed. Forced colors: border in `CanvasText`.
- 320 px reflow: the dialog shrinks to the viewport less the 24 px gutter and the body scrolls.

### Layers

Overlays are portaled to `body`, each with its own layer: sheet (40) < dialog (45) < dropdown (50) < popover (55) < toast (58) < tooltip (60). A `Select`, `Menu`, `Popover` or `Combobox` opened from inside a Dialog or Sheet therefore renders **above** it. This is safe because a modal blocks page-level popovers while it is open. Tests assert the order.

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

## Related components

- Instead, see Sheet: Viewing or editing a record next to its list: use `Sheet`.
- Instead, see Popover: Interactive content anchored to a control: use `Popover`.
- Instead, see Alert: A message about the page: use `Alert`.
- Renders: Button
