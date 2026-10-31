# ApprovalQueue

Status: experimental

A queue of replies written by an agent that wait for a person to approve them before anything reaches a customer. Tabs split "To approve" from "Sent"; Send and Discard act at once and offer Undo.

Components: `ApprovalCard` (from `@loui/ds/patterns`), `Tabs`, `EmptyState`, `Badge`, `Toast` (through `useUndoable`).

## When to use

- Anything that goes to a customer or touches money: replies, messages, refunds. "Approve before sending" is the default (AGENTS.md section 5, agent principle 1).
- Reviews of 1 to 3 stars always get a warning (agent principle 2).

## When not to use

- Talking to the agent: use `ChatPanel`. The chat is for the owner, not for customers.
- A single yes/no with a consequence you cannot take back: use a `ConfirmDialog`.

## What it does

- **Cards** show the original message, the editable draft ("You can edit before sending") and, for low-star reviews, a warning: "2-star review: read it carefully before sending."
- **Undo, don't confirm.** Send and Discard happen immediately: the card leaves the queue and a toast says "Reply to buyer_sp sent" with **Undo**. Discard works the same way.
- **The real send waits.** `sendReply` runs only when the Undo window closes, with the edited draft. Undo or Discard means it never runs. If sending fails, the card returns to the queue and an error toast stays.
- **Tabs:** "To approve" and "Sent" with counts and sentence-length labels for screen readers ("2 waiting"). Arrow keys move between tabs.
- **Empty states:** "Nothing to review. New approvals appear here as they arrive."
- After an action, focus moves to the "Replies" heading, so keyboard users do not land on the page body.

## Things to keep when you adapt it

- Customer-facing text stays short, factual and free of promises about delivery times or discounts, and has no emoji. That is the agent's job; the queue only makes it reviewable.
- Do not add a confirmation dialog per card. It trains people to click through.
- Keep drafts in state above the cards (`draft` and `onDraftChange`), so an edit survives a tab change.

## Code

<!-- recipe-source:start -->

```tsx
import { useRef, useState } from 'react';
import {
  Badge,
  EmptyState,
  Heading,
  Inline,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  useUndoable,
} from '@loui/ds';
import { ApprovalCard } from '@loui/ds/patterns';

type State = 'pending' | 'sent' | 'discarded';

export interface Reply {
  id: string;
  kind: 'question' | 'review';
  author: string;
  message: string;
  draft: string;
  rating?: number;
  state: State;
}

const REPLIES: Reply[] = [
  {
    id: 'r-1',
    kind: 'question',
    author: 'buyer_sp',
    message: 'Do you have this in mustard yellow?',
    draft: 'Hello. We have this in black, navy and grey. Mustard is not available.',
    state: 'pending',
  },
  {
    id: 'r-2',
    kind: 'review',
    author: 'mara_k',
    rating: 2,
    message: 'The color is different from the photos.',
    draft:
      'Thank you for the feedback. Screens can change colors slightly. We can arrange a return.',
    state: 'pending',
  },
];

export interface ApprovalQueueProps {
  initialReplies?: Reply[];
  /** Sends the approved reply to the customer. Runs after the Undo window closes. */
  sendReply?: (reply: Reply) => Promise<void>;
}

/**
 * Anything that goes to a customer waits for approval. Send and Discard act at once and offer
 * Undo instead of asking to confirm; the message really leaves only when the Undo window
 * closes. Tabs split what is waiting from what was sent.
 */
export function ApprovalQueue({ initialReplies = REPLIES, sendReply }: ApprovalQueueProps) {
  const [replies, setReplies] = useState(initialReplies);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const undoable = useUndoable();

  const pending = replies.filter((reply) => reply.state === 'pending');
  const sent = replies.filter((reply) => reply.state === 'sent');

  function setState(id: string, state: State) {
    setReplies((list) => list.map((reply) => (reply.id === id ? { ...reply, state } : reply)));
  }

  function resolve(reply: Reply, state: 'sent' | 'discarded') {
    undoable.run({
      message: `Reply to ${reply.author} ${state}`,
      apply: () => {
        setState(reply.id, state);
      },
      revert: () => {
        setState(reply.id, 'pending');
      },
      commit: state === 'sent' ? () => sendReply?.(reply) : undefined,
    });
    // The card that had focus is gone: send focus to the queue heading.
    headingRef.current?.focus();
  }

  return (
    <Stack gap={4}>
      <Heading level={2} ref={headingRef} tabIndex={-1}>
        Replies
      </Heading>
      <Tabs>
        <TabList aria-label="Replies">
          <Tab id="pending" count={pending.length} countLabel={`${String(pending.length)} waiting`}>
            To approve
          </Tab>
          <Tab id="sent" count={sent.length} countLabel={`${String(sent.length)} sent`}>
            Sent
          </Tab>
        </TabList>
        <TabPanel id="pending">
          {pending.length === 0 ? (
            <EmptyState
              compact
              headingLevel={3}
              title="Nothing to review"
              description="New approvals appear here as they arrive."
            />
          ) : (
            <Stack gap={4}>
              {pending.map((reply) => (
                <ApprovalCard
                  key={reply.id}
                  kind={reply.kind}
                  author={reply.author}
                  message={reply.message}
                  {...(reply.rating === undefined ? {} : { rating: reply.rating })}
                  {...(reply.rating !== undefined && reply.rating <= 3
                    ? {
                        flag: `${String(reply.rating)}-star review: read it carefully before sending.`,
                      }
                    : {})}
                  draft={reply.draft}
                  onDraftChange={(draft) => {
                    setReplies((list) =>
                      list.map((item) => (item.id === reply.id ? { ...item, draft } : item)),
                    );
                  }}
                  onSend={() => {
                    resolve(reply, 'sent');
                  }}
                  onDiscard={() => {
                    resolve(reply, 'discarded');
                  }}
                />
              ))}
            </Stack>
          )}
        </TabPanel>
        <TabPanel id="sent">
          {sent.length === 0 ? (
            <EmptyState
              compact
              headingLevel={3}
              title="Nothing sent yet"
              description="Approved replies appear here."
            />
          ) : (
            <Stack as="ul" gap={2}>
              {sent.map((reply) => (
                <Inline as="li" key={reply.id} gap={3}>
                  <Badge tone="success">Sent</Badge>
                  <Text>{`Reply to ${reply.author}`}</Text>
                </Inline>
              ))}
            </Stack>
          )}
        </TabPanel>
      </Tabs>
    </Stack>
  );
}
```

<!-- recipe-source:end -->

## Verified by

`src/recipes/ApprovalQueue/ApprovalQueue.test.tsx` (warning on the low-star review, send and Undo without a dialog, discard, the edited draft reaching `sendReply` only after the window, a discarded reply never sent, empty state, keyboard and focus, tabs, axe) and the `Recipes/ApprovalQueue` stories.
