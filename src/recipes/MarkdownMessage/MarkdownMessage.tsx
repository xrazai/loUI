import { useState } from 'react';
import type { ReactNode } from 'react';
import { Code, Inline, Link, Stack, Text } from '../../index';
import { ChatPanel } from '../../patterns';
import type { ChatMessage } from '../../patterns';

/**
 * A small markdown subset, rendered as React elements. There is no HTML string anywhere, so
 * nothing the model writes can inject markup: React escapes every piece of text, and links are
 * kept only when their address is http, https or mailto.
 *
 * Supported: paragraphs, **bold**, *italic* (or _italic_), `inline code`, fenced code blocks,
 * "-" and "1." lists, and [links](https://example.com). Everything else (headings, tables,
 * images, raw HTML) stays visible as plain text. A fence or an emphasis that is not closed yet
 * renders as it is, so a reply that is still streaming never flickers into broken markup.
 */

const SAFE_LINK = /^(https?:\/\/|mailto:)/i;
const FENCE = /^`{3}(.*)$/;
const FENCE_END = /^`{3}\s*$/;
// Written this way so the source of this file can sit inside a fenced block of its own doc.
const FENCE_MARK = '`'.repeat(3);
const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*(\d{1,9})\.\s+(.*)$/;
// Order matters: code first (nothing inside it is markup), then strong before emphasis.
const INLINE =
  /`([^`\n]+)`|\*\*(\S(?:.*?\S)?)\*\*|\*(\S(?:[^*\n]*\S)?)\*|(?<![\w])_([^_\n]+)_(?![\w])|\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/;

export function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  while (rest !== '') {
    const match = INLINE.exec(rest);
    if (!match) {
      nodes.push(rest);
      break;
    }
    if (match.index > 0) nodes.push(rest.slice(0, match.index));
    const key = nodes.length;
    const [, code, strong, emphasis, underscore, label, href] = match;
    if (code !== undefined) {
      nodes.push(<Code key={key}>{code}</Code>);
    } else if (strong !== undefined) {
      nodes.push(<strong key={key}>{renderInline(strong)}</strong>);
    } else if (emphasis !== undefined || underscore !== undefined) {
      nodes.push(<em key={key}>{renderInline(emphasis ?? underscore ?? '')}</em>);
    } else if (label !== undefined && href !== undefined) {
      // Unsafe addresses (javascript:, data:) lose the link and keep the text.
      nodes.push(
        SAFE_LINK.test(href) ? (
          <Link key={key} href={href} target="_blank">
            {label}
          </Link>
        ) : (
          label
        ),
      );
    }
    rest = rest.slice(match.index + match[0].length);
  }
  return nodes;
}

function renderLines(lines: string[]): ReactNode[] {
  return lines.flatMap((line, index) => [
    ...(index > 0 ? [<br key={`br-${String(index)}`} />] : []),
    ...renderInline(line),
  ]);
}

/** Turns the markdown subset into React elements. Pass it to `ChatPanel` as `renderContent`. */
export function renderMarkdown(source: string): ReactNode {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push(
      <Text as="p" size="label" key={blocks.length}>
        {renderLines(paragraph)}
      </Text>,
    );
    paragraph = [];
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    if (FENCE.test(line)) {
      flushParagraph();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !FENCE_END.test(lines[i] ?? '')) {
        code.push(lines[i] ?? '');
        i += 1;
      }
      blocks.push(
        <Code variant="block" key={blocks.length}>
          {code.join('\n')}
        </Code>,
      );
    } else if (BULLET.test(line) || NUMBERED.test(line)) {
      flushParagraph();
      const ordered = NUMBERED.test(line);
      const pattern = ordered ? NUMBERED : BULLET;
      const start = ordered ? Number(NUMBERED.exec(line)?.[1]) : 1;
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i] ?? '')) {
        const found = pattern.exec(lines[i] ?? '');
        items.push(found?.[ordered ? 2 : 1] ?? '');
        i += 1;
      }
      i -= 1;
      blocks.push(
        // The list reset comes from Stack. The marker is real text for numbers, and hidden for bullets.
        <Stack as={ordered ? 'ol' : 'ul'} gap={1} key={blocks.length}>
          {items.map((item, index) => (
            <Inline as="li" gap={2} align="baseline" wrap={false} key={index}>
              <Text size="label" tone="secondary" mono aria-hidden={ordered ? undefined : true}>
                {ordered ? `${String(start + index)}.` : '•'}
              </Text>
              <Text size="label">{renderInline(item)}</Text>
            </Inline>
          ))}
        </Stack>,
      );
    } else if (line.trim() === '') {
      flushParagraph();
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  return <Stack gap={2}>{blocks}</Stack>;
}

const INITIAL: ChatMessage[] = [
  { id: 'm-1', role: 'user', content: 'How do I check the status of an order?' },
  {
    id: 'm-2',
    role: 'assistant',
    content: [
      'Open **Orders** and search by the order code, for example `ORD-1048`.',
      '',
      'Then:',
      '',
      '1. Select the order.',
      '2. Read the *Status* field.',
      '3. Use [the guide](https://example.com/orders) for the full list.',
      '',
      FENCE_MARK,
      'GET /orders/ORD-1048',
      FENCE_MARK,
    ].join('\n'),
  },
];

export interface MarkdownChatProps {
  initialItems?: ChatMessage[];
}

/**
 * A chat whose assistant replies are rendered as markdown. Your own messages and errors stay
 * plain text: they are not formatted, so what a person typed is what they see.
 */
export function MarkdownChat({ initialItems = INITIAL }: MarkdownChatProps) {
  const [items, setItems] = useState(initialItems);
  return (
    <ChatPanel
      items={items}
      onSend={(text) => {
        setItems((current) => [
          ...current,
          { id: `m-${String(current.length + 1)}`, role: 'user', content: text },
        ]);
      }}
      renderContent={(message) =>
        message.role === 'assistant' && message.status !== 'error'
          ? renderMarkdown(message.content)
          : message.content
      }
    />
  );
}
