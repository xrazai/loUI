// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { generate } from './generate';
import type { Generated } from './generate';

const root = fileURLToPath(new URL('../../', import.meta.url));
const readJson = (file: string): unknown => JSON.parse(readFileSync(path.join(root, file), 'utf8'));

// Interop: ajv is CommonJS and exposes the class as module.exports and as .default.
const AjvClass = (Ajv2020 as unknown as { default?: typeof Ajv2020 }).default ?? Ajv2020;
const ajv = new AjvClass({ allErrors: true, strict: false });

function validate(schemaFile: string, data: unknown): string[] {
  const check = ajv.compile(readJson(schemaFile) as object);
  if (check(data)) return [];
  return (check.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.message ?? 'is invalid'}`);
}

/**
 * Exported components that are known to miss part of the required documentation. Every entry is
 * a debt: remove it when the gap is closed (the test fails if an entry becomes obsolete).
 */
const KNOWN_GAPS: Record<string, ('description' | 'story' | 'doc')[]> = {};

/** Props without TSDoc, same rules as KNOWN_GAPS. */
const KNOWN_PROP_GAPS = new Set(['FieldMessages.description', 'FieldMessages.errorMessage']);

let generated: Generated;
beforeAll(async () => {
  generated = await generate(root);
}, 180_000);

describe('component manifest', () => {
  it('validates against schemas/manifest.schema.json', () => {
    expect(validate('schemas/manifest.schema.json', generated.manifest)).toEqual([]);
  });

  it('lists every component exported from the entry points', () => {
    const names = generated.manifest.components.map((c) => c.name);
    expect(names).toContain('Button');
    expect(new Set(names).size).toBe(names.length);
    expect(generated.manifest.counts.components).toBe(names.length);
  });

  it('gives every exported component a description, at least one story and a .md doc', () => {
    const problems: string[] = [];
    const stale: string[] = [];
    for (const c of generated.manifest.components) {
      const missing: ('description' | 'story' | 'doc')[] = [];
      if (c.description.trim() === '') missing.push('description');
      if (c.stories.items.length === 0) missing.push('story');
      if (c.docs === null) missing.push('doc');
      const known = KNOWN_GAPS[c.name] ?? [];
      const unexpected = missing.filter((m) => !known.includes(m));
      if (unexpected.length > 0) {
        const hints = {
          description: `add a TSDoc comment to ${c.sourceFile}`,
          story: `add src/components/${c.folder.split('/').pop() ?? ''}/*.stories.tsx`,
          doc: `add ${c.folder}/${c.folder.split('/').pop() ?? ''}.md`,
        };
        problems.push(
          `${c.name}: missing ${unexpected.map((m) => `${m} (${hints[m]})`).join(', ')}`,
        );
      }
      for (const k of known) if (!missing.includes(k)) stale.push(`${c.name}: ${k}`);
    }
    expect(problems, `Components with incomplete AI docs:\n${problems.join('\n')}`).toEqual([]);
    expect(stale, 'Remove these entries from KNOWN_GAPS').toEqual([]);
  });

  it('gives every exported hook and utility a description', () => {
    const missing = [...generated.manifest.hooks, ...generated.manifest.utilities]
      .filter((f) => f.description.trim() === '')
      .map((f) => `${f.name} (${f.sourceFile})`);
    expect(missing, `Add TSDoc to:\n${missing.join('\n')}`).toEqual([]);
  });

  it('documents every prop of every component', () => {
    const missing = generated.manifest.components.flatMap((c) =>
      c.props
        .filter((p) => p.description === '' && !['className', 'children', 'ref'].includes(p.name))
        .map((p) => `${c.name}.${p.name}`)
        .filter((id) => !KNOWN_PROP_GAPS.has(id)),
    );
    expect(missing, `Add TSDoc to props:\n${missing.join('\n')}`).toEqual([]);
  });

  it('resolves related components to exported ones', () => {
    const names = new Set(generated.manifest.components.map((c) => c.name));
    for (const c of generated.manifest.components) {
      for (const n of [
        ...c.related.uses,
        ...c.related.usedBy,
        ...c.related.alternatives.map((a) => a.name),
      ]) {
        expect(names.has(n), `${c.name} relates to unknown ${n}`).toBe(true);
      }
    }
  });

  it('only references CSS variables that exist as tokens or are set by components', () => {
    const known = new Set(generated.tokens.tokens.flatMap((t) => (t.cssVar ? [t.cssVar] : [])));
    const unknown = generated.manifest.components.flatMap((c) =>
      c.cssVariables.filter((v) => !known.has(v)).map((v) => `${c.name}: ${v}`),
    );
    expect(unknown, `CSS variables with no token:\n${unknown.join('\n')}`).toEqual([]);
  });
});

describe('token manifest', () => {
  it('validates against schemas/tokens.schema.json', () => {
    expect(validate('schemas/tokens.schema.json', generated.tokens)).toEqual([]);
  });

  it('describes every token and lists surfaces for text tokens', () => {
    for (const t of generated.tokens.tokens) expect(t.description, t.name).not.toBe('');
    const text3 = generated.tokens.tokens.find((t) => t.name === 'color.text-3');
    expect(text3?.pairings?.allowed.length).toBeGreaterThan(0);
  });
});

describe('content rules', () => {
  const rules = readJson('docs/ai/content-rules.json') as {
    rules: {
      id: string;
      check: string;
      pattern?: string;
      match?: string;
      examples: { good: string[]; bad: string[] };
    }[];
  };

  it('validates against schemas/content-rules.schema.json', () => {
    expect(validate('schemas/content-rules.schema.json', rules)).toEqual([]);
  });

  it('has static patterns that agree with their own examples', () => {
    for (const rule of rules.rules.filter((r) => r.check === 'static')) {
      const re = new RegExp(rule.pattern ?? '', 'u');
      const forbid = rule.match === 'forbid';
      for (const text of rule.examples.good)
        expect(re.test(text) !== forbid, `${rule.id}: good "${text}"`).toBe(true);
      for (const text of rule.examples.bad)
        expect(re.test(text) === forbid, `${rule.id}: bad "${text}"`).toBe(true);
    }
  });
});

describe('llms.txt', () => {
  it('follows the llms.txt layout and links every component', () => {
    const text = generated.common.get('llms.txt') ?? '';
    expect(text.startsWith('# Loui DS\n\n> ')).toBe(true);
    for (const c of generated.manifest.components)
      expect(text).toContain(`[${c.name}](./ai/components/${c.name}.md)`);
    expect(generated.common.get('llms-full.txt')).toContain('## Components');
  });
});
