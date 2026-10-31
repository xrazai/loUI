# Toast

Status: experimental

A short, temporary message about something that just happened, with an optional action (usually Undo). Mount one `ToastRegion` and call `toast()` from anywhere. Built on React Aria's toast region and queue.

- Handoff source: `components/feedback/Toast` (CMP-FBK-02). Undo recipe: GAP-008 groundwork.

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
import { toast } from '@loui/ds';
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

`toast(...)` returns a key; `toast.close(key)` and `toast.clear()` remove toasts. `useToast()` returns the same stable object. `createToastQueue()` / `createToastApi(queue)` and `<ToastRegion queue>` give an isolated queue (tests, a second region). `ToastRegion` also takes `messages` and `className`. At most four toasts show at once; the rest wait.

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
5. A hook (`useUndoable`) that wraps steps 1 to 3 is tracked as GAP-008.

## Differences from the handoff

- A queue and region instead of a single stateless `Toast` you position yourself; timeout, pause on hover/focus, keyboard region, dismiss label from messages.
- 5 s default instead of 3.6 s.
- Tones `info | success | warning | danger` (the handoff's `neutral | accent` dot colors became `info`); the tone is spoken, not only colored.
- Position is bottom center, away from side panels.
