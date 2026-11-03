import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { findByName, suggest, type DsData } from './data.ts';
import { rank, searchableEntry, searchableRecipe } from './search.ts';
import type { ManifestEntry, Token } from './types.ts';
import { validateSnippet } from './validate.ts';

export const SERVER_NAME = 'loui-ds';
export const SERVER_VERSION = '0.0.0';

const GUIDE_TOPICS = {
  principles: 'principles',
  content: 'content-guidelines',
  accessibility: 'accessibility',
  'getting-started': 'getting-started',
  'using-with-ai': 'using-with-ai',
} as const;

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

function ok(text: string, structured: Record<string, unknown>): CallToolResult {
  return { content: [{ type: 'text', text }], structuredContent: structured };
}

function fail(text: string): CallToolResult {
  return { content: [{ type: 'text', text }], isError: true };
}

function oneLine(text: string | undefined, max = 180): string {
  const flat = (text ?? '').replace(/\s+/g, ' ').trim();
  const sentence = /^.*?[.!?](?=\s|$)/.exec(flat)?.[0] ?? flat;
  return sentence.length > max ? `${sentence.slice(0, max - 1).trimEnd()}…` : sentence;
}

function groupOf(entry: ManifestEntry): string {
  if (entry.kind !== 'component') return entry.kind;
  return entry.stories?.title?.split('/')[0] ?? 'Components';
}

function describeEntry(entry: ManifestEntry, data: DsData) {
  const section = (id: string) => entry.docs?.sections?.find((s) => s.id === id)?.content;
  return {
    name: entry.name,
    kind: entry.kind,
    group: groupOf(entry),
    status: entry.status ?? 'stable',
    entryPoint: entry.entryPoint,
    importStatement: entry.importStatement,
    description: (entry.docs?.summary ?? entry.description ?? '').trim(),
    ...(entry.signature ? { signature: entry.signature } : {}),
    props: (entry.props ?? []).map((p) => ({
      name: p.name,
      type: p.type ?? '',
      required: p.required === true,
      ...(p.default === undefined ? {} : { default: p.default }),
      ...(p.values ? { values: p.values } : {}),
      description: p.description ?? '',
      ...(p.deprecated === undefined || p.deprecated === false
        ? {}
        : { deprecated: p.deprecated === true ? '' : p.deprecated }),
    })),
    variants: entry.variants ?? {},
    messages: (entry.messages?.keys ?? []).map((k) => ({
      key: k.key,
      ...(k.default === undefined ? {} : { default: k.default }),
      ...(k.signature ? { signature: k.signature } : {}),
      description: k.description ?? '',
    })),
    accessibility: {
      notes: section('accessibility') ?? '',
      keyboard: entry.docs?.keyboard ?? [],
    },
    contentRules: section('content-rules') ?? '',
    whenToUse: entry.docs?.whenToUse ?? [],
    whenNotToUse: entry.docs?.whenNotToUse ?? [],
    examples: entry.docs?.examples ?? [],
    related: {
      alternatives: (entry.related?.alternatives ?? []).map((a) => ({
        name: a.name,
        reason: a.reason ?? '',
      })),
      uses: entry.related?.uses ?? [],
      usedBy: entry.related?.usedBy ?? [],
    },
    cssVariables: entry.cssVariables ?? [],
    stories: (entry.stories?.items ?? []).map((s) => s.name),
    resource: `loui://components/${entry.name}`,
    hasGeneratedDoc: data.readComponentDoc(entry.name) !== null,
  };
}

