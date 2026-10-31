import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, ElementType, ReactNode, UIEvent } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { Textarea } from '../../components/Textarea';
import { VisuallyHidden } from '../../components/VisuallyHidden';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { messages } from './ChatPanel.messages';
import styles from './ChatPanel.module.css';

export type ChatMessageRole = 'user' | 'assistant';
export type ChatMessageStatus = 'complete' | 'streaming' | 'error';

export interface ChatMessage {
  /** Stable, unique id (never the array index): React keys and the first-announcement logic depend on it. */
  id: string;
  /** Who wrote it. */
  role: ChatMessageRole;
  /** The text. Plain text with line breaks unless `renderContent` is given. While `streaming`, grow it in place. */
  content: string;
  /**
   * `complete` (default), `streaming` (the text is still arriving; it is not announced until it
   * completes) or `error` (the reply failed; `content` is the error text and Retry is offered).
   */
  status?: ChatMessageStatus;
}

export interface ChatPanelProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'children' | 'title'
> {
  /** The conversation, oldest first. Update `content` and `status` of the last item as a reply streams in. */
  items: readonly ChatMessage[];
  /** Heading of the panel. Defaults to the "Chat with the agent" message. */
  title?: ReactNode;
  /** Heading level of the title (`h1` to `h6`). Default `2`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Waiting for the first part of a reply: shows a spinner with "Thinking…" and disables sending. */
  busy?: boolean;
  /** Short text shown while the conversation is empty. */
  intro?: ReactNode;
  /** Suggested prompts shown while the conversation is empty. Pressing one sends it. */
  prompts?: readonly string[];
  /** Placeholder of the composer. Never a substitute for its label. */
  placeholder?: string;
  /** Called with the trimmed text when the user sends (Enter, or the send button) or presses a suggested prompt. */
  onSend?: (text: string) => void;
  /** Called when the user stops a reply that is being generated. Without it the button is disabled meanwhile. */
  onStop?: () => void;
  /** Called with the failed message when the user presses Retry. Without it, failed messages have no Retry. */
  onRetry?: (message: ChatMessage) => void;
  /** Called when the user clears the conversation. Without it there is no Clear button. */
  onClear?: () => void;
  /**
   * Renders the content of a message. Use it to plug in a markdown renderer. Whatever it returns
   * is rendered as-is, so it must be **sanitized**: the design system never uses
   * `dangerouslySetInnerHTML` and ships no markdown library. Without it the content is plain
   * text with line breaks preserved.
   */
  renderContent?: (message: ChatMessage) => ReactNode;
  /**
   * Visual weight of the send button: `secondary` (default) for a chat that sits beside the
   * page's main task, `primary` when the chat is the main task of the page. One primary per screen.
   */
  sendVariant?: 'primary' | 'secondary';
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

/** Within this distance (px) of the end, the list counts as "at the bottom" and follows new content. */
const ANCHOR_THRESHOLD_PX = 24;

interface CompositionKeyboardEvent {
  key: string;
  shiftKey: boolean;
  nativeEvent: KeyboardEvent;
  preventDefault: () => void;
}

/** IME composition (CJK, dead keys on some platforms) uses Enter to commit text, not to send. */
function isComposing(event: CompositionKeyboardEvent): boolean {
  const native = event.nativeEvent as KeyboardEvent & { keyCode?: number };
  // keyCode 229 is how Safari reports the Enter that ends a composition.
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- Safari only reports the composition-ending Enter through keyCode 229.
  return native.isComposing || native.keyCode === 229;
}

/**
 * A chat side panel for talking to an agent: header with Clear, a message log, suggested prompts
 * when empty, and a composer. Built for streaming replies.
 *
 * Live-region approach: the message list is `role="log"` (a navigable transcript) with
 * `aria-live="off"`, so partial text never reaches a screen reader token by token. A separate
 * visually hidden `role="status"` region announces "Thinking…", "The assistant is responding",
 * and then the full reply once, when it is complete.
 *
 * Message content is plain text. Pass `renderContent` to render sanitized markdown.
 */
export function ChatPanel({
  items,
  title,
  headingLevel = 2,
  busy = false,
  intro,
  prompts = [],
  placeholder,
  onSend,
  onStop,
  onRetry,
  onClear,
  renderContent,
  sendVariant = 'secondary',
  messages: overrides,
  className,
  ...rest
}: ChatPanelProps) {
  const t = useMessages('ChatPanel', messages, overrides);
  const headingId = useId();
  const Heading = `h${String(headingLevel)}` as ElementType;
  const [draft, setDraft] = useState('');
  const [atBottom, setAtBottom] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);
  const stick = useRef(true);
  // Messages that were already complete on first render are history, not news: never announced.
  const [historyIds] = useState(
    () => new Set(items.filter((m) => m.status !== 'streaming').map((m) => m.id)),
  );

  const last = items.at(-1);
  const streaming = items.some((m) => m.status === 'streaming');
  const working = busy || streaming;
  const empty = items.length === 0 && !busy;
  const canSend = draft.trim() !== '' && !working;

  // Follow new content only while the user is at the bottom.
  useEffect(() => {
    const list = listRef.current;
    if (list && stick.current) list.scrollTop = list.scrollHeight;
  }, [items, busy]);

  function scrollToEnd() {
    const list = listRef.current;
    stick.current = true;
    setAtBottom(true);
    if (list) list.scrollTop = list.scrollHeight;
  }

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const list = event.currentTarget;
    const near = list.scrollHeight - list.scrollTop - list.clientHeight <= ANCHOR_THRESHOLD_PX;
    stick.current = near;
    setAtBottom(near);
  }

  function send(text: string) {
    const value = text.trim();
    if (value === '' || working) return;
    stick.current = true;
    onSend?.(value);
  }

  function submitDraft() {
    if (!canSend) return;
    send(draft);
    setDraft('');
  }

  let announcement = '';
  if (last?.status === 'streaming') announcement = t.responding;
  else if (busy) announcement = t.thinking;
  else if (last && last.role === 'assistant' && !historyIds.has(last.id)) {
    announcement =
      last.status === 'error' ? t.errorSaid(last.content) : t.assistantSaid(last.content);
  }

  const thinking = busy || (last?.status === 'streaming' && last.content === '');

  return (
    <section
      {...rest}
      aria-labelledby={headingId}
      className={classNames(styles.root, className)}
      data-working={working || undefined}
    >
      <header className={styles.header}>
        <Heading id={headingId} className={styles.title}>
          {title ?? t.title}
        </Heading>
        {onClear && items.length > 0 ? (
          <Button size="sm" variant="ghost" onPress={onClear}>
            {t.clear}
          </Button>
        ) : null}
      </header>
      <div className={styles.viewport}>
        <div
          ref={listRef}
          role="log"
          aria-live="off"
          aria-label={t.transcript}
          aria-busy={working || undefined}
          // A scrollable region must be keyboard focusable (WCAG 2.1.1, axe scrollable-region-focusable).
          // eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex
          tabIndex={0}
          className={styles.list}
          onScroll={onScroll}
        >
          {empty && intro ? <div className={styles.intro}>{intro}</div> : null}
          {empty && prompts.length > 0 ? (
            <div role="group" aria-label={t.suggestions} className={styles.prompts}>
              {prompts.map((prompt) => (
                <AriaButton
                  key={prompt}
                  className={classNames(styles.prompt)}
                  isDisabled={working}
                  onPress={() => {
                    send(prompt);
                  }}
                >
                  {prompt}
                </AriaButton>
              ))}
            </div>
          ) : null}
          {items.map((message) => {
            if (message.status === 'streaming' && message.content === '') return null;
            const failed = message.status === 'error';
            return (
              <div
                key={message.id}
                className={styles.row}
                data-role={message.role}
                data-status={message.status ?? 'complete'}
              >
                <div className={styles.bubble} data-custom={renderContent ? '' : undefined}>
                  <VisuallyHidden>
                    {failed ? t.error : message.role === 'user' ? t.you : t.assistant}:{' '}
                  </VisuallyHidden>
                  {renderContent ? renderContent(message) : message.content}
                </div>
                {failed && onRetry ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => {
                      onRetry(message);
                    }}
                  >
                    {t.retry}
                  </Button>
                ) : null}
              </div>
            );
          })}
          {thinking ? (
            <div className={styles.thinking}>
              <Spinner size="sm" decorative />
              <span>{t.thinking}</span>
            </div>
          ) : null}
        </div>
        {!atBottom && items.length > 0 ? (
          <Button size="sm" className={classNames(styles.jump)} onPress={scrollToEnd}>
            {t.jumpToLatest}
          </Button>
        ) : null}
      </div>
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
      <div className={styles.composer}>
        <Textarea
          className={styles.field}
          aria-label={t.composerLabel}
          placeholder={placeholder ?? t.placeholder}
          rows={2}
          resize="none"
          value={draft}
          onChange={setDraft}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.shiftKey || isComposing(event)) return;
            event.preventDefault();
            submitDraft();
          }}
        />
        <Button
          variant={working ? 'secondary' : sendVariant}
          isDisabled={working ? !onStop : !canSend}
          {...(working ? (onStop ? { onPress: onStop } : {}) : { onPress: submitDraft })}
        >
          {working ? t.stop : t.send}
        </Button>
      </div>
    </section>
  );
}
