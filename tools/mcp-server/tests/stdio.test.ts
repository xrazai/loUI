import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { describe, expect, it } from 'vitest';
import { resolveRoot } from '../src/data.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(here, '..', 'src', 'cli.ts');

describe('stdio server (real process)', () => {
  it('serves tools/list and get_component over stdio', async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [cli],
      stderr: 'pipe',
    });
    const client = new Client({ name: 'stdio-test', version: '0.0.0' });
    await client.connect(transport);
    try {
      expect(transport.pid).toBeTypeOf('number');
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name)).toContain('validate_snippet');
      const result = await client.callTool({
        name: 'get_component',
        arguments: { name: 'Button' },
      });
      const out = result.structuredContent as { name: string; props: { name: string }[] };
      expect(out.name).toBe('Button');
      expect(out.props.some((p) => p.name === 'variant')).toBe(true);
    } finally {
      await client.close(); // stops only the child process this transport started
    }
  });

  it('fails loudly when an explicit data root is wrong', () => {
    expect(() => resolveRoot({ root: path.join(here, 'no-such-dir') })).toThrow(/manifest.json/);
  });

  it('finds the repository docs by default', () => {
    expect(resolveRoot()).toMatch(/docs$/);
  });
});
