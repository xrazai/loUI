/**
 * Flaky-test quarantine guard (TEST-015, docs/contributing/flaky-tests.md).
 *
 * A skipped test (`it.skip`, `test.skip`, `describe.skip`) is allowed only as a quarantine: the line
 * above it must say `// quarantine: TEST-123 since 2026-11-03` (a TODO.md ID and the day it was
 * skipped). A quarantine older than 14 days fails this test, so a skipped test cannot be forgotten.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');
const SCAN = ['src', 'scripts', 'tests', 'tools'];
const SKIP = /\b(?:it|test|describe)\.skip\s*\(/;
const MARK = /quarantine:\s*(TEST-\d+)\s+since\s+(\d{4}-\d{2}-\d{2})/;
const MAX_DAYS = 14;

function files(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...files(full));
    else if (/\.test\.tsx?$/.test(name) || /\.stories\.tsx$/.test(name)) out.push(full);
  }
  return out;
}

export interface Quarantined {
  file: string;
  line: number;
  id?: string | undefined;
  since?: string | undefined;
}

export function findSkipped(source: string, file: string): Quarantined[] {
  const lines = source.split('\n');
  const found: Quarantined[] = [];
  lines.forEach((text, index) => {
    if (!SKIP.test(text)) return;
    const mark = MARK.exec(lines[index - 1] ?? '');
    found.push({ file, line: index + 1, id: mark?.[1], since: mark?.[2] });
  });
  return found;
}

function ageInDays(since: string, today: Date): number {
  return Math.floor((today.getTime() - new Date(`${since}T00:00:00Z`).getTime()) / 86_400_000);
}

describe('flaky-test quarantine (TEST-015)', () => {
  it('recognizes a marked and an unmarked skip', () => {
    const marked = findSkipped(
      '// quarantine: TEST-022 since 2026-11-01\nit.skip("x", () => {});',
      'a',
    );
    expect(marked).toEqual([{ file: 'a', line: 2, id: 'TEST-022', since: '2026-11-01' }]);
    expect(findSkipped('it.skip("x", () => {});', 'b')[0]?.id).toBeUndefined();
  });

  it(`every skipped test is a quarantine with a TODO ID, at most ${String(MAX_DAYS)} days old`, () => {
    const today = new Date();
    const problems: string[] = [];
    for (const dir of SCAN) {
      for (const file of files(path.join(root, dir))) {
        if (file.endsWith(path.join('quality', 'quarantine.test.ts'))) continue;
        for (const skip of findSkipped(readFileSync(file, 'utf8'), path.relative(root, file))) {
          const where = `${skip.file}:${String(skip.line)}`;
          if (!skip.id || !skip.since) {
            problems.push(`${where} is skipped without "// quarantine: TEST-<id> since <date>"`);
          } else if (ageInDays(skip.since, today) > MAX_DAYS) {
            problems.push(
              `${where} has been quarantined since ${skip.since} (${skip.id}): fix or delete it`,
            );
          }
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
});
