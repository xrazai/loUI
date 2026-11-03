# ToastRegion

> Renders the toasts of a queue. Mount **one** near the app root, inside `DSProvider`, and call
> `toast()` from anywhere. Built on React Aria's toast region (isolated in `toast.rac.ts`).

The region is a landmark named "Toast notifications" that `F6` moves into; the timer of every toast
pauses while the pointer is over the region or focus is inside it (WCAG 2.2.1). Toasts stack
at the bottom center of the viewport, clear of side panels, above dialogs and below tooltips.

A short, temporary message about something that just happened, with an optional action (usually Undo). Mount one `ToastRegion` and call `toast()` from anywhere. Built on React Aria's toast region and queue.

- Handoff source: `components/feedback/Toast` (CMP-FBK-02). Undo recipe: GAP-008 groundwork.

- Import: `import { ToastRegion } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Toast/Toast.tsx`
- Stories (Storybook title `Components/Toast`): AllTones, WithAction, LongMessage, UndoPattern, PausesOnHoverAndFocus, KeyboardRegion

## Props

| Prop        | Type                                                                                                                          | Required | Default              | Description                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------- | ----------------------------------------------------------- |
| `queue`     | `ToastQueue`                                                                                                                  |          | `createToastQueue()` | The queue to show. Defaults to the one `toast()` writes to. |
| `messages`  | `Partial<{ region: string; dismiss: string; info: string; success: string; warning: string; danger: string; undo: string; }>` |          |                      | Per-instance overrides of the built-in messages.            |
| `className` | `string`                                                                                                                      |          |                      | Class name for the region.                                  |
| `ref`       | `Ref<HTMLDivElement>`                                                                                                         |          |                      | Ref to the region element.                                  |

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Toast: { ... } }}>`.

| Key       | English default        | Notes                                                                                          |
| --------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| `region`  | `Toast notifications`  | Accessible name of the region that holds the toasts (a landmark reachable with F6).            |
| `dismiss` | `Dismiss notification` | Name of the dismiss button of a toast.                                                         |
| `info`    | `Information`          | Visually hidden prefix that tells screen reader users the kind of toast; the dot alone cannot. |
| `success` | `Success`              |                                                                                                |
| `warning` | `Warning`              |                                                                                                |
| `danger`  | `Error`                |                                                                                                |
| `undo`    | `Undo`                 | Label of the Undo action added by `toastWithUndo`. A verb.                                     |

## Design tokens used

`--ds-accent`, `--ds-danger`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-sans`, `--ds-fs-small`, `--ds-lh-small`, `--ds-line-strong`, `--ds-radius-lg`, `--ds-radius-pill`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-success`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-toast-dot-size`, `--ds-toast-max-width`, `--ds-toast-min-height`, `--ds-toast-offset`, `--ds-warning`, `--ds-z-toast`

## When to use

- Feedback for an action that finished: "Order #1051 created", "3 items archived".
- Reversible actions, with **Undo**.

## When not to use

- A state that stays on the page ("Scheduled maintenance"): use `Alert`.
- A field error: use the field's error message.
- Anything the user must read to proceed: use `Dialog` or `Alert`. A toast disappears.
- The only place an essential result is shown: toasts can be missed.

## Anatomy

```
ToastRegion          role=region, aria-label "Toast notifications", landmark (F6); fixed, bottom center; z toast
  Toast              role=alertdialog (React Aria), raised surface, strong line, radius lg, overlay shadow
    dot              decorative, colored by tone
    message          "Success: " (visually hidden) + text
    Button           optional action ("Undo")
    IconButton       "Dismiss notification"
```

## API

```tsx
// once, near the root, inside DSProvider
<ToastRegion />;

// anywhere
import { toast } from 'loui-ds';
toast('Draft saved'); // info
toast.success('Order #1051 created');
toast.warning('Stock is low for 2 items');
toast.danger('Payment failed', { timeout: null }); // stays until dismissed
toast.success('3 items archived', { action: { label: 'Undo', onPress: restore } });
```

| Option    | Type                                   | Default | Notes                                                   |
| --------- | -------------------------------------- | ------- | ------------------------------------------------------- |
| `tone`    | `info \| success \| warning \| danger` | `info`  | Feedback components use `info`, not `neutral`/`accent`. |
| `action`  | `{ label, onPress }`                   |         | One action. The toast closes after `onPress`.           |
| `timeout` | `number \| null`                       | `5000`  | Milliseconds. `null` = until dismissed.                 |
| `onClose` | `() => void`                           |         | Timeout, dismiss or action.                             |

`toastWithUndo(message, { onUndo })` shows a toast with a localized Undo action (see below). `toast(...)` returns a key; `toast.close(key)` and `toast.clear()` remove toasts. `useToast()` returns the same stable object. `createToastQueue()` / `createToastApi(queue)` and `<ToastRegion queue>` give an isolated queue (tests, a second region). `ToastRegion` also takes `messages` and `className`. At most four toasts show at once; the rest wait.

