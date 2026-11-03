# ChatPanel

Status: experimental

A chat panel for talking to an agent: header with a Clear action, a message log, suggested prompts when empty, and a composer. It supports streaming replies, Stop and Retry. Import it from `loui-ds/patterns`.

- Handoff source: `components/agents/ChatPanel` (TODO `CMP-AGT-03`; groundwork for `AI-013`).

## When to use

- A side panel where the owner tests an agent, asks why it did something or asks for an adjustment.
- Any short, owner-facing conversation with an assistant.

## When not to use

- Customer-facing conversations: the chat is for the owner. Anything that goes to a customer must pass through an approval queue (`ApprovalCard`), never straight from the chat.
- A one-shot prompt with a single answer: use a form.
- Rich documents as replies: render those in the page and keep the chat short.

## Anatomy

```
section (named by the heading)
  header          h{headingLevel} title + Clear (ghost, only with messages and onClear)
  viewport
    div[role=log][aria-live=off][tabindex=0]
      intro + suggested prompts (group)    only while empty
      message rows (user right, assistant left, error with Retry)
      "Thinking…" row                      while busy or a reply has no text yet
    Jump to latest                         only when scrolled away from the end
  div[role=status][aria-live=polite]       visually hidden announcer
  composer        Textarea (Enter sends) + one button: Send message | Stop generating
```

## Props

| Prop                                     | Type                         | Default                                                  | Notes                                                                                      |
| ---------------------------------------- | ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `items`                                  | `ChatMessage[]`              | required                                                 | The conversation, oldest first. (Named `items` because `messages` overrides the catalog.)  |
| `busy`                                   | `boolean`                    | `false`                                                  | Waiting for the first part of a reply.                                                     |
| `busyLabel` / `busyIndicator`            | `string` / `ReactNode`       | "Thinking…" / `Spinner`                                  | Text of the busy row (also announced) and a replacement for its spinner (`null` for none). |
| `getKey`                                 | `(message, index) => string` | `id`, else role + position                               | React key and history detection. Pass it when messages are inserted or removed mid-list.   |
| `onSend`                                 | `(text: string) => void`     |                                                          | Trimmed text. Called from Enter, the button and the suggested prompts.                     |
| `onStop`                                 | `() => void`                 |                                                          | Stop generating. The button is disabled while working without it.                          |
| `onRetry`                                | `(message) => void`          |                                                          | Shows Retry on failed messages.                                                            |
| `onClear`                                | `() => void`                 |                                                          | Shows Clear when there are messages.                                                       |
| `intro` / `prompts`                      | `ReactNode` / `string[]`     |                                                          | Empty state.                                                                               |
| `renderContent`                          | `(message) => ReactNode`     | plain text                                               | Plug in a sanitized renderer (see below).                                                  |
| `sendVariant`                            | `'secondary' \| 'primary'`   | `'secondary'`                                            | See "Send button".                                                                         |
| `title` / `headingLevel` / `placeholder` |                              | "Chat with the agent" / `2` / "Ask or request something" |                                                                                            |
| `messages`                               | partial catalog              |                                                          | Every string, including the announcements.                                                 |

`ChatMessage`: `{ id?: string; role: 'user' | 'assistant'; content: string; status?: 'complete' | 'streaming' | 'error' }`. `id` is optional so `{ role, content }` objects work as they are. Without it the key is the role plus the position among messages of the same role (`user-0`, `assistant-1`), which is stable while the list only grows. If you insert, remove or reorder messages, give each one an `id` or pass `getKey`; keys must be unique and stable across renders. Never use the array index.

## Streaming and live regions (research notes)

