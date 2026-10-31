# ApprovalCard

Status: experimental

A reply waiting for approval: the original message, an editable draft written by an agent, an optional warning and two actions, send and discard. Import it from `@loui/ds/patterns`.

- Handoff source: `components/agents/ApprovalCard` (TODO `CMP-AGT-02`).

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

## Props

| Prop                                       | Type                                    | Default      | Notes                                                                                       |
| ------------------------------------------ | --------------------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| `kind`                                     | `'question' \| 'review'`                | `'question'` | Badge text from messages.                                                                   |
| `author`                                   | `string`                                |              | Mono, part of the accessible name.                                                          |
| `rating`                                   | `number`                                |              | Reviews only; halves allowed.                                                               |
| `itemName` / `itemColor`                   | `string`                                |              | Item reference; the color is a decorative `Swatch` (hex).                                   |
| `when` / `whenDateTime`                    | `ReactNode` / `string`                  |              | Display text and ISO date for `<time>`.                                                     |
| `message`                                  | `ReactNode`                             | required     | The original message.                                                                       |
| `draft` / `defaultDraft` / `onDraftChange` | `string` / `string` / `(draft) => void` |              | Controlled or uncontrolled draft.                                                           |
| `flag`                                     | `ReactNode`                             |              | Warning text. Linked with `aria-describedby`.                                               |
| `onSend` / `onDiscard`                     | `() => void`                            |              | Run the action now and offer Undo.                                                          |
| `headingLevel`                             | `1`-`6`                                 | `3`          |                                                                                             |
| `messages`                                 | partial catalog                         |              | `kindQuestion`, `kindReview`, `messageLabel`, `draftLabel`, `draftHint`, `send`, `discard`. |

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

## Differences from the handoff

- The `section` has an accessible name (`article` named by a real heading).
- Strings (kind, labels, buttons) come from messages; the Portuguese originals are the `pt-BR` catalog. Buttons say "Send reply" / "Discard reply".
- The item dot uses `Swatch`; spacing uses `--ds-approval-card-*` tokens; the textarea is the design system `Textarea`.
- The flag is linked as the card's description and has an icon, not only a colored dot.
- Documented: Send and Discard are secondary/ghost, and undo is a toast.
