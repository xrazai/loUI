import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadData } from '../src/data.ts';
import { createServer } from '../src/server.ts';

interface Finding {
  ruleId: string;
  severity: string;
  line: number;
  column: number;
  message: string;
  fix: string;
}

let client: Client;
const data = loadData();

beforeAll(async () => {
  const server = createServer(data);
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'test', version: '0.0.0' });
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
});

afterAll(async () => {
  await client.close();
});

// The type parameter only types the structured result for the caller.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
async function call<T = Record<string, unknown>>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<{ result: Awaited<ReturnType<Client['callTool']>>; text: string; data: T }> {
  const result = await client.callTool({ name, arguments: args });
  const text = (result.content as { type: string; text: string }[])[0]?.text ?? '';
  if (result.isError && process.env['DEBUG_MCP']) console.error(text);
  return { result, text, data: result.structuredContent as T };
}

async function validate(code: string) {
  const { data: out } = await call<{ ok: boolean; errors: number; findings: Finding[] }>(
    'validate_snippet',
    { code },
  );
  return out;
}

describe('server', () => {
  it('lists the six tools with structured output schemas', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'get_component',
      'get_guidelines',
      'get_recipe',
      'list_components',
      'search_tokens',
      'validate_snippet',
    ]);
    for (const tool of tools) expect(tool.outputSchema).toBeDefined();
  });

  it('reads the repository data', () => {
    expect(data.manifest.components.length).toBeGreaterThan(50);
    expect(data.tokens.length).toBeGreaterThan(100);
  });
});

describe('list_components', () => {
  it('lists components with entry point and description', async () => {
    const { data: out, text } = await call<{
      count: number;
      items: { name: string; entryPoint: string; description: string }[];
    }>('list_components');
    expect(out.count).toBe(data.manifest.components.length);
    const button = out.items.find((i) => i.name === 'Button');
    expect(button?.entryPoint).toBe('loui-ds');
    expect(button?.description.length).toBeGreaterThan(5);
    expect(text).toContain('Button');
  });

  it('filters by query, status and kind', async () => {
    const q = await call<{ items: { name: string }[] }>('list_components', { query: 'button' });
    expect(q.data.items.map((i) => i.name)).toContain('IconButton');
    const none = await call<{ count: number }>('list_components', { status: 'deprecated' });
    expect(none.data.count).toBe(0);
    const hooks = await call<{ items: { name: string; kind: string }[] }>('list_components', {
      kind: 'hook',
    });
    expect(hooks.data.items.every((i) => i.kind === 'hook')).toBe(true);
    expect(hooks.data.items.length).toBeGreaterThan(0);
  });

  it('filters by group', async () => {
    const out = await call<{ items: { group: string }[] }>('list_components', {
      group: 'Primitives',
    });
    expect(out.data.items.length).toBeGreaterThan(0);
    expect(out.data.items.every((i) => i.group === 'Primitives')).toBe(true);
  });
});

describe('get_component', () => {
  it('returns props, variants, examples and accessibility notes', async () => {
    const { data: out, text } = await call<{
      name: string;
      importStatement: string;
      props: { name: string; required: boolean; values?: string[] }[];
      variants: Record<string, string[]>;
      examples: string[];
      accessibility: { keyboard: string[] };
    }>('get_component', { name: 'iconbutton' });
    expect(out.name).toBe('IconButton');
    expect(out.importStatement).toContain('IconButton');
    expect(out.props.find((p) => p.name === 'label')?.required).toBe(true);
    expect(out.variants['variant']).toContain('ghost');
    expect(out.examples.length).toBeGreaterThan(0);
    expect(out.accessibility.keyboard.length).toBeGreaterThan(0);
    expect(text).toContain('label (required)');
  });

  it('returns message keys for components that have them', async () => {
    const withMessages = data.manifest.components.find((c) => c.messages?.keys?.length);
    expect(withMessages).toBeDefined();
    const { data: out } = await call<{ messages: { key: string }[] }>('get_component', {
      name: withMessages?.name,
    });
    expect(out.messages.length).toBeGreaterThan(0);
  });

  it('suggests names for a typo', async () => {
    const { result, text } = await call('get_component', { name: 'Buton' });
    expect(result.isError).toBe(true);
    expect(text).toContain('Button');
  });
});

describe('search_tokens', () => {
  it('finds semantic color tokens with pairings', async () => {
    const { data: out } = await call<{
      tokens: { name: string; cssVar: string; tier: string; pairings: { allowedOn: unknown[] } }[];
    }>('search_tokens', { query: 'text-2', type: 'color' });
    const token = out.tokens.find((t) => t.name === 'color.text-2');
    expect(token?.cssVar).toBe('--ds-text-2');
    expect(token?.tier).toBe('semantic');
    expect(token?.pairings.allowedOn.length).toBeGreaterThan(0);
  });

  it('hides primitive tokens unless asked', async () => {
    const semantic = await call<{ tokens: { tier: string }[] }>('search_tokens', {
      query: 'gray',
      limit: 100,
    });
    expect(semantic.data.tokens.every((t) => t.tier === 'semantic')).toBe(true);
    const any = await call<{ tokens: { tier: string }[] }>('search_tokens', {
      query: 'gray',
      tier: 'any',
      limit: 100,
    });
    expect(any.data.tokens.some((t) => t.tier === 'primitive')).toBe(true);
  });

  it('filters by type', async () => {
    const out = await call<{ tokens: { type: string }[] }>('search_tokens', {
      type: 'dimension',
      tier: 'any',
    });
    expect(out.data.tokens.length).toBeGreaterThan(0);
    expect(out.data.tokens.every((t) => t.type === 'dimension')).toBe(true);
  });
});

