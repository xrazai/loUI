# InlineConfirm

Status: experimental

A two-step confirmation in place: a button that turns into a question with Cancel and a confirm button. No dialog.

- Handoff source: `components/feedback/InlineConfirm` (CMP-FBK-07).

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

## Props

| Prop                                      | Type                    | Default         | Notes                                           |
| ----------------------------------------- | ----------------------- | --------------- | ----------------------------------------------- |
| `label`                                   | `string` (required)     | none            | Trigger text: verb plus object ("Delete line"). |
| `onConfirm`                               | `() => void` (required) | none            |                                                 |
| `prompt`                                  | `string`                | "Are you sure?" | State the consequence when you can.             |
| `confirmLabel`                            | `string`                | `label`         |                                                 |
| `tone`                                    | `'danger' \| 'neutral'` | `danger`        | `neutral`: secondary trigger, primary confirm.  |
| `initialFocus`                            | `'cancel' \| 'confirm'` | `cancel`        | Cancel is the safe default.                     |
| `size`                                    | `'sm' \| 'md' \| 'lg'`  | `md`            |                                                 |
| `isOpen` / `defaultOpen` / `onOpenChange` |                         |                 | Controlled / uncontrolled prompt state.         |
| `isDisabled`                              | `boolean`               | `false`         | Disables the trigger.                           |
| `messages`                                | `{ cancel, prompt }`    |                 | Per-instance overrides (pt-BR ships).           |

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

## Differences from the handoff

- Initial focus on Cancel (configurable) instead of confirm.
- Scoped Escape instead of a window listener; focus restored to the trigger.
- `danger` boolean became `tone`; `cancelLabel` and the default prompt come from the message catalog (English and pt-BR).
- Controlled and uncontrolled state; `isDisabled`; the prompt is a labelled group.
