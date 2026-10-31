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
} from '../../index';
import { ApprovalCard } from '../../patterns';

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