## Default timeout: 5000 ms

The handoff closed toasts after 3.6 s, which is too short to read a sentence and reach Undo (WCAG 2.2.1 Timing Adjustable). The default is 5 s **and** the timer pauses while the pointer is over the toast region or focus is inside it, so a keyboard or slow reader can always finish. Use `timeout: null` for failures the user has to act on.

## Accessibility

- The region is a landmark named "Toast notifications". **F6** moves focus into it (and back), so Undo is keyboard reachable. React Aria registers a region as a landmark only if it is mounted with its first toast, so `ToastRegion` renders nothing while the queue is empty and mounts the region when a toast arrives.
- Each toast is announced by React Aria's toast semantics. The tone is spoken as a prefix ("Success: ...", "Error: ...") from messages; the colored dot is decorative and `aria-hidden`.
- Pause on hover and on focus within the region; the timer resumes on leave or blur.
- Dismiss button named from messages ("Dismiss notification"); action is a real `Button`.
- Layer `--ds-z-toast` (58): above dialogs, below tooltips. Bottom center keeps it clear of side panels (Sheet, Sidebar).
- Reduced motion: the 150 ms fade-in is removed. Forced colors: border and dot use `CanvasText`.
- `UNSTABLE_*` isolation: all React Aria `UNSTABLE_Toast*` imports live in `toast.rac.ts`. Renaming or stabilizing them is a one-file change.

## Content rules

- Past tense, short, no exclamation marks: "Order #1051 created", "3 items archived".
- Action: a verb ("Undo"). No "Close" button text; the dismiss control is an icon.
- Do not repeat what is already visible on the page.

## The undo pattern (recipe)

"Reversible actions never ask; they offer Undo" (AGENTS.md section 5). Do the action immediately, then toast with an Undo that reverses it:

```tsx
function archiveOrder(order: Order) {
  const previous = order.status;
  setStatus(order.id, 'archived'); // 1. do it now
  toast.success(`Order #${order.number} archived`, {
    // 2. say so, past tense
    action: {
      label: 'Undo',
      onPress: () => setStatus(order.id, previous), // 3. reverse it from the saved state
    },
  });
}
```

Rules:

1. Save what you need to reverse **before** acting; Undo must not depend on state that has moved on.
2. If the change was already sent to a server, Undo sends the inverse change; do not delay the real action to "wait for Undo".
3. For deletes, soft-delete or keep the record for the Undo window plus a margin, and keep the confirmation dialog (`ConfirmDialog`), then show the toast. For example: confirm, delete, toast "Order #1048 deleted" with Undo.
4. Irreversible actions get a `ConfirmDialog`, not a toast.
5. Inside components, `useUndoable` wraps steps 1 to 3 and adds a deferred commit with failure handling. In plain modules (stores, services, handlers outside React) use `toastWithUndo`, below.

### Undo outside React: `toastWithUndo`

`toast(..., { action })` has no default label, and a hook cannot run in a plain module. `toastWithUndo` is a non-hook helper that takes the **Undo** label from the message catalogue (`Toast` key `undo`) instead of every call site repeating the word:

```ts
import { toastWithUndo } from 'loui-ds';

export function archiveOrder(order: Order) {
  const previous = order.status;
  orders.setStatus(order.id, 'archived'); // do it now
  toastWithUndo(`Order #${order.number} archived`, {
    onUndo: () => orders.setStatus(order.id, previous),
  });
}
```

| Option               | Type                | Default        | Notes                                             |
| -------------------- | ------------------- | -------------- | ------------------------------------------------- |
| `onUndo`             | `() => void`        | required       | Reverses the change. The toast closes afterwards. |
| `tone`               | `info               | success        | warning`                                          | `success` | Not `danger`: a failure is not undoable. |
| `locale`             | `string`            | see below      | BCP 47 tag for the label.                         |
| `messages`           | `{ undo?: string }` |                | Per-call override; wins over `locale`.            |
| `toast`              | `ToastApi`          | shared `toast` | An isolated queue (tests, a second region).       |
| `timeout`, `onClose` |                     |                | As in `toast()`.                                  |

It returns the toast key, like `toast()`. Outside React there is no context, so the label is resolved in this order: `messages.undo`, then `locale`, then the label the mounted `ToastRegion` publishes for the same queue (the `DSProvider` locale, a `messages={{ Toast: { undo } }}` provider override or the region's `messages` prop), then English. With a mounted region inside `DSProvider` you normally pass nothing. The helper does not defer anything and has no commit step; use `useUndoable` when you need that.

## Related components

- Instead, see Alert: A state that stays on the page ("Scheduled maintenance"): use `Alert`.
- Instead, see Dialog: Anything the user must read to proceed: use `Dialog` or `Alert`. A toast disappears.
- Renders: Button, IconButton, VisuallyHidden
