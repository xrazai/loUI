import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadData } from '../src/data.ts';
import type { DsData } from '../src/data.ts';
import { createServer } from '../src/server.ts';
import type { ManifestEntry } from '../src/types.ts';
import { validateSnippet } from '../src/validate.ts';

/** The real data plus two synthetic deprecated props on Button (AI-016). */
function withDeprecatedProps(): DsData {
  const base = loadData();
  const patch = (entry: ManifestEntry): ManifestEntry =>
    entry.name === 'Button'
      ? {
          ...entry,
          props: [
            ...(entry.props ?? []),
            { name: 'legacyTone', type: 'string', required: false, deprecated: 'Use variant.' },
            { name: 'oldSize', type: 'string', required: false, deprecated: '' },
          ],
        }
      : entry;
  return {
    ...base,
    manifest: { ...base.manifest, components: base.manifest.components.map(patch) },
    entries: base.entries.map(patch),
  };
}

const data = withDeprecatedProps();
const wrap = (jsx: string) =>
  `import { Button } from '@loui/ds';\nexport const A = () => (${jsx});\n`;

describe('deprecated props (AI-016)', () => {
  it('validate_snippet warns about a deprecated prop and includes the migration hint', async () => {
    const result = await validateSnippet(data, wrap('<Button legacyTone="x">Save</Button>'));
    const finding = result.findings.find((f) => f.ruleId === 'loui/no-deprecated');
    expect(finding?.severity).toBe('warning');
    expect(finding?.message).toContain('legacyTone');
    expect(finding?.message).toContain('Use variant.');
    expect(result.ok).toBe(true);
  });

  it('warns without a hint when the tag has no text', async () => {
    const result = await validateSnippet(data, wrap('<Button oldSize="sm">Save</Button>'));
    expect(result.findings.some((f) => f.ruleId === 'loui/no-deprecated')).toBe(true);
  });

  it('stays quiet for props that are not deprecated', async () => {
    const result = await validateSnippet(data, wrap('<Button variant="primary">Save</Button>'));
    expect(result.findings.filter((f) => f.ruleId === 'loui/no-deprecated')).toEqual([]);
  });

  describe('get_component', () => {
    let client: Client;
    beforeAll(async () => {
      const server = createServer(data);
      const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
      client = new Client({ name: 'test', version: '0.0.0' });
      await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
    });
    afterAll(async () => {
      await client.close();
    });

    it('exposes the deprecation on the prop', async () => {
      const result = await client.callTool({
        name: 'get_component',
        arguments: { name: 'Button' },
      });
      const out = result.structuredContent as {
        props: { name: string; deprecated?: string }[];
      };
      expect(out.props.find((p) => p.name === 'legacyTone')?.deprecated).toBe('Use variant.');
      expect(out.props.find((p) => p.name === 'oldSize')?.deprecated).toBe('');
      expect(out.props.find((p) => p.name === 'variant')?.deprecated).toBeUndefined();
      const text = (result.content as { text: string }[])[0]?.text ?? '';
      expect(text).toContain('DEPRECATED: Use variant.');
    });
  });
});
