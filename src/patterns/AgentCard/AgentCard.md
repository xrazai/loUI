# AgentCard

Status: experimental

A card that represents one AI agent: icon, name, status, description and a footer with the last activity and the number of items waiting for approval. The whole card opens the agent. Import it from `@loui/ds/patterns`.

- Handoff source: `components/agents/AgentCard` (TODO `CMP-AGT-01`).

## When to use

- A grid of agents (or automations) on an overview page, each leading to its own screen.
- To make "what needs me" visible: the accent number is the only call for attention on the card.

## When not to use

- A generic clickable card of any other content: build it with `Card` and the same stretched-link technique.
- Several actions per card: this card has exactly one (open). Put other actions on the agent's own screen.

## Pattern decision: stretched link

The card needs to be fully clickable, show a status badge and still have a clean accessible name. Three options were weighed:

1. Wrap the card in a link or button: the accessible name becomes the concatenation of every text inside (name, caption, status, description, footer), and block content inside a `<button>` is invalid HTML.
2. `div role="button"` (the handoff): no native semantics, and a badge nested in a button.
3. **Stretched link (chosen)**: the agent name, inside the heading, is the only real link or button. A `::after` pseudo-element on it covers the card, so a click anywhere activates it. The accessible name is just the agent name; the status, description and footer are the accessible description (`aria-describedby`). No nested interactive elements.

The focus ring is drawn around the whole card (`:has()` on the focused link), hover brightens the card border.

## Anatomy

```
div (card, data-status)
  header
    icon box (decorative)
    h{headingLevel} > a | button   <- the only interactive element, stretched over the card
    area caption
    Badge (status)
  p description
  footer
    last activity text
    pending: accent number + "to approve"
```

## Props

| Prop           | Type                                          | Default    | Notes                                                                                      |
| -------------- | --------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `name`         | `string`                                      | required   | Accessible name of the link or button.                                                     |
| `area`         | `string`                                      |            | Caption under the name.                                                                    |
| `icon`         | `IconComponent`                               |            | Any Lucide icon (curated set or passed in). Decorative.                                    |
| `description`  | `ReactNode`                                   |            | One or two sentences.                                                                      |
| `status`       | `'testing' \| 'active' \| 'paused' \| 'soon'` | `'active'` | Text from messages. `soon` is not interactive (dashed).                                    |
| `pending`      | `number`                                      | `0`        | Shown only above zero and when available.                                                  |
| `lastActivity` | `ReactNode`                                   |            | Footer text. `soon` without it shows "Not set up yet".                                     |
| `href`         | `string`                                      |            | Renders a real `<a>`; router-aware through `DSProvider`.                                   |
| `onOpen`       | `() => void`                                  |            | Press handler. Without `href` the element is a `<button>`.                                 |
| `headingLevel` | `1`-`6`                                       | `3`        | Level of the name heading.                                                                 |
| `messages`     | partial catalog                               |            | `statusTesting`, `statusActive`, `statusPaused`, `statusSoon`, `notConfigured`, `pending`. |

Place the cards in a `ul` when they form a list; the grid is yours (for example `repeat(auto-fill, minmax(320px, 1fr))`, 16 px gap).

## Accessibility

- One tab stop per available card; `Enter` activates a link or button, `Space` also a button.
- The status is text in a `Badge` (color and dot only reinforce it) and is part of the description, so it is read after the name.
- A `soon` card has no link or button and no tab stop; the heading and the "Coming soon" badge say why.
- Count: "4 to approve" is real text in reading order (the number is just styled), pluralized and number-formatted through messages and `Intl`.
- Contrast: the caption and last-activity text use `--ds-text-3` on the surface (passes 4.5:1 there; do not move the card onto a raised surface). Forced colors: the ring becomes a `Highlight` outline.

## Content rules

- Name: the agent's job in two or three words. Description: what it does and that you approve, in one or two sentences.
- Last activity in the past tense with a time: "Last reply sent at 08:40". Do not add decorative metrics.

## Examples

```tsx
<AgentCard
  name="Marketplace agent"
  area="Marketplace"
  icon={ShoppingBag}
  status="active"
  pending={4}
  description="Answers buyer questions and reviews. You approve before it sends."
  lastActivity="Last reply sent at 08:40"
  href="/agents/marketplace"
/>
<AgentCard name="Chat agent" status="soon" description="Will draft orders from the conversation." />
```

## Differences from the handoff

- A real link or button (stretched link) instead of `div role="button"` with a nested badge.
- `soon` is not interactive and not focusable.
- Icon is a Lucide component drawn by `Icon` (the handoff fetched an SVG from a CDN at runtime).
- Status labels, "Not set up yet" and "to approve" come from messages (pluralized, localized); the number uses `Intl`.
- Sizes and spacing are `--ds-agent-card-*` tokens; no `style` prop; no JS hover state.
