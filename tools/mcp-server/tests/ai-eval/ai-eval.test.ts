import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadData } from '../../src/data.ts';
import { createServer } from '../../src/server.ts';
import { CASES } from './prompts.ts';

/**
 * AI-014: runs natural-language prompts through the MCP server (in memory, no process
 * spawn) and checks the AI-facing docs surface the right components and recipes.
 */
let client: Client;
const data = loadData();

beforeAll(async () => {
  const server = createServer(data);
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'ai-eval', version: '0.0.0' });
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
});

afterAll(async () => {
  await client.close();
});

// The type parameter only types the structured result for the caller.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
async function call<T>(name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args });
  const text = (result.content as { type: string; text: string }[])[0]?.text ?? '';
  return { text, data: result.structuredContent as T };
}

async function rankedNames(query: string, anyKind: boolean | undefined): Promise<string[]> {
  const out = await call<{ items: { name: string }[] }>('list_components', {
    query,
    ...(anyKind ? { kind: 'any' } : {}),
  });
  return out.data.items.map((i) => i.name);
}

async function rankedRecipes(query: string): Promise<string[]> {
  return (await call<{ matches: string[] }>('get_recipe', { query })).data.matches;
}

describe('ai-eval: prompts find the right components', () => {
  it('has a meaningful number of cases', () => {
    expect(CASES.length).toBeGreaterThanOrEqual(30);
  });

  for (const c of CASES) {
    it(c.prompt, async () => {
      const names = await rankedNames(c.prompt, c.anyKind);
      const topN = c.top ?? 5;
      const avoidN = c.excludeTop ?? 3;
      const seen = names.slice(0, 8).join(', ');
      for (const wanted of c.include) {
        expect(names.slice(0, topN), `"${wanted}" should be in the top ${topN}: ${seen}`).toContain(
          wanted,
        );
      }
      for (const unwanted of c.exclude ?? []) {
        expect(
          names.slice(0, avoidN),
          `"${unwanted}" must not be in the top ${avoidN}: ${seen}`,
        ).not.toContain(unwanted);
      }
      for (const [first, second] of c.before ?? []) {
        const a = names.indexOf(first);
        const b = names.indexOf(second);
        expect(a, `${first} should be found: ${seen}`).toBeGreaterThanOrEqual(0);
        if (b !== -1) expect(a, `${first} should rank above ${second}: ${seen}`).toBeLessThan(b);
      }
      if (c.recipes) {
        const recipes = (await rankedRecipes(c.prompt)).slice(0, 2);
        for (const recipe of c.recipes) expect(recipes).toContain(recipe);
      }
      for (const fact of c.facts ?? []) {
        const { text } = await call<unknown>('get_component', { name: fact.name });
        for (const phrase of fact.contains) {
          expect(text.toLowerCase()).toContain(phrase.toLowerCase());
        }
      }
    });
  }
});

/** Code blocks of a recipe, between the generated source markers when present. */
function tsxBlocks(markdown: string): string[] {
  const marked = /<!-- recipe-source:start -->([\s\S]*?)<!-- recipe-source:end -->/.exec(markdown);
  const body = marked?.[1] ?? markdown;
  return [...body.matchAll(/```tsx\n([\s\S]*?)```/g)].map((m) => m[1] ?? '');
}

describe('ai-eval: recipe snippets referenced by the cases pass validate_snippet', () => {
  const referenced = [...new Set(CASES.flatMap((c) => c.recipes ?? []))].sort();

  it('every referenced recipe exists', () => {
    for (const name of referenced) expect(data.recipeNames()).toContain(name);
  });

  for (const name of referenced) {
    it(name, async () => {
      const blocks = tsxBlocks(data.readRecipe(name) ?? '');
      expect(blocks.length, 'recipe has a tsx snippet').toBeGreaterThan(0);
      for (const code of blocks) {
        const { data: out } = await call<{
          ok: boolean;
          findings: { ruleId: string; severity: string; line: number; message: string }[];
        }>('validate_snippet', { code });
        const errors = out.findings.filter((f) => f.severity === 'error');
        expect(errors, JSON.stringify(errors)).toEqual([]);
        expect(out.ok).toBe(true);
      }
    });
  }
});