function componentText(c: ReturnType<typeof describeEntry>): string {
  const lines = [`# ${c.name} (${c.kind}, ${c.status})`, '', c.importStatement, '', c.description];
  if (c.props.length) {
    lines.push('', '## Props');
    for (const p of c.props) {
      const bits = [`${p.name}${p.required ? ' (required)' : ''}: ${p.type}`];
      if (p.default !== undefined) bits.push(`default ${p.default}`);
      if (p.deprecated !== undefined) {
        bits.push(`DEPRECATED${p.deprecated ? `: ${p.deprecated}` : ''} Do not use`);
      }
      lines.push(`- ${bits.join(', ')}. ${oneLine(p.description, 140)}`);
    }
  }
  const variantKeys = Object.keys(c.variants);
  if (variantKeys.length) {
    lines.push('', '## Variants');
    for (const k of variantKeys) lines.push(`- ${k}: ${(c.variants[k] ?? []).join(' | ')}`);
  }
  if (c.messages.length) {
    lines.push('', `## Message keys`, c.messages.map((m) => m.key).join(', '));
  }
  if (c.accessibility.keyboard.length || c.accessibility.notes) {
    lines.push('', '## Accessibility', ...c.accessibility.keyboard.map((k) => `- ${k}`));
    if (c.accessibility.notes) lines.push('', c.accessibility.notes);
  }
  if (c.whenNotToUse.length)
    lines.push('', '## When not to use', ...c.whenNotToUse.map((w) => `- ${w}`));
  for (const ex of c.examples) lines.push('', '## Example', '```tsx', ex, '```');
  if (c.related.alternatives.length) {
    lines.push(
      '',
      '## Alternatives',
      ...c.related.alternatives.map((a) => `- ${a.name}: ${oneLine(a.reason, 160)}`),
    );
  }
  if (c.related.uses.length) lines.push('', `Uses: ${c.related.uses.join(', ')}`);
  if (c.related.usedBy.length) lines.push(`Used by: ${c.related.usedBy.join(', ')}`);
  return lines.join('\n');
}

function tokenView(t: Token) {
  const allowed = (t.pairings?.allowed ?? []).map((p) => ({
    on: p.on,
    ratio: p.ratio,
    min: p.min,
    ...(p.usage ? { usage: p.usage } : {}),
  }));
  const notAllowed = (t.pairings?.notAllowed ?? []).map((p) => ({
    on: p.on,
    ratio: p.ratio,
    min: p.min,
  }));
  // Surface tokens list the foregrounds that pass on them instead.
  const foregrounds = (t.foregrounds ?? []).map((f) => ({
    token: f.token,
    ratio: f.ratio,
    min: f.min,
  }));
  return {
    name: t.name,
    cssVar: t.cssVar,
    value: t.value,
    type: t.type,
    tier: t.tier,
    ...(t.aliasOf ? { aliasOf: t.aliasOf } : {}),
    description: t.description ?? '',
    pairings: { allowedOn: allowed, notAllowedOn: notAllowed, foregroundsThatPass: foregrounds },
  };
}

