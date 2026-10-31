# ApprovalCard

> A reply waiting for approval: the original message, an editable draft written by an agent
> and two actions, send and discard.

It is an `article` named by its heading ("Review buyer_sp"). Send and discard are secondary
and ghost buttons on purpose: a screen has many of these cards and only one primary action.
They act immediately; the consumer shows an Undo toast instead of asking for confirmation.

A reply waiting for approval: the original message, an editable draft written by an agent, an optional warning and two actions, send and discard. Import it from `@loui/ds/patterns`.

- Handoff source: `components/agents/ApprovalCard` (TODO `CMP-AGT-02`).

- Import: `import { ApprovalCard } from '@loui/ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/ApprovalCard/ApprovalCard.tsx`
- Stories (Storybook title `Patterns/ApprovalCard`): Default, Review, LowRatingWithFlag, Minimal, LongText, RightToLeft, SendWithUndo

## Props

| Prop            | Type                                                                                                                                                 | Required | Default      | Description                                                                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message`       | `ReactNode`                                                                                                                                          | yes      |              | The original message the draft answers. Plain text or nodes.                                                                                                                            |
| `kind`          | `'question' \| 'review'`                                                                                                                             |          | `'question'` | What is being answered: a `question` or a `review`. Shown as a text badge. Default `question`.                                                                                          |
| `author`        | `string`                                                                                                                                             |          |              | Who wrote it (a username or code). Shown in mono and part of the card's accessible name.                                                                                                |
| `itemName`      | `string`                                                                                                                                             |          |              | Reference to the item the message is about (a product or order name).                                                                                                                   |
| `itemColor`     | `string`                                                                                                                                             |          |              | Hex color (`#rgb` or `#rrggbb`) shown as a dot before `itemName`. Decorative: `itemName` must name it.                                                                                  |
| `when`          | `ReactNode`                                                                                                                                          |          |              | When it was written, as display text ("today, 10:40").                                                                                                                                  |
| `whenDateTime`  | `string`                                                                                                                                             |          |              | Machine-readable date for `when` (an ISO string). Renders a `<time>`.                                                                                                                   |
| `rating`        | `number`                                                                                                                                             |          |              | Star rating of a `review` (0 to 5, halves allowed). Shown only for reviews.                                                                                                             |
| `draft`         | `string`                                                                                                                                             |          |              | Controlled value of the draft reply.                                                                                                                                                    |
| `defaultDraft`  | `string`                                                                                                                                             |          |              | Initial value of the draft when uncontrolled.                                                                                                                                           |
| `onDraftChange` | `(draft: string) => void`                                                                                                                            |          |              | Called with the new text whenever the draft is edited.                                                                                                                                  |
| `flag`          | `ReactNode`                                                                                                                                          |          |              | Warning shown above the actions (for example "2-star review: read it carefully before sending"). Linked to the card as its description. Reviews of 1 to 3 stars should always have one. |
| `onSend`        | `() => void`                                                                                                                                         |          |              | Called when the send button is pressed. Do it now and offer Undo with a toast; do not ask to confirm.                                                                                   |
| `onDiscard`     | `() => void`                                                                                                                                         |          |              | Called when the discard button is pressed. Do it now and offer Undo with a toast.                                                                                                       |
| `headingLevel`  | `'1' \| '2' \| '3' \| '4' \| '5' \| '6'`                                                                                                             |          | `'3'`        | Heading level of the card heading (`h1` to `h6`). Default `3`.                                                                                                                          |
| `messages`      | `Partial<{ kindQuestion: string; kindReview: string; messageLabel: string; draftLabel: string; draftHint: string; send: string; discard: string; }>` |          |              | Override the built-in messages for this instance.                                                                                                                                       |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ ApprovalCard: { ... } }}>`.

| Key            | English default               | Notes                                                                             |
| -------------- | ----------------------------- | --------------------------------------------------------------------------------- |
| `kindQuestion` | `Question`                    | Kind badge and the first word of the accessible name.                             |
| `kindReview`   | `Review`                      |                                                                                   |
| `messageLabel` | `Customer message`            | Visually hidden label before the original message.                                |
| `draftLabel`   | `Agent reply`                 | Label and hint of the editable draft.                                             |
| `draftHint`    | `You can edit before sending` |                                                                                   |
| `send`         | `Send reply`                  | Verb plus object buttons. The card's heading describes which card they belong to. |
| `discard`      | `Discard reply`               |                                                                                   |

## Design tokens used

`--ds-approval-card-body-padding-block`, `--ds-approval-card-gap`, `--ds-approval-card-header-min-height`, `--ds-approval-card-header-padding-block`, `--ds-approval-card-padding`, `--ds-bg`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-lh-small`, `--ds-line`, `--ds-line-subtle`, `--ds-radius-lg`, `--ds-radius-md`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-surface`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-warning`, `--ds-weight-medium`

