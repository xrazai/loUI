# AgentCard

> A card for one agent: icon, name, status, description and a footer with the last activity
> and the number of items waiting for approval.

The whole card is clickable through the "stretched link" pattern: the agent name inside the
heading is the only link (or button), and a pseudo-element extends its hit area over the
card. The accessible name is just the agent name; status, description and footer are the
description. There is no nested interactive element and no `role="button"` on a `div`.

A card that represents one AI agent: icon, name, status, description and a footer with the last activity and the number of items waiting for approval. The whole card opens the agent. Import it from `@loui/ds/patterns`.

- Handoff source: `components/agents/AgentCard` (TODO `CMP-AGT-01`).

- Import: `import { AgentCard } from '@loui/ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/AgentCard/AgentCard.tsx`
- Stories (Storybook title `Patterns/AgentCard`): Default, Testing, Paused, ComingSoon, AsLink, NothingPending, LongText, WithoutIcon, Grid, RightToLeft

## Props

| Prop           | Type                                                                                                                                                         | Required | Default    | Description                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | `string`                                                                                                                                                     | yes      |            | Name of the agent. It is the accessible name of the card's single link or button.                                                                              |
| `area`         | `string`                                                                                                                                                     |          |            | Short caption under the name (the area the agent works in).                                                                                                    |
| `icon`         | `LucideIcon`                                                                                                                                                 |          |            | Icon of the agent: any icon of the curated set (for example `SearchIcon`) or another Lucide icon. Decorative.                                                  |
| `description`  | `ReactNode`                                                                                                                                                  |          |            | One or two sentences about what the agent does. Part of the accessible description.                                                                            |
| `status`       | `'testing' \| 'active' \| 'paused' \| 'soon'`                                                                                                                |          | `'active'` | Lifecycle of the agent. `testing`, `active` and `paused` are available. `soon` is not interactive: dashed border, no link, no pending count. Default `active`. |
| `pending`      | `number`                                                                                                                                                     |          | `0`        | Number of items waiting for approval. Shown (accent number plus text) only when above zero and the agent is available.                                         |
| `lastActivity` | `ReactNode`                                                                                                                                                  |          |            | Text about the last activity ("Last reply sent at 08:40"). Shown in the footer.                                                                                |
| `href`         | `string`                                                                                                                                                     |          |            | Destination of the card. Renders a real link (router-aware through `DSProvider`).                                                                              |
| `onOpen`       | `() => void`                                                                                                                                                 |          |            | Called when the card is activated. Without `href` it renders a real button.                                                                                    |
| `headingLevel` | `'1' \| '2' \| '3' \| '4' \| '5' \| '6'`                                                                                                                     |          | `'3'`      | Heading level of the agent name (`h1` to `h6`). Default `3`.                                                                                                   |
| `messages`     | `Partial<{ statusTesting: string; statusActive: string; statusPaused: string; statusSoon: string; notConfigured: string; pending: (n: number) => string; }>` |          |            | Override the built-in messages for this instance.                                                                                                              |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ AgentCard: { ... } }}>`.

| Key                  | English default  | Notes                                                                          |
| -------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `statusTesting`      | `In testing`     | Status badge text.                                                             |
| `statusActive`       | `Active`         |                                                                                |
| `statusPaused`       | `Paused`         |                                                                                |
| `statusSoon`         | `Coming soon`    |                                                                                |
| `notConfigured`      | `Not set up yet` | Footer text of a card that is not available yet and has no last-activity text. |
| `pending(n: number)` | `to approve`     | Text after the (separately styled) pending number: "4 to approve".             |

## Design tokens used

`--ds-accent`, `--ds-agent-card-gap`, `--ds-agent-card-icon-box-size`, `--ds-agent-card-min-height`, `--ds-agent-card-padding`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-body`, `--ds-fs-heading`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-lh-body`, `--ds-lh-heading`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-line`, `--ds-line-strong`, `--ds-line-subtle`, `--ds-radius-lg`, `--ds-radius-md`, `--ds-radius-sm`, `--ds-space-2`, `--ds-space-3`, `--ds-surface`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-semibold`

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

## Related components

- Instead, see Card: A generic clickable card of any other content: build it with `Card` and the same stretched-link technique.
- Renders: Badge, Icon
