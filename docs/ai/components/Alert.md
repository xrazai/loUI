# Alert

> An inline message with a tone, an icon, an optional title, an action and a dismiss button.
> The icon is decorative and a visually hidden prefix names the tone for screen readers.

An inline message with a tone, an icon, an optional title, one action and an optional dismiss button.

- Import: `import { Alert } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Alert/Alert.tsx`
- Stories (Storybook title `Components/Alert`): Default, Success, Warning, Danger, Urgent, StaticNotice, TitleOnly, TextOnly, WithAction, Dismissible, LongText, AllTones, RightToLeft

## Props

| Prop        | Type                                                                                            | Required | Default  | Description                                                                                                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone`      | `'info' \| 'success' \| 'warning' \| 'danger'`                                                  |          | `'info'` | Kind of message: `info` (neutral, default), `success`, `warning` or `danger`.                                                                                                                                                                                                                 |
| `title`     | `ReactNode`                                                                                     |          |          | Short heading of the alert, in one line: what happened. Plain text, not a document heading.                                                                                                                                                                                                   |
| `children`  | `ReactNode`                                                                                     |          |          | The detail: why it happened and what to do.                                                                                                                                                                                                                                                   |
| `action`    | `ReactNode`                                                                                     |          |          | A single action next to the text, usually a link or a small `Button` ("Update card").                                                                                                                                                                                                         |
| `onDismiss` | `() => void`                                                                                    |          |          | Shows a dismiss button that calls this. The alert is removed by the parent.                                                                                                                                                                                                                   |
| `urgent`    | `boolean`                                                                                       |          | `false`  | The message interrupts the user's task and must be announced immediately (`role="alert"`, assertive). Use it only for failures the user must know about right now.                                                                                                                            |
| `announce`  | `boolean`                                                                                       |          | `true`   | Whether the alert is a live region (`role="status"`, polite). Default `true`, because most alerts appear after something the user did. Set `false` for a static notice that is part of the page content from the start: it then has no role and is read in page order. Ignored when `urgent`. |
| `messages`  | `Partial<{ dismiss: string; info: string; success: string; warning: string; danger: string; }>` |          |          | Per-instance overrides of the built-in messages.                                                                                                                                                                                                                                              |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `tone`: `info`, `success`, `warning`, `danger`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Alert: { ... } }}>`.

| Key       | English default | Notes                                                                                                 |
| --------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| `dismiss` | `Dismiss alert` | Name of the dismiss button.                                                                           |
| `info`    | `Information`   | Visually hidden prefix that tells screen reader users the kind of alert; color and icon alone cannot. |
| `success` | `Success`       |                                                                                                       |
| `warning` | `Warning`       |                                                                                                       |
| `danger`  | `Error`         |                                                                                                       |

## Design tokens used

`--ds-accent`, `--ds-alert-danger-bg`, `--ds-alert-danger-border`, `--ds-alert-success-bg`, `--ds-alert-success-border`, `--ds-alert-warning-bg`, `--ds-alert-warning-border`, `--ds-bg`, `--ds-danger`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line`, `--ds-radius-lg`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-success`, `--ds-text`, `--ds-text-2`, `--ds-warning`, `--ds-weight-medium`

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

## Related components

- Instead, see Dialog: A confirmation that needs a decision: use `Dialog`.
- Instead, see Badge: A status of a record (Shipped, Failed): use `Badge`.
- Renders: Icon, IconButton, VisuallyHidden
