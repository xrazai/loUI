/**
 * Builds `changes.json`: a machine-readable view of what changed between releases and which
 * known gaps are still open, so a consuming app (or its agent) can tell which of its notes and
 * workarounds an upgrade resolves without reading prose.
 *
 * Sources: the task log (`CHANGELOG.md`, one `- **ID** (date) text` line per finished task,
 * grouped by release and kind) and the backlog (`TODO.md`, `- [ ] **ID** (P1 · S) Title ...`).
 * Shipped as `loui-ds/changes.json`.
 */

export type ChangeKind = 'added' | 'changed' | 'fixed' | 'removed' | 'deprecated' | 'security';

export interface ChangeEntry {
  /** Task id from the TODO, for example `GAP-014`. Consumers match their notes on it. */
  id: string;
  kind: ChangeKind | 'other';
  /** The entry as written in the task log (Markdown). */
  summary: string;
  /** Exported components or patterns named in the summary. */
  components: string[];
  /** True for repository work with no effect on consumers (tests, CI, release tooling). */
  internal: boolean;
}

export interface ChangeRelease {
  version: string;
  date: string | null;
  entries: ChangeEntry[];
}

export interface OpenGap {
  id: string;
  priority: string;
  size: string;
  title: string;
  /** The whole backlog line (Markdown): problem and intended fix. */
  summary: string;
  components: string[];
}

export interface Changes {
  schemaVersion: 1;
  package: string;
  /** Version of the package that contains this file. */
  version: string;
  /** Newest release first. Entries finished since the last release are under `unreleased`. */
  releases: ChangeRelease[];
  unreleased: ChangeEntry[];
  /** Gaps recorded in the backlog that are not done yet, as of this build. */
  open: OpenGap[];
}

/** Task id prefixes that describe work consumers can see; everything else is `internal`. */
const CONSUMER_PREFIXES = ['CMP-', 'GAP-', 'TOK-', 'BASE-', 'ARCH-', 'AI-', 'ICON-'];

const ENTRY = /^- \*\*([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)\*\*(?: \((\d{4}-\d{2}-\d{2})\))?\s*(.*)$/;
const RELEASE_HEADING = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?\s*$/;
const KIND_HEADING = /^### (\w+)\s*$/;
const OPEN_ITEM = /^- \[ \] \*\*([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)\*\* \((P\d) · ([SML])\) (.*)$/;

function componentsIn(text: string, names: ReadonlySet<string>): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(/`([A-Z][A-Za-z0-9]+)`/g)) {
    const name = match[1];
    if (name !== undefined && names.has(name)) found.add(name);
  }
  return [...found].sort();
}

function kindOf(heading: string): ChangeKind | 'other' {
  const kind = heading.toLowerCase();
  return ['added', 'changed', 'fixed', 'removed', 'deprecated', 'security'].includes(kind)
    ? (kind as ChangeKind)
    : 'other';
}

function isInternal(id: string): boolean {
  return !CONSUMER_PREFIXES.some((prefix) => id.startsWith(prefix));
}

export function parseTaskLog(
  markdown: string,
  names: ReadonlySet<string>,
): { releases: ChangeRelease[]; unreleased: ChangeEntry[] } {
  const releases: ChangeRelease[] = [];
  const unreleased: ChangeEntry[] = [];
  let target: ChangeEntry[] | undefined;
  let kind: ChangeKind | 'other' = 'other';
  let last: ChangeEntry | undefined;

  for (const raw of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd();
    const release = RELEASE_HEADING.exec(line);
    if (release) {
      last = undefined;
      kind = 'other';
      if (release[1] === 'Unreleased') {
        target = unreleased;
      } else {
        const entries: ChangeEntry[] = [];
        releases.push({ version: release[1] ?? '', date: release[2] ?? null, entries });
        target = entries;
      }
      continue;
    }
    if (!target) continue;
    const heading = KIND_HEADING.exec(line);
    if (heading) {
      kind = kindOf(heading[1] ?? '');
      last = undefined;
      continue;
    }
    const entry = ENTRY.exec(line);
    if (entry) {
      const summary = (entry[3] ?? '').trim();
      last = {
        id: entry[1] ?? '',
        kind,
        summary,
        components: componentsIn(summary, names),
        internal: isInternal(entry[1] ?? ''),
      };
      target.push(last);
      continue;
    }
    if (last && line.trim() !== '' && !line.startsWith('#') && !line.startsWith('- ')) {
      last.summary = `${last.summary} ${line.trim()}`;
      last.components = componentsIn(last.summary, names);
    } else if (line.trim() === '') {
      last = undefined;
    }
  }
  return { releases, unreleased };
}

export function parseOpenGaps(markdown: string, names: ReadonlySet<string>): OpenGap[] {
  const gaps: OpenGap[] = [];
  for (const raw of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const match = OPEN_ITEM.exec(raw.trimEnd());
    if (!match) continue;
    const rest = (match[4] ?? '').trim();
    const [title = rest] = rest.split(' — ');
    gaps.push({
      id: match[1] ?? '',
      priority: match[2] ?? '',
      size: match[3] ?? '',
      title: title.trim(),
      summary: rest,
      components: componentsIn(rest, names),
    });
  }
  return gaps;
}

export function buildChanges(input: {
  packageName: string;
  version: string;
  changelog: string;
  todo: string;
  componentNames: ReadonlySet<string>;
}): Changes {
  const { releases, unreleased } = parseTaskLog(input.changelog, input.componentNames);
  return {
    schemaVersion: 1,
    package: input.packageName,
    version: input.version,
    releases,
    unreleased,
    open: parseOpenGaps(input.todo, input.componentNames),
  };
}
