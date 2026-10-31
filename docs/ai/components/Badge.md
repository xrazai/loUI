# Badge

> A pill with a short status label. The text always states the status; the tone and the
> dot only reinforce it.

A pill with a short status label. The text always states the status; the tone and the dot only reinforce it.

- Import: `import { Badge } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Badge/Badge.tsx`
- Stories (Storybook title `Components/Badge`): Default, Accent, Success, Warning, Danger, WithoutDot, AllTones, LongText, RightToLeft

## Props

| Prop       | Type                                                          | Required | Default     | Description                                                                                                                                  |
| ---------- | ------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `children` | `ReactNode`                                                   | yes      |             | The status text. Required: color and the dot never carry the meaning alone.                                                                  |
| `tone`     | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` |          | `'neutral'` | Meaning of the badge: `accent` open or in progress, `success` done, `warning` pending, `danger` failed, `neutral` everything else (default). |
| `dot`      | `boolean`                                                     |          | `true`      | Shows the small decorative dot before the text. It is hidden from assistive technology. Default `true`.                                      |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `tone`: `neutral`, `accent`, `success`, `warning`, `danger`

## Design tokens used

`--ds-accent`, `--ds-accent-soft`, `--ds-badge-dot-size`, `--ds-badge-height`, `--ds-badge-padding-inline`, `--ds-danger`, `--ds-danger-soft`, `--ds-font-sans`, `--ds-fs-label`, `--ds-lh-label`, `--ds-radius-pill`, `--ds-space-2`, `--ds-success`, `--ds-success-soft`, `--ds-surface-hover`, `--ds-text-2`, `--ds-text-3`, `--ds-warning`, `--ds-warning-soft`, `--ds-weight-medium`

## When to use

- Show the state of a record in a list, a table row or a card header: Draft, In progress, Shipped, Failed.
- Keep the text short (one to three words, sentence case).

## When not to use

- For a count or a filter value: use `Tag`.
- For a message the user must read or act on: use `Alert`.
- For an action: use `Button`. A Badge is never interactive.

## Anatomy

```
[ dot ] Text
```

- `dot` (optional, decorative, `aria-hidden`).
- `text`: required, the status.

## Accessibility

- A Badge is plain text in a `span`: there is no role and no keyboard behavior.
- The dot is `aria-hidden`; the tone is never the only carrier of meaning, because the text names the status (WCAG 1.4.1).
- Text on every soft tint keeps at least 4.5:1 contrast (checked in the browser test by compositing the real computed colors).
- In forced-colors mode the Badge gets a border and the dot takes the text color.

## Content rules

- Sentence case, no punctuation, no emoji: "In progress", not "IN PROGRESS!".
- Name the state, not the action: "Shipped", not "Ship".
- If the status can be unknown, say so with text ("Unknown"), do not omit the Badge.

## Examples

```tsx
<Badge tone="success">Shipped</Badge>
<Badge tone="danger">Failed</Badge>
<Badge dot={false}>Draft</Badge>
```

## Related components

- Instead, see Tag: For a count or a filter value: use `Tag`.
- Instead, see Alert: For a message the user must read or act on: use `Alert`.
- Instead, see Button: For an action: use `Button`. A Badge is never interactive.
- Used by: AgentCard, ApprovalCard