/** Builds the MCP server. Pass `data` from `loadData()`. */
export function createServer(data: DsData): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        'Loui DS design system. Use list_components and get_component for exact names and props, search_tokens for CSS variables, get_guidelines for rules, get_recipe for tested compositions, and always run validate_snippet on generated TSX before presenting it.',
    },
  );

  // ---- list_components -------------------------------------------------------------------
  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description:
        'Lists Loui DS exports with entry point, status and a one-line description. Filter by group (Components, Primitives, Patterns), status (experimental, stable, deprecated), kind and a free-text query. Never use deprecated entries.',
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe(
            'Free text, a name or a plain description of the UI ("table of orders with sorting"). Results are ranked by relevance to name, summary and when-to-use text.',
          ),
        group: z
          .enum(['Components', 'Primitives', 'Patterns'])
          .optional()
          .describe('Storybook group of the component.'),
        status: z.enum(['experimental', 'stable', 'deprecated']).optional(),
        kind: z
          .enum(['component', 'provider', 'hook', 'utility', 'any'])
          .default('component')
          .describe(
            'Export kind. Defaults to components; "any" includes providers, hooks and utilities.',
          ),
      },
      outputSchema: {
        count: z.number(),
        items: z.array(
          z.object({
            name: z.string(),
            kind: z.string(),
            group: z.string(),
            entryPoint: z.string(),
            importStatement: z.string(),
            status: z.string(),
            description: z.string(),
          }),
        ),
      },
      annotations: READ_ONLY,
    },
    ({ query, group, status, kind }) => {
      const q = query?.trim();
      const pool = data.entries
        .filter((e) => kind === 'any' || e.kind === kind)
        .filter((e) => !group || groupOf(e) === group)
        .filter((e) => !status || (e.status ?? 'stable') === status);
      const order = q ? rank(pool.map(searchableEntry), q).map((r) => r.name) : null;
      const ordered = order
        ? order.flatMap((n) => pool.filter((e) => e.name === n))
        : [...pool].sort((a, b) => a.name.localeCompare(b.name));
      const items = ordered.map((e) => ({
        name: e.name,
        kind: e.kind,
        group: groupOf(e),
        entryPoint: e.entryPoint,
        importStatement: e.importStatement,
        status: e.status ?? 'stable',
        description: oneLine(e.docs?.summary ?? e.description),
      }));
      const text = items.length
        ? [
            `${items.length} match${items.length === 1 ? '' : 'es'}:`,
            ...items.map(
              (i) => `- ${i.name} [${i.group}, ${i.status}, ${i.entryPoint}]: ${i.description}`,
            ),
          ].join('\n')
        : 'No matches. Call list_components without filters to see everything.';
      return ok(text, { count: items.length, items });
    },
  );

  // ---- get_component ---------------------------------------------------------------------
  server.registerTool(
    'get_component',
    {
      title: 'Get component',
      description:
        'Returns everything about one export: import statement, props (types, required, defaults, docs), variants, message keys, accessibility and keyboard notes, examples and related components. Also works for providers, hooks and utilities.',
      inputSchema: {
        name: z
          .string()
          .min(1)
          .describe('Export name, e.g. "Button" or "DSProvider". Case-insensitive.'),
      },
      outputSchema: {
        name: z.string(),
        kind: z.string(),
        group: z.string(),
        status: z.string(),
        entryPoint: z.string(),
        importStatement: z.string(),
        description: z.string(),
        props: z.array(
          z.object({
            name: z.string(),
            type: z.string(),
            required: z.boolean(),
            default: z.string().optional(),
            values: z.array(z.string()).optional(),
            description: z.string(),
            deprecated: z
              .string()
              .optional()
              .describe('Set when the prop is deprecated: the migration hint (may be empty).'),
          }),
        ),
        variants: z.record(z.string(), z.array(z.string())),
        messages: z.array(
          z.object({
            key: z.string(),
            default: z.string().optional(),
            signature: z.string().optional(),
            description: z.string(),
          }),
        ),
        accessibility: z.object({ notes: z.string(), keyboard: z.array(z.string()) }),
        contentRules: z.string(),
        whenToUse: z.array(z.string()),
        whenNotToUse: z.array(z.string()),
        examples: z.array(z.string()),
        related: z.object({
          alternatives: z.array(z.object({ name: z.string(), reason: z.string() })),
          uses: z.array(z.string()),
          usedBy: z.array(z.string()),
        }),
        cssVariables: z.array(z.string()),
        stories: z.array(z.string()),
        resource: z.string(),
        hasGeneratedDoc: z.boolean(),
        signature: z.string().optional(),
      },
      annotations: READ_ONLY,
    },
    ({ name }) => {
      const entry = findByName(data.entries, name);
      if (!entry) {
        const hints = suggest(
          name,
          data.entries.map((e) => e.name),
        );
        return fail(
          `No export named "${name}".${hints.length ? ` Did you mean: ${hints.join(', ')}?` : ''} Call list_components to browse.`,
        );
      }
      const view = describeEntry(entry, data);
      return ok(componentText(view), view);
    },
  );

  // ---- search_tokens ---------------------------------------------------------------------
  server.registerTool(
    'search_tokens',
    {
      title: 'Search design tokens',
      description:
        'Searches design tokens by name, CSS variable, value or description. Returns the CSS variable, resolved value, usage description and contrast-checked pairings (which text tokens are allowed on which surfaces). Prefer semantic tokens; primitive and core tokens exist to define them.',
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe('Text to match, e.g. "danger", "--ds-space", "border", "#050506".'),
        type: z
          .enum([
            'color',
            'dimension',
            'shadow',
            'fontFamily',
            'fontWeight',
            'typography',
            'duration',
            'cubicBezier',
            'number',
          ])
          .optional()
          .describe('DTCG token type.'),
        tier: z
          .enum(['semantic', 'core', 'primitive', 'any'])
          .default('semantic')
          .describe('Token tier. Defaults to semantic, the only tier app code should use.'),
        limit: z.number().int().min(1).max(100).default(25),
      },
      outputSchema: {
        total: z.number(),
        returned: z.number(),
        tokens: z.array(
          z.object({
            name: z.string(),
            cssVar: z.string(),
            value: z.string(),
            type: z.string(),
            tier: z.string(),
            aliasOf: z.string().optional(),
            description: z.string(),
            pairings: z.object({
              allowedOn: z.array(
                z.object({
                  on: z.array(z.string()),
                  ratio: z.number(),
                  min: z.number(),
                  usage: z.string().optional(),
                }),
              ),
              notAllowedOn: z.array(
                z.object({ on: z.array(z.string()), ratio: z.number(), min: z.number() }),
              ),
              foregroundsThatPass: z.array(
                z.object({ token: z.string(), ratio: z.number(), min: z.number() }),
              ),
            }),
          }),
        ),
      },
      annotations: READ_ONLY,
    },
    ({ query, type, tier, limit }) => {
      const terms = (query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
      const matches = data.tokens
        .filter((t) => tier === 'any' || t.tier === tier)
        .filter((t) => !type || t.type === type)
        .filter((t) => {
          const hay =
            `${t.name} ${t.cssVar} ${t.value} ${t.cssValue ?? ''} ${t.description ?? ''}`.toLowerCase();
          return terms.every((term) => hay.includes(term));
        });
      const tokens = matches.slice(0, limit).map(tokenView);
      const text = tokens.length
        ? [
            `${tokens.length} of ${matches.length} token${matches.length === 1 ? '' : 's'}:`,
            ...tokens.map((t) => {
              const ok = t.pairings.allowedOn.flatMap((p) =>
                p.on.map((o) => o.replace(/^color\./, '')),
              );
              return `- var(${t.cssVar}) = ${t.value} [${t.type}, ${t.tier}]: ${oneLine(t.description, 140)}${ok.length ? ` Allowed on: ${ok.join(', ')}.` : ''}`;
            }),
          ].join('\n')
        : 'No tokens match. Try a broader query, tier "any", or omit the type.';
      return ok(text, { total: matches.length, returned: tokens.length, tokens });
    },
  );

  // ---- get_guidelines --------------------------------------------------------------------
  server.registerTool(
    'get_guidelines',
    {
      title: 'Get guidelines',
      description:
        'Returns a Loui DS guide as Markdown: principles (the rules), content (microcopy), accessibility, getting-started (install and setup) or using-with-ai.',
      inputSchema: {
        topic: z.enum([
          'principles',
          'content',
          'accessibility',
          'getting-started',
          'using-with-ai',
        ]),
      },
      outputSchema: { topic: z.string(), resource: z.string(), markdown: z.string() },
      annotations: READ_ONLY,
    },
    ({ topic }) => {
      const file = GUIDE_TOPICS[topic];
      const markdown = data.readGuide(file);
      if (markdown === null) return fail(`The guide "${file}" is not available in ${data.root}.`);
      return ok(markdown, { topic, resource: `loui://guides/${file}`, markdown });
    },
  );

  // ---- get_recipe ------------------------------------------------------------------------
  server.registerTool(
    'get_recipe',
    {
      title: 'Get recipe',
      description:
        'Returns a tested composition recipe (docs/recipes/<name>.md) such as a settings page or a data table screen. Without a name, lists the available recipes. Recipes are being written; the list may be empty.',
      inputSchema: {
        name: z
          .string()
          .optional()
          .describe('Recipe file name without extension. Omit to list recipes.'),
        query: z
          .string()
          .optional()
          .describe(
            'Plain description of the screen ("confirm before deleting a customer"). Returns the best matching recipe names, ranked, in `matches`. Ignored when `name` is given.',
          ),
      },
      outputSchema: {
        matches: z.array(z.string()).optional(),
        available: z.array(z.string()),
        name: z.string().optional(),
        markdown: z.string().optional(),
        message: z.string().optional(),
      },
      annotations: READ_ONLY,
    },
    ({ name, query }) => {
      const available = data.recipeNames();
      if (!name && query?.trim()) {
        const matches = rank(
          available.map((n) => searchableRecipe(n, data.readRecipe(n) ?? '')),
          query,
        ).map((r) => r.name);
        const message = matches.length
          ? `Best matching recipes: ${matches.join(', ')}.`
          : `No recipe matches "${query}". Available: ${available.join(', ')}.`;
        return ok(message, { matches, available, message });
      }
      if (!name) {
        const message = available.length
          ? `Available recipes: ${available.join(', ')}.`
          : 'No recipes yet. Recipes are tested compositions that are still being written (docs/recipes/). Until then, compose from get_component examples and the principles guide, and run validate_snippet.';
        return ok(message, { available, message });
      }
      const match = available.find((a) => a.toLowerCase() === name.trim().toLowerCase());
      const markdown = match ? data.readRecipe(match) : null;
      if (!match || markdown === null) {
        const hints = suggest(name, available);
        const message = available.length
          ? `No recipe named "${name}".${hints.length ? ` Did you mean ${hints.join(', ')}?` : ''} Available: ${available.join(', ')}.`
          : `No recipe named "${name}": there are no recipes yet. Compose from get_component examples and run validate_snippet.`;
        return { ...ok(message, { available, message }), isError: false };
      }
      return ok(markdown, { available, name: match, markdown });
    },
  );

  // ---- validate_snippet ------------------------------------------------------------------
  server.registerTool(
    'validate_snippet',
    {
      title: 'Validate TSX snippet',
      description:
        'Checks a TSX snippet against the design system: runs eslint-plugin-loui (raw colors and spacing, one primary action, icon button labels, deprecated APIs, icons, microcopy, inline styles) and verifies that every @loui/ds import exists, required props are present and literal prop values are allowed. Returns findings with line, column and a fix hint. Run it on all generated UI code.',
      inputSchema: {
        code: z.string().min(1).describe('TSX source of the snippet or file.'),
        filename: z
          .string()
          .default('snippet.tsx')
          .describe('Optional file name, used for the language mode.'),
      },
      outputSchema: {
        ok: z.boolean(),
        errors: z.number(),
        warnings: z.number(),
        findings: z.array(
          z.object({
            ruleId: z.string(),
            severity: z.enum(['error', 'warning']),
            message: z.string(),
            line: z.number(),
            column: z.number(),
            endLine: z.number().optional(),
            endColumn: z.number().optional(),
            fix: z.string(),
          }),
        ),
      },
      annotations: READ_ONLY,
    },
    async ({ code, filename }) => {
      const result = await validateSnippet(data, code, filename);
      const text = result.findings.length
        ? [
            `${result.errors} error(s), ${result.warnings} warning(s):`,
            ...result.findings.map(
              (f) =>
                `- ${f.line}:${f.column} ${f.severity} ${f.ruleId}: ${f.message}${f.fix ? `\n    Fix: ${f.fix}` : ''}`,
            ),
          ].join('\n')
        : 'No findings. The snippet follows the checked design rules.';
      return ok(text, { ...result });
    },
  );

  // ---- resources -------------------------------------------------------------------------
  const markdown = (uri: URL, text: string) => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text }],
  });

  server.registerResource(
    'guide',
    new ResourceTemplate('loui://guides/{name}', {
      list: () => ({
        resources: data.guideNames().map((n) => ({
          uri: `loui://guides/${n}`,
          name: `guide-${n}`,
          mimeType: 'text/markdown',
          description: `Loui DS guide: ${n}`,
        })),
      }),
      complete: { name: (value) => data.guideNames().filter((n) => n.startsWith(value)) },
    }),
    {
      title: 'Loui DS guides',
      description: 'Markdown guides: principles, content, accessibility, ...',
      mimeType: 'text/markdown',
    },
    (uri, variables) => {
      const name = String(variables['name']);
      const text = data.readGuide(name);
      if (text === null)
        throw new Error(`Unknown guide "${name}". Available: ${data.guideNames().join(', ')}`);
      return markdown(uri, text);
    },
  );

  server.registerResource(
    'component',
    new ResourceTemplate('loui://components/{name}', {
      list: () => ({
        resources: data.manifest.components.map((c) => ({
          uri: `loui://components/${c.name}`,
          name: `component-${c.name}`,
          mimeType: 'text/markdown',
          description: oneLine(c.docs?.summary ?? c.description, 120),
        })),
      }),
      complete: {
        name: (value) =>
          data.entries
            .map((e) => e.name)
            .filter((n) => n.toLowerCase().startsWith(value.toLowerCase())),
      },
    }),
    {
      title: 'Loui DS component pages',
      description: 'Generated Markdown page per export.',
      mimeType: 'text/markdown',
    },
    (uri, variables) => {
      const requested = String(variables['name']);
      const entry = findByName(data.entries, requested);
      if (!entry) throw new Error(`Unknown component "${requested}".`);
      const text = data.readComponentDoc(entry.name) ?? componentText(describeEntry(entry, data));
      return markdown(uri, text);
    },
  );

  server.registerResource(
    'llms-txt',
    'loui://llms.txt',
    {
      title: 'llms.txt',
      description: 'Index with the rules for generated UI.',
      mimeType: 'text/markdown',
    },
    (uri) =>
      markdown(uri, data.llmsTxt ?? '# Loui DS\n\nllms.txt is not available in this install.'),
  );

  server.registerResource(
    'content-rules',
    'loui://content-rules',
    {
      title: 'Content rules',
      description: 'Machine-readable microcopy rules.',
      mimeType: 'application/json',
    },
    (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(data.contentRules ?? {}, null, 2),
        },
      ],
    }),
  );

  return server;
}
