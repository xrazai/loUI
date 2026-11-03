# Banner

> A persistent, full-width message for a whole page or section: maintenance, a limited account,
> an offline mode. It stays until the condition ends or the user dismisses it.
> The icon is decorative and a visually hidden prefix names the tone for screen readers.

A persistent, full-width message for a whole page or section: maintenance, a limited account, an offline mode. It has a tone, an icon, an optional title, one action and an optional dismiss button.

- Import: `import { Banner } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Banner/Banner.tsx`
- Stories (Storybook title `Components/Banner`): Default, Success, Warning, Danger, Urgent, Announced, TitleOnly, TextOnly, Dismissible, LongText, AllTones, RightToLeft

## Props

| Prop        | Type                                                                                            | Required | Default  | Description                                                                                                                                                                                                                                                                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone`      | `'info' \| 'success' \| 'warning' \| 'danger'`                                                  |          | `'info'` | Kind of message: `info` (neutral, default), `success`, `warning` or `danger`.                                                                                                                                                                                                                                                                        |
| `title`     | `ReactNode`                                                                                     |          |          | Short heading in one line: what is going on. Plain text, not a document heading.                                                                                                                                                                                                                                                                     |
| `children`  | `ReactNode`                                                                                     |          |          | The detail: why, and what to do. Keep it to one or two sentences.                                                                                                                                                                                                                                                                                    |
| `action`    | `ReactNode`                                                                                     |          |          | A single action next to the text, usually a link or a small `Button` ("Update card").                                                                                                                                                                                                                                                                |
| `onDismiss` | `() => void`                                                                                    |          |          | Shows a dismiss button that calls this. The banner is removed by the parent.                                                                                                                                                                                                                                                                         |
| `urgent`    | `boolean`                                                                                       |          | `false`  | The banner appears while the user is working and interrupts the task, so it must be announced immediately (`role="alert"`, assertive). Only for a failure the user must know about right now. A banner that is on the page from the start never needs it.                                                                                            |
| `announce`  | `boolean`                                                                                       |          | `false`  | Whether the banner is a live region (`role="status"`, polite). Default `false`, because a banner is usually part of the page when it loads and a live region that never changes is noise. Set `true` when the banner is added to the page after load (a lost connection that is restored, a session that is about to expire). Ignored when `urgent`. |
| `messages`  | `Partial<{ dismiss: string; info: string; success: string; warning: string; danger: string; }>` |          |          | Per-instance overrides of the built-in messages.                                                                                                                                                                                                                                                                                                     |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `tone`: `info`, `success`, `warning`, `danger`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Banner: { ... } }}>`.

| Key       | English default  | Notes                                                                                                  |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------ |
| `dismiss` | `Dismiss banner` | Name of the dismiss button.                                                                            |
| `info`    | `Information`    | Visually hidden prefix that tells screen reader users the kind of banner; color and icon alone cannot. |
| `success` | `Success`        |                                                                                                        |
| `warning` | `Warning`        |                                                                                                        |
| `danger`  | `Error`          |                                                                                                        |

## Design tokens used

`--ds-accent`, `--ds-banner-content-basis`, `--ds-banner-danger-bg`, `--ds-banner-danger-border`, `--ds-banner-success-bg`, `--ds-banner-success-border`, `--ds-banner-warning-bg`, `--ds-banner-warning-border`, `--ds-bg`, `--ds-danger`, `--ds-fs-small`, `--ds-lh-small`, `--ds-line`, `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-success`, `--ds-text`, `--ds-text-2`, `--ds-warning`, `--ds-weight-medium`

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

## Related components

- Instead, see Alert: A message about one piece of content, inside it (a form, a card): use `Alert`.
- Instead, see Dialog: A confirmation that needs a decision: use `Dialog`.
- Instead, see Badge: The status of a record: use `Badge`.
- Renders: Icon, IconButton, VisuallyHidden