## When to use

- An approval queue: replies, messages or changes an agent prepared that go to a customer or touch money.
- Any "review the draft, edit it, send or discard it" step with many items on one screen.

## When not to use

- A single decision with a consequence you cannot take back: use a `Dialog` with a confirmation.
- Free chat with an agent: use `ChatPanel`.

## Principles

**Approve before sending.** Anything an agent writes to a customer goes through this card first. The draft is editable ("You can edit before sending"). Reviews of 1 to 3 stars always carry a `flag`.

**Undo, don't confirm.** Send and discard act immediately. Do not open a confirmation dialog; show a toast with **Undo** (see the recipe below). A confirmation for every card would train people to click through it.

**Secondary buttons, on purpose.** A screen has many cards and only one primary action (AGENTS.md section 5). Send is `secondary`, Discard is `ghost`. The button text is verb plus object ("Send reply", "Discard reply"), not a bare "Send".

## Anatomy

```
article (named by the heading)
  header
    h{headingLevel}    Badge (Question | Review) + author in mono   <- the accessible name
    Rating             reviews only
    item               optional Swatch dot + item name
    time               when
  body
    message            original text, visually hidden label "Customer message:"
    Textarea           label "Agent reply", aside "You can edit before sending"
    flag               optional warning (icon + text), the card's description
    actions            Discard (ghost)                 Send (secondary)
```

## Undo recipe

```tsx
function Queue() {
  const toast = useToast();
  function send(reply: Reply) {
    const previous = reply.state; // save what you need to reverse
    markSent(reply.id); // 1. do it now
    toast.success('Reply sent', {
      // 2. say so, past tense
      action: { label: 'Undo', onPress: () => restore(reply.id, previous) }, // 3. reverse it
    });
  }
  return replies.map((reply) => (
    <ApprovalCard
      key={reply.id}
      {...reply}
      onSend={() => send(reply)}
      onDiscard={() => discard(reply)}
    />
  ));
}
```

The real side effect (actually sending to the customer) should be held for the undo window, or undone by a compensating action; see the Toast documentation. After send or discard, remove the card from the queue and move focus to the next card's heading or to the list, so keyboard focus is not lost.

## Accessibility

- `article` named by its heading through `aria-labelledby` ("Review buyer_sp"); with several cards, screen reader users can jump by heading or article.
- The two buttons are described by the heading (`aria-describedby`), so "Send reply, Review buyer_sp" is spoken without making every button name unique.
- The kind is a text badge, the rating is an image with a text alternative, the flag is text with a decorative icon: nothing relies on color alone. The flag uses `--ds-warning` on the surface (4.5:1 or better).
- Tab order follows reading order: draft, Discard, Send. The draft is a real labelled `Textarea` (its hint is the field description).
- The original message is announced after a hidden "Customer message:" label.

## Content rules

- The draft is a customer-facing reply: short, factual, no promises about delivery time or discounts, no emoji (AGENTS.md section 5). That is the agent's job; the card only makes it visible and editable.
- `flag` explains the risk and what to do: "2-star review: read it carefully before sending."

## Related components

- Instead, see Dialog: A single decision with a consequence you cannot take back: use a `Dialog` with a confirmation.
- Instead, see ChatPanel: Free chat with an agent: use `ChatPanel`.
- Renders: Badge, Button, Icon, Rating, Swatch, Textarea, VisuallyHidden
