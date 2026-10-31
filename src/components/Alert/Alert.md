# Alert

Status: experimental

An inline message with a tone, an icon, an optional title, one action and an optional dismiss button.

## When to use

- Explain a state that affects the page or a form: a declined payment, a scheduled maintenance, a failed import.
- Tell the user what to do about it, next to the thing it is about.

## When not to use

- Feedback about an action that just finished ("Order #1051 created"): use `Toast`.
- A confirmation that needs a decision: use `Dialog`.
- A field error: use the field's error message.
- A status of a record (Shipped, Failed): use `Badge`.

## Anatomy

```
div[role=status | alert | none]  (tinted surface, 1px tinted border, radius lg)
  Icon (decorative)  info | success | warning (triangle) | danger
  content
    VisuallyHidden   "Information" | "Success" | "Warning" | "Error"
    title            optional, 14/22, weight 500
    children         13/18, text-2
  actions            action slot · dismiss IconButton
```

## Props

| Prop        | Type                                           | Default  | Notes                                                                          |
| ----------- | ---------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `tone`      | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | `info` is neutral; the others tint border and background                       |
| `title`     | `ReactNode`                                    |          | What happened, one line                                                        |
| `children`  | `ReactNode`                                    |          | Why, and what to do                                                            |
| `action`    | `ReactNode`                                    |          | One link or small `Button`                                                     |
| `onDismiss` | `() => void`                                   |          | Shows the dismiss button; the parent removes the alert                         |
| `urgent`    | `boolean`                                      | `false`  | `role="alert"` (assertive). Only for failures that need attention now          |
| `announce`  | `boolean`                                      | `true`   | `false` removes the live region role for static notices. Ignored when `urgent` |
| `messages`  | `{ dismiss, info, success, warning, danger }`  |          | Per-instance overrides                                                         |

The vocabulary uses `info` instead of `neutral` for the plain tone, as in the handoff. Other `div` attributes and `ref` go to the root.

## Accessibility: role decisions

- **Default `role="status"` (polite).** Most alerts appear after something the user did (submit, import). A status region is announced politely, without stealing focus or interrupting speech. The handoff used `role="alert"` for every `danger` alert, which interrupts for things that are not urgent; urgency is now an explicit `urgent` prop, not a function of the tone.
- **`urgent` gives `role="alert"` (assertive).** Use it for a failure the user must know right now (lost connection, session expired). Avoid more than one at a time.
- **`announce={false}` gives no role.** A notice that is part of the page when it loads (a permanent banner, a form-level note) does not need a live region; screen readers read it in page order. A live region that never changes is noise, and many `status` regions on one page are worse.
- Live regions announce **changes**: for the announcement to work, render the Alert when the event happens and keep the region mounted; do not render it hidden and unhide it.
- **The tone is not only color and icon.** The icon is `aria-hidden`; a visually hidden prefix ("Error", "Warning", "Success", "Information", from messages) names the kind of alert for screen readers.
- The **dismiss button** is an `IconButton` named "Dismiss alert" (messages), reachable by Tab and operated with Enter or Space. After dismissing, the parent should move focus somewhere sensible if the alert held it.
- Text contrast on the tinted backgrounds is at least 4.5:1 (checked in the browser test with the real computed colors). The 6% and 30% tints are component tokens (`--ds-alert-*`).
- Forced colors: the browser repaints border and icon with system colors; the icon and the hidden tone prefix still name the tone.

## Content rules

- Title: what happened, sentence case, no exclamation marks ("Payment declined").
- Text: why and what to do ("The card ending in 4242 was declined. Use another card.").
- The action is a verb plus object ("Update card"), not "Click here".

## Examples

```tsx
<Alert title="Scheduled maintenance">Sunday, 02:00 to 03:00 UTC.</Alert>

<Alert tone="danger" title="Payment declined" action={<Link href="/billing">Update card</Link>}>
  The card ending in 4242 was declined.
</Alert>

<Alert tone="danger" urgent title="Connection lost" onDismiss={() => setOffline(false)}>
  Changes are not being saved.
</Alert>
```

## Differences from the handoff

- Icons are bundled Lucide icons, `aria-hidden`, instead of the text glyphs "i", "check" and "!" that screen readers read aloud. Warning and danger have different icons.
- `role` is `status` by default, `alert` only when `urgent`, none with `announce={false}`.
- Dismiss option, visually hidden tone prefix, and `messages` (English and pt-BR).
- The 6% tint and 30% border are tokens instead of inline `color-mix`; the handoff `--radius` (undefined) is `--ds-radius-lg`.
- No `style` prop.