describe('get_guidelines', () => {
  it.each(['principles', 'content', 'accessibility', 'getting-started', 'using-with-ai'])(
    'returns the %s guide',
    async (topic) => {
      const { data: out } = await call<{ markdown: string; resource: string }>('get_guidelines', {
        topic,
      });
      expect(out.markdown.startsWith('#')).toBe(true);
      expect(out.resource).toMatch(/^loui:\/\/guides\//);
    },
  );

  it('rejects an unknown topic', async () => {
    const { result, text } = await call('get_guidelines', { topic: 'nope' });
    expect(result.isError).toBe(true);
    expect(text).toContain('topic');
  });
});

describe('get_recipe', () => {
  it('lists recipes, or says there are none yet, when called without a name', async () => {
    const { data: out, text } = await call<{ available: string[] }>('get_recipe');
    expect(Array.isArray(out.available)).toBe(true);
    if (out.available.length === 0) expect(text).toContain('No recipes yet');
  });

  it('answers helpfully for an unknown recipe', async () => {
    const { result, text } = await call('get_recipe', { name: 'does-not-exist' });
    expect(result.isError).toBeFalsy();
    expect(text).toContain('does-not-exist');
  });
});

describe('validate_snippet', () => {
  it('accepts a clean snippet', async () => {
    const out = await validate(`
import { Button, IconButton, PlusIcon } from 'loui-ds';
export function Toolbar() {
  return (
    <div>
      <Button variant="primary">Add order</Button>
      <IconButton label="Add order" icon={PlusIcon} />
    </div>
  );
}`);
    expect(out.findings).toEqual([]);
    expect(out.ok).toBe(true);
  });

  it('catches a raw color with line and column', async () => {
    const out = await validate(`import { Button } from 'loui-ds';
export const A = () => <div style={{ color: '#ff0000' }}><Button>Save</Button></div>;`);
    const f = out.findings.find((x) => x.ruleId === 'loui/no-raw-colors');
    expect(f).toBeDefined();
    expect(f?.line).toBe(2);
    expect(f?.column).toBeGreaterThan(0);
    expect(f?.fix).toContain('search_tokens');
    expect(out.ok).toBe(false);
  });

  it('catches a missing IconButton label', async () => {
    const out = await validate(`import { IconButton, PlusIcon } from 'loui-ds';
export const A = () => <IconButton icon={PlusIcon} />;`);
    const ids = out.findings.map((f) => f.ruleId);
    expect(ids).toContain('loui/icon-button-label');
    expect(ids).toContain('loui-mcp/missing-required-prop');
    const missing = out.findings.find((f) => f.ruleId === 'loui-mcp/missing-required-prop');
    expect(missing?.message).toContain('label');
  });

  it('catches an unknown component import and suggests a name', async () => {
    const out = await validate(`import { Buton } from 'loui-ds';
export const A = () => <Buton>Save</Buton>;`);
    const f = out.findings.find((x) => x.ruleId === 'loui-mcp/unknown-export');
    expect(f?.message).toContain('Buton');
    expect(f?.message).toContain('Button');
    expect(f?.line).toBe(1);
  });

  it('catches a component used without an import', async () => {
    const out = await validate(`export const A = () => <Button>Save</Button>;`);
    expect(out.findings.map((f) => f.ruleId)).toContain('loui-mcp/missing-import');
  });

  it('catches a namespace-imported component that does not exist', async () => {
    const out = await validate(`import * as DS from 'loui-ds';
export const A = () => <DS.Fancy />;`);
    expect(out.findings.map((f) => f.ruleId)).toContain('loui-mcp/unknown-export');
  });

  it('catches a literal prop value that is not allowed', async () => {
    const out = await validate(`import { Button } from 'loui-ds';
export const A = () => <Button variant="huge">Save</Button>;`);
    const f = out.findings.find((x) => x.ruleId === 'loui-mcp/invalid-prop-value');
    expect(f?.message).toContain('primary');
  });

  it('does not report required props when props are spread', async () => {
    const out = await validate(`import { IconButton } from 'loui-ds';
export const A = (p: object) => <IconButton {...p} />;`);
    expect(out.findings.map((f) => f.ruleId)).not.toContain('loui-mcp/missing-required-prop');
  });

  it('reports syntax errors as findings', async () => {
    const out = await validate(`export const A = () => <div>;`);
    expect(out.ok).toBe(false);
    expect(out.findings[0]?.ruleId).toBe('parse-error');
  });
});

describe('resources', () => {
  it('lists guides and reads one', async () => {
    const { resources } = await client.listResources();
    const uris = resources.map((r) => r.uri);
    expect(uris).toContain('loui://guides/principles');
    expect(uris).toContain('loui://components/Button');
    const read = await client.readResource({ uri: 'loui://guides/principles' });
    expect((read.contents[0] as { text: string }).text.startsWith('#')).toBe(true);
  });

  it('reads a component page', async () => {
    const read = await client.readResource({ uri: 'loui://components/Button' });
    expect((read.contents[0] as { text: string }).text).toContain('# Button');
  });

  it('exposes templates for guides and components', async () => {
    const { resourceTemplates } = await client.listResourceTemplates();
    expect(resourceTemplates.map((t) => t.uriTemplate).sort()).toEqual([
      'loui://components/{name}',
      'loui://guides/{name}',
    ]);
  });

  it('refuses path traversal in guide names', async () => {
    await expect(client.readResource({ uri: 'loui://guides/..%2F..%2Fpackage' })).rejects.toThrow();
  });
});
