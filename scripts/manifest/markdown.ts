/**
 * Small Markdown helpers for the hand-written `<Name>.md` component docs.
 * Not a full parser: it splits on `##` headings and extracts bullets and fenced code blocks.
 */

export interface DocSection {
  /** Kebab-case id derived from the heading, e.g. `when-to-use`. */
  id: string;
  heading: string;
  /** Markdown body of the section, trimmed. */
  content: string;
}

export interface ParsedDoc {
  title: string;
  /** Raw status word from a `Status: x` line, if present. */
  status: string | undefined;
  /** Text between the title (and status line) and the first `##` heading. */
  summary: string;
  sections: DocSection[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const STATUS_LINE = /^\s*(?:[-*]\s*)?Status:\s*([a-z]+)\s*$/im;

/** Splits a component doc into a title, a status, a summary and `##` sections. */
export function parseDoc(markdown: string): ParsedDoc {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let title = '';
  let status: string | undefined;
  const summaryLines: string[] = [];
  const sections: { heading: string; lines: string[] }[] = [];
  let fence = false;
  for (const line of lines) {
    if (/^```/.test(line)) fence = !fence;
    const h1 = !fence ? /^#\s+(.+)$/.exec(line) : null;
    const h2 = !fence ? /^##\s+(.+)$/.exec(line) : null;
    if (h1?.[1] && title === '') {
      title = h1[1].trim();
      continue;
    }
    if (h2?.[1]) {
      sections.push({ heading: h2[1].trim(), lines: [] });
      continue;
    }
    const current = sections[sections.length - 1];
    if (current) {
      current.lines.push(line);
      continue;
    }
    const statusMatch = STATUS_LINE.exec(line);
    if (statusMatch?.[1]) {
      status = statusMatch[1].toLowerCase();
      continue;
    }
    summaryLines.push(line);
  }
  return {
    title,
    status,
    summary: summaryLines.join('\n').trim(),
    sections: sections.map((s) => ({
      id: slugify(s.heading),
      heading: s.heading,
      content: s.lines.join('\n').trim(),
    })),
  };
}

/** Top-level bullet items of a section body, with continuation lines joined. */
export function bullets(content: string): string[] {
  const items: string[] = [];
  let fence = false;
  for (const line of content.split('\n')) {
    if (/^```/.test(line)) fence = !fence;
    if (fence) continue;
    const item = /^[-*]\s+(.*)$/.exec(line);
    if (item?.[1] !== undefined) {
      items.push(item[1].trim());
    } else if (/^\s+\S/.test(line) && items.length > 0 && !/^\s*[-*]\s/.test(line)) {
      const last = items.length - 1;
      items[last] = `${items[last] ?? ''} ${line.trim()}`;
    }
  }
  return items;
}

/** Fenced code blocks of a section as `{ lang, code }`. */
export function codeBlocks(content: string): { lang: string; code: string }[] {
  const blocks: { lang: string; code: string }[] = [];
  const pattern = /```([\w-]*)\n([\s\S]*?)```/g;
  for (const match of content.matchAll(pattern)) {
    blocks.push({ lang: match[1] ?? '', code: (match[2] ?? '').trimEnd() });
  }
  return blocks;
}

/** First section whose id starts with one of the given prefixes. */
export function findSection(sections: DocSection[], ...prefixes: string[]): DocSection | undefined {
  return sections.find((s) => prefixes.some((p) => s.id === p || s.id.startsWith(`${p}-`)));
}

/** Backticked identifiers in a text, in order of appearance. */
export function backticked(text: string): string[] {
  return [...text.matchAll(/`([A-Za-z][A-Za-z0-9]*)`/g)].map((m) => m[1] ?? '');
}
