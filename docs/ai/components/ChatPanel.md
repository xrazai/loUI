# ChatPanel

> A chat side panel for talking to an agent: header with Clear, a message log, suggested prompts
> when empty, and a composer. Built for streaming replies.

Live-region approach: the message list is `role="log"` (a navigable transcript) with
`aria-live="off"`, so partial text never reaches a screen reader token by token. A separate
visually hidden `role="status"` region announces "Thinking…", "The assistant is responding",
and then the full reply once, when it is complete.

Message content is plain text. Pass `renderContent` to render sanitized markdown.

A chat panel for talking to an agent: header with a Clear action, a message log, suggested prompts when empty, and a composer. It supports streaming replies, Stop and Retry. Import it from `loui-ds/patterns`.

- Handoff source: `components/agents/ChatPanel` (TODO `CMP-AGT-03`; groundwork for `AI-013`).

- Import: `import { ChatPanel } from 'loui-ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/ChatPanel/ChatPanel.tsx`
- Stories (Storybook title `Patterns/ChatPanel`): Empty, Conversation, Busy, Streaming, ErrorWithRetry, PrimarySend, LongConversation, LongText, CustomRenderer, RightToLeft, InteractiveStreaming, InteractiveError

## Props

| Prop            | Type                                                                                                                                                                                                                                                                | Required | Default       | Description                                                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`         | `readonly ChatMessage[]`                                                                                                                                                                                                                                            | yes      |               | The conversation, oldest first. Update `content` and `status` of the last item as a reply streams in.                                                                                                                                                                                               |
| `title`         | `ReactNode`                                                                                                                                                                                                                                                         |          |               | Heading of the panel. Defaults to the "Chat with the agent" message.                                                                                                                                                                                                                                |
| `headingLevel`  | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                                                                                                                                                                                                                        |          | `2`           | Heading level of the title (`h1` to `h6`). Default `2`.                                                                                                                                                                                                                                             |
| `busy`          | `boolean`                                                                                                                                                                                                                                                           |          | `false`       | Waiting for the first part of a reply: shows a spinner with "Thinking…" and disables sending.                                                                                                                                                                                                       |
| `intro`         | `ReactNode`                                                                                                                                                                                                                                                         |          |               | Short text shown while the conversation is empty.                                                                                                                                                                                                                                                   |
| `prompts`       | `readonly string[]`                                                                                                                                                                                                                                                 |          | `[]`          | Suggested prompts shown while the conversation is empty. Pressing one sends it.                                                                                                                                                                                                                     |
| `placeholder`   | `string`                                                                                                                                                                                                                                                            |          |               | Placeholder of the composer. Never a substitute for its label.                                                                                                                                                                                                                                      |
| `onSend`        | `(text: string) => void`                                                                                                                                                                                                                                            |          |               | Called with the trimmed text when the user sends (Enter, or the send button) or presses a suggested prompt.                                                                                                                                                                                         |
| `onStop`        | `() => void`                                                                                                                                                                                                                                                        |          |               | Called when the user stops a reply that is being generated. Without it the button is disabled meanwhile.                                                                                                                                                                                            |
| `onRetry`       | `(message: ChatMessage) => void`                                                                                                                                                                                                                                    |          |               | Called with the failed message when the user presses Retry. Without it, failed messages have no Retry.                                                                                                                                                                                              |
| `onClear`       | `() => void`                                                                                                                                                                                                                                                        |          |               | Called when the user clears the conversation. Without it there is no Clear button.                                                                                                                                                                                                                  |
| `renderContent` | `(message: ChatMessage) => ReactNode`                                                                                                                                                                                                                               |          |               | Renders the content of a message. Use it to plug in a markdown renderer. Whatever it returns is rendered as-is, so it must be **sanitized**: the design system never uses `dangerouslySetInnerHTML` and ships no markdown library. Without it the content is plain text with line breaks preserved. |
| `sendVariant`   | `'primary' \| 'secondary'`                                                                                                                                                                                                                                          |          | `'secondary'` | Visual weight of the send button: `secondary` (default) for a chat that sits beside the page's main task, `primary` when the chat is the main task of the page. One primary per screen.                                                                                                             |
| `messages`      | `Partial<{ title: string; clear: string; transcript: string; composerLabel: string; placeholder: string; send: string; stop: string; thinking: string; responding: string; you: string; assistant: string; ... 5 more ...; errorSaid: (text: string) => string; }>` |          |               | Override the built-in messages for this instance.                                                                                                                                                                                                                                                   |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ ChatPanel: { ... } }}>`.

| Key                           | English default               | Notes                                                                                         |
| ----------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `title`                       | `Chat with the agent`         | Default heading of the panel.                                                                 |
| `clear`                       | `Clear conversation`          | Clear button in the header.                                                                   |
| `transcript`                  | `Conversation`                | Accessible name of the message list (`role="log"`).                                           |
| `composerLabel`               | `Message`                     | Accessible name of the composer field.                                                        |
| `placeholder`                 | `Ask or request something`    | Default placeholder of the composer.                                                          |
| `send`                        | `Send message`                | Composer button while it can send, and while the assistant is working (it stops).             |
| `stop`                        | `Stop generating`             |                                                                                               |
| `thinking`                    | `Thinking…`                   | Visible busy text and the announcement while waiting for the first part of a reply.           |
| `responding`                  | `The assistant is responding` | Announcement when a reply starts streaming. The text itself is announced once, when complete. |
| `you`                         | `You`                         | Visually hidden author prefix of each message.                                                |
| `assistant`                   | `Assistant`                   |                                                                                               |
| `error`                       | `Error`                       |                                                                                               |
| `retry`                       | `Retry`                       | Retry button of a failed reply.                                                               |
| `jumpToLatest`                | `Jump to latest`              | Shown while the list is scrolled away from the latest message.                                |
| `suggestions`                 | `Suggested prompts`           | Accessible name of the group of suggested prompts.                                            |
| `assistantSaid(text: string)` | `Assistant: {text}`           | Announcements made when a reply is complete or failed.                                        |
| `errorSaid(text: string)`     | `Error: {text}`               |                                                                                               |

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-chat-panel-bubble-max-ratio`, `--ds-chat-panel-composer-padding`, `--ds-chat-panel-gap`, `--ds-chat-panel-header-height`, `--ds-chat-panel-padding-block`, `--ds-chat-panel-padding-inline`, `--ds-danger`, `--ds-danger-line`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-sans`, `--ds-fs-body`, `--ds-fs-label`, `--ds-lh-body`, `--ds-lh-label`, `--ds-line`, `--ds-line-control`, `--ds-line-subtle`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-radius-md`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-surface`, `--ds-surface-hover`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-semibold`

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

## Related components

- Instead, see ApprovalCard: Customer-facing conversations: the chat is for the owner. Anything that goes to a customer must pass through an approval queue (`ApprovalCard`), never straight from the chat.
- Renders: Button, Spinner, Textarea, VisuallyHidden
