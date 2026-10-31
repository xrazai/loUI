# Badge

Status: experimental

A pill with a short status label. The text always states the status; the tone and the dot only reinforce it.

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

## Props

| Prop        | Type                                                          | Default     | Notes                                                                            |
| ----------- | ------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| `tone`      | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | `accent` open or in progress, `success` done, `warning` pending, `danger` failed |
| `dot`       | `boolean`                                                     | `true`      | Decorative dot before the text                                                   |
| `children`  | `ReactNode`                                                   | required    | The status text                                                                  |
| `className` | `string`                                                      |             | Merged with the component class                                                  |

Other `span` attributes and `ref` are passed to the root element.

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

## Differences from the handoff

- Tones use only the semantic tokens (`--ds-*-soft`). The handoff built the danger tint with a different `color-mix` (14%) than the token (10%); the token is now the single source.
- Height, dot size and padding are component tokens (`--ds-badge-*`).
- The dot is explicitly decorative; `children` is required.
- No `style` prop.
