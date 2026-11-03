// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import { buildChanges, parseOpenGaps, parseTaskLog } from './changes';

const NAMES = new Set(['Button', 'Form', 'Combobox']);

const LOG = `# Changelog

## [Unreleased]

### Fixed

- **GAP-040** (2026-11-04) \`Form\` fix that is not released yet.

## [0.3.0] - 2026-11-03

### Added

- **GAP-033** (2026-11-03) \`Combobox\` \`selectFirstOnEnter\`.
  Second line of the same entry mentioning \`Button\`.

### Changed

- **GAP-014** (2026-11-03) \`Button\` keeps its label.
- **TEST-020** (2026-11-03) Internal visual harness work.

## [0.2.2] - 2026-11-03
## [0.2.1] - 2026-11-03

### Changed

- **REL-009** (2026-11-03) Trusted publishing.
`;

const TODO = `# TODO

- [ ] **GAP-015** (P2 · S) Done state for task rows — nothing renders a \`Form\` strikethrough.
- [x] **GAP-099** (P1 · S) Already done.
- [ ] **TEST-001** (P3 · M) A plain title without details.
Not an item.
`;

describe('parseTaskLog (consumer change index)', () => {
  const { releases, unreleased } = parseTaskLog(LOG, NAMES);

  it('keeps releases newest first, with their dates', () => {
    expect(releases.map((r) => [r.version, r.date])).toEqual([
      ['0.3.0', '2026-11-03'],
      ['0.2.2', '2026-11-03'],
      ['0.2.1', '2026-11-03'],
    ]);
  });

  it('puts unfinished-release entries under unreleased', () => {
    expect(unreleased.map((e) => e.id)).toEqual(['GAP-040']);
    expect(unreleased[0]?.kind).toBe('fixed');
  });

  it('reads the kind from the section heading', () => {
    const entries = releases[0]?.entries ?? [];
    expect(entries.map((e) => [e.id, e.kind])).toEqual([
      ['GAP-033', 'added'],
      ['GAP-014', 'changed'],
      ['TEST-020', 'changed'],
    ]);
  });

  it('joins continuation lines and finds exported components in the whole entry', () => {
    const entry = releases[0]?.entries[0];
    expect(entry?.summary).toContain('Second line of the same entry');
    expect(entry?.components).toEqual(['Button', 'Combobox']);
  });

  it('flags repository-only work as internal', () => {
    const entries = releases[0]?.entries ?? [];
    expect(entries.find((e) => e.id === 'GAP-014')?.internal).toBe(false);
    expect(entries.find((e) => e.id === 'TEST-020')?.internal).toBe(true);
  });

  it('keeps a release without entries', () => {
    expect(releases[1]?.entries).toEqual([]);
  });
});

describe('parseOpenGaps', () => {
  it('lists only open items with priority, size and title', () => {
    const gaps = parseOpenGaps(TODO, NAMES);
    expect(gaps.map((g) => [g.id, g.priority, g.size])).toEqual([
      ['GAP-015', 'P2', 'S'],
      ['TEST-001', 'P3', 'M'],
    ]);
    expect(gaps[0]?.title).toBe('Done state for task rows');
    expect(gaps[0]?.components).toEqual(['Form']);
    expect(gaps[1]?.title).toBe('A plain title without details.');
  });
});

describe('buildChanges', () => {
  it('assembles the document with the package name and version', () => {
    const changes = buildChanges({
      packageName: 'loui-ds',
      version: '0.3.0',
      changelog: LOG,
      todo: TODO,
      componentNames: NAMES,
    });
    expect(changes).toMatchObject({ schemaVersion: 1, package: 'loui-ds', version: '0.3.0' });
    expect(changes.releases).toHaveLength(3);
    expect(changes.open).toHaveLength(2);
  });

  it('parses the real task log and backlog of this repository', () => {
    const root = fileURLToPath(new URL('../../', import.meta.url));
    const changes = buildChanges({
      packageName: 'loui-ds',
      version: '0.0.0',
      changelog: readFileSync(`${root}CHANGELOG.md`, 'utf8'),
      todo: readFileSync(`${root}TODO.md`, 'utf8'),
      componentNames: new Set(),
    });
    // Interop: ajv is CommonJS and exposes the class as module.exports and as .default.
    const AjvClass = (Ajv2020 as unknown as { default?: typeof Ajv2020 }).default ?? Ajv2020;
    const check = new AjvClass({ allErrors: true, strict: false }).compile(
      JSON.parse(readFileSync(`${root}schemas/changes.schema.json`, 'utf8')) as object,
    );
    expect(check(changes), JSON.stringify(check.errors)).toBe(true);
    const ids = changes.releases.flatMap((r) => r.entries.map((e) => e.id));
    expect(ids).toContain('GAP-014');
    expect(changes.open.length).toBeGreaterThan(0);
    for (const gap of changes.open) expect(ids).not.toContain(gap.id);
  });
});
