import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { messages as agentCard } from '../patterns/AgentCard/AgentCard.messages';
import { messages as approvalCard } from '../patterns/ApprovalCard/ApprovalCard.messages';
import { AgentCard } from '../patterns/AgentCard/AgentCard';
import { ApprovalCard } from '../patterns/ApprovalCard/ApprovalCard';
import { DueIndicator } from '../components/DueIndicator/DueIndicator';
import { messages as dueIndicator } from '../components/DueIndicator/DueIndicator.messages';
import { messages as field } from '../components/Field/Field.messages';
import { FileUpload } from '../components/FileUpload/FileUpload';
import { messages as fileUpload } from '../components/FileUpload/FileUpload.messages';
import { Input } from '../components/Input/Input';
import { InlineConfirm } from '../components/InlineConfirm/InlineConfirm';
import { messages as inlineConfirm } from '../components/InlineConfirm/InlineConfirm.messages';
import { Pagination } from '../components/Pagination/Pagination';
import { messages as pagination } from '../components/Pagination/Pagination.messages';
import { SearchInput } from '../components/SearchInput/SearchInput';
import { messages as searchInput } from '../components/SearchInput/SearchInput.messages';
import { Select } from '../components/Select/Select';
import { messages as select } from '../components/Select/Select.messages';
import { StatCard } from '../components/StatCard/StatCard';
import { messages as statCard } from '../components/StatCard/StatCard.messages';
import { render } from 'vitest-browser-react';
import { DSProvider } from '../providers/DSProvider';
import type { DSMessages, Message, MessageSet } from './messages';

/**
 * Pseudo-locale smoke render (TEST-010).
 *
 * German and Finnish text runs about 30 to 40 percent longer than English. Each case below
 * renders a representative component with every built-in message of its catalog expanded by
 * 40 percent (accented letters, so a missing font glyph shows too), inside a narrow frame, and
 * checks that nothing escapes its own box: no element is wider than its content box, and the
 * frame itself does not scroll sideways.
 *
 * What this cannot see: text that is allowed to be clipped on purpose (`overflow: hidden`,
 * `text-overflow: ellipsis`, scroll containers) is skipped, because clipping is the design
 * there. Vertical growth is fine: boxes may get taller. Right-to-left layout is covered by the
 * `RightToLeft` stories in the visual project.
 */

const ACCENTS: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ö', u: 'ü', c: 'ç', n: 'ñ' };

/** Lengthens a string by 40 percent: accents on vowels, then more words from the text itself. */
function expand(text: string): string {
  const accented = text.replace(/[aeioucn]/g, (letter) => ACCENTS[letter] ?? letter);
  const extra = Math.max(3, Math.ceil(text.length * 0.4));
  const filler = accented.repeat(Math.ceil(extra / Math.max(1, accented.length) + 1));
  // Break on a space so the filler is made of words and can wrap like real text.
  const cut = filler.slice(0, extra);
  return `${accented} ${cut}`.trimEnd();
}

function expandMessage(message: Message): Message {
  if (typeof message === 'string') return expand(message);
  const original = message as (...args: unknown[]) => string;
  return (...args: never[]) => expand(original(...args));
}

function pseudo(catalog: { en: MessageSet }): Record<string, Message> {
  return Object.fromEntries(
    Object.entries(catalog.en).map(([key, message]) => [key, expandMessage(message)]),
  );
}

interface Case {
  name: string;
  /** The `DSProvider` messages key of the component. */
  key: string;
  catalog: { en: MessageSet };
  /** Proof that the pseudo messages are rendered (default: an accented letter). */
  applied?: RegExp;
  element: ReactElement;
}

const options = [
  { value: 'eu', label: 'Frankfurt' },
  { value: 'us', label: 'Virginia' },
];