Sources: practitioner write-ups on accessible streaming chat UIs (azukiazusa.dev, tianpan.co), an IDE chat-panel pull request (TrixtyAI/ide#172) and the WAI-ARIA `log` role. There is no formal standard for streamed AI output; this is current practice, not tested with every screen reader.

- `role="log"` is the right role for a chat transcript (implicit polite live region, history in reading order). But a streamed reply rewrites one node many times, and a live region then reads it in fragments (or repeats it).
- Common practice (and what chat products do): keep the streaming text **out** of the live region, announce a short status while it generates, and announce the result once when complete.

What `ChatPanel` does:

1. The list is `role="log"` with `aria-live="off"`: a labelled, focusable (`tabindex=0`, so it can be scrolled with the keyboard) transcript that screen reader users can read in order, without automatic announcements. It sets `aria-busy` while a reply is being produced.
2. A separate visually hidden `role="status"` (polite, atomic) announces: **"Thinking…"** while `busy`, **"The assistant is responding"** while a message is `streaming` (one announcement, not one per token), and **"Assistant: <full reply>"** once when the message becomes `complete` (or **"Error: …"** when it fails).
3. The user's own messages are never announced (they just typed them). Messages present on first render are history and are not announced.
4. The author ("You", "Assistant", "Error") is a visually hidden prefix of every message, since alignment and color are the only visual cue.

Not done: a "regenerate" action (only Retry for failed replies), and chunked announcements for very long replies.

## Behavior

- **Composer.** Enter sends, Shift+Enter inserts a new line. Enter is ignored while an **IME composition** is active (`isComposing`, and `keyCode 229` for Safari), so committing a CJK candidate never sends. Whitespace-only text is not sent. The field is not disabled while the assistant works, so the user can prepare the next message; sending is disabled meanwhile.
- **Send / Stop.** One button changes its label and action (Send message, Stop generating), so keyboard focus is not lost when a reply starts. With no `onStop` it is disabled while working.
- **Scroll anchoring.** The list follows new content only while the user is within a small distance of the bottom. If they scroll up to read, nothing moves, and "Jump to latest" appears. Sending a message returns to the bottom. No smooth scrolling is used, so `prefers-reduced-motion` needs no special handling; the spinner is already static under reduced motion.
- **Suggested prompts** send immediately. The chat is owner-facing and nothing leaves it.

## Send button: secondary by default

The panel normally sits beside the page's main task (an agent screen), and the screen already has its one primary action, so Send is `secondary`. When the chat is the main task of the page, pass `sendVariant="primary"`. One primary per screen.

## Content policy: plain text by default

Messages render as **plain text with line breaks**. The design system never uses `dangerouslySetInnerHTML` and ships no markdown library. To show markdown, pass `renderContent` and return **React elements** from a renderer that sanitizes its input (a markdown-to-React library that does not allow raw HTML, with an allow-list of elements and URL schemes). `renderContent` runs for every message, including while it streams, so it must tolerate incomplete markdown. The story "CustomRenderer" shows the shape.

## Accessibility

- Region named by its heading; composer named "Message"; prompts in a group named "Suggested prompts"; Clear and Retry are real buttons.
- Keyboard: Tab order is header (Clear), the log (scroll with arrows and Page keys), Jump to latest when shown, composer, the Send/Stop button. Prompts are buttons in the log while empty.
- Error messages use text ("Error:" prefix, hidden), a danger border and danger text: color is never the only cue.
- Forced colors: the borders and focus use system colors through the shared tokens (outlines are transparent, not removed).

## Content rules

- Title and buttons are sentence case, verb plus object: "Clear conversation", "Send message", "Stop generating".
- Errors say how to fix: "The agent could not answer. Check your connection and try again."
- The agent never sends anything to a customer from this chat.

## Examples

```tsx
function AgentChat() {
  const [items, setItems] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  // onSend: append the user message, set busy, then append an assistant message with
  // status 'streaming' and grow its content; set status 'complete' (or 'error') at the end.
  return (
    <ChatPanel
      items={items}
      busy={busy}
      intro="Test replies or ask for changes."
      prompts={['Summarize today’s questions']}
      onSend={ask}
      onStop={abort}
      onRetry={retry}
      onClear={() => setItems([])}
    />
  );
}
```

## Differences from the handoff

- Messages are keyed by stable `id` instead of the array index; `status` adds streaming and error states.
- Enter ignores IME composition; Stop, Retry, scroll anchoring and Jump to latest are new.
- The log no longer announces every change: the live-region design above replaces `aria-live="polite"` on the list.
- Strings are in the catalog (including `pt-BR`); the composer is the design system `Textarea`; the Send button is the design system `Button` (secondary by default instead of a hand-made primary).
- `renderContent` is the markdown hook; no HTML injection.
