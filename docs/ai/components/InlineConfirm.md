# InlineConfirm

> A two-step confirmation without a dialog: the trigger button turns into a question with
> Cancel and a confirm button, in place. For a destructive action in a dense row or toolbar
> where a `ConfirmDialog` would be heavy.

Focus moves to **Cancel** when the prompt opens (configurable), so Enter right after the
click cannot confirm. `Escape` cancels, but only while focus is inside the prompt (it is not a
window listener, so it does not close a surrounding `Dialog` first). When the prompt closes,
focus returns to the trigger.

A two-step confirmation in place: a button that turns into a question with Cancel and a confirm button. No dialog.

- Handoff source: `components/feedback/InlineConfirm` (CMP-FBK-07).

- Import: `import { InlineConfirm } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/InlineConfirm/InlineConfirm.tsx`
- Stories (Storybook title `Components/InlineConfirm`): Default, Asking, EscapeCancels, ConfirmByKeyboard, FocusOnConfirm, Neutral, Small, DefaultPrompt, Disabled

## Props

| Prop           | Type                                           | Required | Default    | Description                                                                                                                                 |
| -------------- | ---------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`        | `string`                                       | yes      |            | Label of the trigger button: verb plus object ("Delete order").                                                                             |
| `onConfirm`    | `() => void`                                   | yes      |            | Called when the user confirms. The prompt closes afterwards.                                                                                |
| `prompt`       | `string`                                       |          |            | The question, ideally with the consequence ("Remove this line? This can't be undone."). Default from messages: "Are you sure?".             |
| `confirmLabel` | `string`                                       |          |            | Label of the confirming button. Defaults to `label`, which already names the action.                                                        |
| `tone`         | `'danger' \| 'neutral'`                        |          | `'danger'` | `danger` (default): destructive styling. `neutral`: secondary trigger, primary confirm.                                                     |
| `initialFocus` | `'cancel' \| 'confirm'`                        |          | `'cancel'` | Which button gets the focus when the prompt opens. `cancel` (default) is the safe choice and the product principle for destructive actions. |
| `size`         | `'sm' \| 'md' \| 'lg'`                         |          | `'md'`     | Button size, `md` by default.                                                                                                               |
| `isOpen`       | `boolean`                                      |          |            | Controlled state: whether the prompt is showing. Pair with `onOpenChange`.                                                                  |
| `defaultOpen`  | `boolean`                                      |          | `false`    | Initial state when uncontrolled.                                                                                                            |
| `onOpenChange` | `(isOpen: boolean) => void`                    |          |            | Called when the prompt opens or closes.                                                                                                     |
| `isDisabled`   | `boolean`                                      |          |            | Disables the trigger.                                                                                                                       |
| `messages`     | `Partial<{ cancel: string; prompt: string; }>` |          |            | Per-instance overrides of the built-in messages.                                                                                            |
| `className`    | `string`                                       |          |            |                                                                                                                                             |
| `ref`          | `Ref<HTMLSpanElement>`                         |          |            | Ref to the root element.                                                                                                                    |

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`
- `tone`: `danger`, `neutral`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ InlineConfirm: { ... } }}>`.

| Key      | English default | Notes                                                                           |
| -------- | --------------- | ------------------------------------------------------------------------------- |
| `cancel` | `Cancel`        | Label of the button that backs out of the confirmation.                         |
| `prompt` | `Are you sure?` | Default question shown next to the buttons. State the consequence when you can. |

## Design tokens used

`--ds-font-sans`, `--ds-fs-small`, `--ds-lh-small`, `--ds-space-2`, `--ds-text-2`

## When to use

- A destructive action in a dense row, toolbar or card where a `ConfirmDialog` would be heavy ("Delete line", "Remove member").

## When not to use

- Deleting something important or large (a customer, an order): use `ConfirmDialog`, which can show the consequence in full.
- Reversible actions: do them and offer **Undo** in a `Toast`.
- Anything that needs more input: use `Dialog`.

## Anatomy

```
span                       (inline-flex)
  Button                   trigger: variant danger | secondary          (idle)
─ or ─
span[role=group]           aria-labelledby = prompt                    (asking)
  span                     prompt (text-2)
  Button ghost             Cancel                                       <- initial focus
  Button danger-solid | primary   confirm
```

## Accessibility

- **Initial focus is Cancel** by default, so Enter or Space pressed right after the click cannot confirm. The handoff auto-focused the confirm button.
- **Escape cancels, scoped.** The handler is on the prompt, not on `window`. It only fires while focus is inside the prompt, and it stops propagation, so an enclosing `Dialog` or `Sheet` stays open (tested); a second Escape closes the dialog. The handoff attached a window listener (ARCH-005).
- **Focus returns to the trigger** after Cancel, Escape or confirm.
- The prompt is a `group` named by the question; screen readers hear it when focus lands on Cancel. Button names are real text; color (red) is never the only signal.
- Cancel and confirm are normal buttons in the tab order: `Tab` from Cancel reaches confirm.
- With `defaultOpen`, focus moves to Cancel on mount; avoid it on page load.

## Content rules

- Trigger and confirm: verb plus object, sentence case ("Delete line"). Not "Yes" or "OK".
- Prompt: a short question; add the consequence ("Remove this line? This can't be undone.").

## Examples

```tsx
<InlineConfirm
  label="Delete line"
  prompt="Remove this line? This can't be undone."
  onConfirm={() => removeLine(line.id)}
/>
```

## Related components

- Instead, see ConfirmDialog: Deleting something important or large (a customer, an order): use `ConfirmDialog`, which can show the consequence in full.
- Instead, see Dialog: Anything that needs more input: use `Dialog`.
- Renders: Button
