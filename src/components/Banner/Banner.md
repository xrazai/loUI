# Banner

Status: experimental

A persistent, full-width message for a whole page or section: maintenance, a limited account, an offline mode. It has a tone, an icon, an optional title, one action and an optional dismiss button.

## When to use

- A condition that affects the whole page or area and lasts until it is resolved or dismissed: scheduled maintenance, a trial ending, a read-only mode.
- Place it at the top of the page or section it applies to, above the content.

## When not to use

- Feedback about something that just happened and goes away by itself ("Order #1051 created"): use `Toast`.
- A message about one piece of content, inside it (a form, a card): use `Alert`.
- A field error: use the field's error message.
- A confirmation that needs a decision: use `Dialog`.
- The status of a record: use `Badge`.

### Banner, Alert and Toast

|             | Banner                                             | Alert                                   | Toast                                |
| ----------- | -------------------------------------------------- | --------------------------------------- | ------------------------------------ |
| Scope       | Page or section                                    | Inline, next to the content it explains | The app, in a corner                 |
| Lifetime    | Persistent, until resolved or dismissed            | Persistent while relevant               | Transient, auto-dismisses (pausable) |
| Shape       | Full width, flat, top and bottom border only       | Rounded card                            | Elevated overlay                     |
| Live region | None by default (it is on the page from the start) | Polite status by default                | Always announced                     |

## Anatomy

```
div[role=alert | status | none]  (tinted surface, 1px tinted top and bottom border, full width)
  Icon (decorative)  info | success | warning (triangle) | danger
  content
    VisuallyHidden   "Information" | "Success" | "Warning" | "Error"
    title            optional, 14/22, weight 500
    children         text-2, on the same line as the title when it fits
  actions            action slot · dismiss IconButton
```

## Props

| Prop        | Type                                           | Default  | Notes                                                                 |
| ----------- | ---------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `tone`      | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | `info` is neutral; the others tint border and background              |
| `title`     | `ReactNode`                                    |          | What is going on, one line                                            |
| `children`  | `ReactNode`                                    |          | Why, and what to do                                                   |
| `action`    | `ReactNode`                                    |          | One link or small `Button`                                            |
| `onDismiss` | `() => void`                                   |          | Shows the dismiss button; the parent removes the banner               |
| `urgent`    | `boolean`                                      | `false`  | `role="alert"` (assertive). Only when it appears while the user works |
| `announce`  | `boolean`                                      | `false`  | `role="status"` (polite), for a banner added after the page loaded    |
| `messages`  | `{ dismiss, info, success, warning, danger }`  |          | Per-instance overrides                                                |

Other `div` attributes and `ref` go to the root.

## Accessibility: role decisions

- **No role by default.** A banner is normally part of the page when it loads; screen readers read it in page order. A live region that never changes is noise.
- **`announce` gives `role="status"` (polite).** Use it when the banner is inserted after load (connection restored, session about to expire). Render the banner when the event happens and keep it mounted; do not render it hidden and unhide it.
- **`urgent` gives `role="alert"` (assertive).** Use it only for a `danger` or `warning` banner that appears dynamically and needs attention now (connection lost, session expired). A `danger` or `warning` banner that is on the page from the start must not be `urgent`: the tone does not imply urgency.
- **The tone is not only color and icon.** The icon is `aria-hidden`; a visually hidden prefix ("Error", "Warning", "Success", "Information", from messages) names the kind of banner.
- The **dismiss button** is an `IconButton` named "Dismiss banner" (messages), reachable by Tab and operated with Enter or Space. After dismissing, move focus somewhere sensible if the banner held it.
- Text contrast on the tinted backgrounds is at least 4.5:1 (checked in the browser test with the real computed colors). The tints are component tokens (`--ds-banner-*`).
- Reflow: the text and the actions wrap; at 320 px the action moves below the text.

## Content rules

- Title: what is going on, sentence case, no exclamation marks ("Trial ends in 3 days").
- Text: why and what to do, one or two sentences.
- The action is a verb plus object ("Choose plan"), not "Click here".
- Do not stack more than one banner per page area.

## Examples

```tsx
<Banner title="Scheduled maintenance">Sunday, 02:00 to 03:00 UTC.</Banner>

<Banner
  tone="warning"
  title="Trial ends in 3 days"
  action={<Button size="sm">Choose plan</Button>}
  onDismiss={() => setHidden(true)}
>
  Choose a plan to keep your data.
</Banner>

<Banner tone="danger" urgent title="Connection lost">
  Changes are not being saved.
</Banner>
```