const cases: Case[] = [
  {
    name: 'FileUpload',
    key: 'FileUpload',
    catalog: fileUpload,
    element: <FileUpload label="Attachments" />,
  },
  {
    name: 'DueIndicator',
    key: 'DueIndicator',
    catalog: dueIndicator,
    element: <DueIndicator date="2026-03-07" today="2026-03-10" />,
  },
  {
    name: 'InlineConfirm',
    key: 'InlineConfirm',
    catalog: inlineConfirm,
    element: (
      <InlineConfirm
        label="Delete line"
        prompt="Remove this line?"
        onConfirm={() => {}}
        defaultOpen
      />
    ),
  },
  {
    name: 'Select',
    key: 'Select',
    catalog: select,
    element: <Select label="Region" options={options} />,
  },
  {
    name: 'SearchInput',
    key: 'SearchInput',
    catalog: searchInput,
    element: <SearchInput aria-label="Find orders" />,
  },
  {
    name: 'AgentCard',
    key: 'AgentCard',
    catalog: agentCard,
    element: (
      <AgentCard
        name="Marketplace agent"
        status="active"
        pending={4}
        description="Answers buyer questions."
      />
    ),
  },
  {
    name: 'ApprovalCard',
    key: 'ApprovalCard',
    catalog: approvalCard,
    element: (
      <ApprovalCard
        kind="question"
        message="Do you have this in yellow?"
        defaultDraft="Not available."
        onSend={() => {}}
        onDiscard={() => {}}
      />
    ),
  },
  {
    name: 'StatCard',
    key: 'StatCard',
    catalog: statCard,
    element: <StatCard label="Sold" value="$3,765" trend={{ direction: 'up', value: 0.12 }} />,
    applied: /Up 12% Up/,
  },
  {
    name: 'Pagination',
    key: 'Pagination',
    catalog: pagination,
    element: <Pagination pageCount={10} defaultPage={5} />,
  },
  {
    name: 'Field (required mark)',
    key: 'Field',
    catalog: field,
    element: <Input label="Customer name" isRequired />,
    applied: /\* \*\*\*/,
  },
];

/** True for elements that may legitimately hold more than they show. */
function clips(element: HTMLElement): boolean {
  const style = getComputedStyle(element);
  return (
    style.overflowX !== 'visible' ||
    style.textOverflow === 'ellipsis' ||
    style.display === 'inline' ||
    style.display === 'contents'
  );
}

function overflowing(frame: HTMLElement): string[] {
  const found: string[] = [];
  if (frame.scrollWidth > frame.clientWidth) {
    found.push(`frame ${String(frame.scrollWidth)} > ${String(frame.clientWidth)}`);
  }
  for (const element of frame.querySelectorAll<HTMLElement>('*')) {
    if (clips(element)) continue;
    if (element.scrollWidth > element.clientWidth + 1) {
      const name = element.getAttribute('class')?.split(' ')[0] ?? element.tagName.toLowerCase();
      found.push(
        `${element.tagName.toLowerCase()}.${name} ${String(element.scrollWidth)} > ${String(element.clientWidth)}`,
      );
    }
  }
  return found;
}

describe('pseudo-locale (+40% text) smoke render', () => {
  it('expands text by at least 40 percent', () => {
    expect(expand('Choose a file').length).toBeGreaterThanOrEqual(Math.ceil(13 * 1.4));
    expect(expand('x').length).toBeGreaterThan(1);
  });

  it('detects text that escapes its frame (the check can fail)', async () => {
    const screen = await render(
      <div data-frame style={{ inlineSize: 100 }}>
        <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          A label that is much too long for this frame
        </span>
      </div>,
    );
    const frame = screen.container.querySelector<HTMLElement>('[data-frame]');
    if (!frame) throw new Error('Frame did not render.');
    expect(overflowing(frame)).not.toEqual([]);
  });

  it.each(cases)('$name: long messages stay inside their box', async (testCase) => {
    const messages: DSMessages = { [testCase.key]: pseudo(testCase.catalog) };
    const screen = await render(
      <DSProvider messages={messages}>
        <div data-frame style={{ inlineSize: 320, padding: 8, boxSizing: 'border-box' }}>
          {testCase.element}
        </div>
      </DSProvider>,
    );
    const frame = screen.container.querySelector<HTMLElement>('[data-frame]');
    if (!frame) throw new Error('Frame did not render.');
    // The pseudo messages are in use, not the English ones.
    await expect.poll(() => frame.innerHTML).toMatch(testCase.applied ?? /[áéíöüçñ]/);
    await document.fonts.ready;
    await expect.poll(() => overflowing(frame)).toEqual([]);
  });
});
