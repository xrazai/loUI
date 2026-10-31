/**
 * Renders the AI-facing text documents from the manifests and the hand-written guides:
 * per-component Markdown pages, `llms.txt` (index, https://llmstxt.org) and `llms-full.txt`.
 * Links are relative so the same files work in `docs/` and in `dist/`.
 */
import type {
  Manifest,
  ManifestComponent,
  ManifestFunction,
  ManifestProp,
  TokenManifest,
} from './types';

export interface Guide {
  /** File name without extension, e.g. `principles`. */
  slug: string;
  title: string;
  description: string;
  /** Markdown body (starts with its own `# ` title). */
  content: string;
}

export const GUIDE_META: { slug: string; description: string }[] = [
  { slug: 'introduction', description: 'What Loui DS is and how it is organized.' },
  {
    slug: 'getting-started',
    description: 'Install, load the stylesheet, wrap the app in DSProvider, fonts, SSR.',
  },
  {
    slug: 'principles',
    description: 'The three visual rules, the product principles and the agent principles.',
  },
  {
    slug: 'content-guidelines',
    description: 'Microcopy rules: tone, casing, buttons, errors, empty states, numbers.',
  },
  {
    slug: 'accessibility',
    description: 'WCAG 2.2 AA target, keyboard model and how it is tested.',
  },
  {
    slug: 'using-with-ai',
    description: 'The manifest, llms.txt, content rules and Storybook MCP.',
  },
];

const cell = (text: string) => text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
const code = (text: string) => (text === '' ? '' : `\`${text.replace(/`/g, "'")}\``);

function table(header: string[], rows: string[][]): string {
  const lines = [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`];
  for (const row of rows) lines.push(`| ${row.map(cell).join(' | ')} |`);
  return lines.join('\n');
}

function propRows(props: ManifestProp[]): string[][] {
  return props.map((p) => [
    code(p.name),
    code(p.type),
    p.required ? 'yes' : '',
    code(p.default ?? ''),
    p.description,
  ]);
}

/** Markdown page for one component, generated from its manifest entry. */
export function renderComponentPage(c: ManifestComponent): string {
  const out: string[] = [];
  out.push(`# ${c.name}`, '');
  out.push(`> ${c.description || 'No description yet.'}`, '');
  if (c.docs?.summary) out.push(c.docs.summary, '');
  out.push(`- Import: ${code(c.importStatement)}`);
  out.push(
    `- Status: ${c.status}${c.status === 'experimental' ? ' (do not use in recipes until stable)' : ''}`,
  );
  out.push(`- Source: ${code(c.sourceFile)}`);
  if (c.stories.items.length > 0) {
    out.push(
      `- Stories (Storybook title ${code(c.stories.title)}): ${c.stories.items.map((s) => s.name).join(', ')}`,
    );
  }
  out.push('');

  if (c.props.length > 0) {
    out.push(
      '## Props',
      '',
      table(['Prop', 'Type', 'Required', 'Default', 'Description'], propRows(c.props)),
      '',
    );
  }
  const framework = c.inheritedProps.filter((g) => !g.domGeneric);
  const dom = c.inheritedProps.filter((g) => g.domGeneric);
  if (framework.length > 0 || dom.length > 0) {
    out.push('### Inherited props', '');
    for (const group of framework) {
      out.push(
        `- From ${code(group.interface)} (${group.source}): ${(group.props ?? []).map((p) => code(p.name)).join(', ')}`,
      );
    }
    if (dom.length > 0) {
      out.push(
        `- Standard DOM attributes, ARIA attributes and event handlers; other attributes and \`ref\` go to the root element.`,
      );
    }
    out.push('');
  }
  const variantLines = Object.entries(c.variants).map(
    ([k, v]) => `- ${code(k)}: ${v.map((x) => code(x)).join(', ')}`,
  );
  if (variantLines.length > 0) out.push('## Variants, sizes and tones', '', ...variantLines, '');

  if (c.messages) {
    out.push('## Messages (i18n)', '');
    out.push(
      `Locales shipped: ${c.messages.locales.join(', ')}. Override per instance with the ${code('messages')} prop` +
        (c.messages.providerKey
          ? ` or globally with ${code(`<DSProvider messages={{ ${c.messages.providerKey}: { ... } }}>`)}.`
          : '.'),
      '',
    );
    out.push(
      table(
        ['Key', 'English default', 'Notes'],
        c.messages.keys.map((m) => [
          code(m.key + (m.signature ?? '')),
          m.default === undefined ? '' : code(m.default),
          m.description ?? '',
        ]),
      ),
      '',
    );
  }
  if (c.cssVariables.length > 0) {
    out.push('## Design tokens used', '', c.cssVariables.map((v) => code(v)).join(', '), '');
  }
  const related: string[] = [];
  for (const alt of c.related.alternatives)
    related.push(`- Instead, see ${alt.name}: ${alt.reason}`);
  if (c.related.uses.length > 0) related.push(`- Renders: ${c.related.uses.join(', ')}`);
  if (c.related.usedBy.length > 0) related.push(`- Used by: ${c.related.usedBy.join(', ')}`);
  if (c.docs) {
    for (const section of c.docs.sections) {
      if (section.id === 'props' || section.id.startsWith('differences-from-the-handoff')) continue;
      out.push(`## ${section.heading}`, '', section.content, '');
    }
  }
  if (related.length > 0) out.push('## Related components', '', ...related, '');
  return `${out.join('\n').trimEnd()}\n`;
}

/** Markdown page for hooks, utilities and constants. */
export function renderFunctionsPage(manifest: Manifest): string {
  const out: string[] = ['# Hooks and utilities', ''];
  out.push(
    '> Hooks, locale-aware utilities and message helpers exported from `@loui/ds`. Money is an integer in minor units with an ISO 4217 code (ADR-0006).',
    '',
  );
  const render = (title: string, list: ManifestFunction[]) => {
    out.push(`## ${title}`, '');
    for (const f of list) {
      out.push(
        `### ${f.name}`,
        '',
        f.description || 'No description yet.',
        '',
        '```ts',
        f.signature,
        '```',
        '',
      );
    }
  };
  render('Hooks', manifest.hooks);
  render('Utilities and constants', manifest.utilities);
  out.push(
    '## Icons',
    '',
    manifest.icons.description,
    '',
    manifest.icons.names.map((n) => code(n)).join(', '),
    '',
  );
  return `${out.join('\n').trimEnd()}\n`;
}

const RULES = [
  'Use only components, hooks and tokens exported by the package; never write raw colors, px sizes, z-indexes or inline styles.',
  'One primary action per screen (`Button variant="primary"`), top right. The accent blue is for focus, selection and links only.',
  'Hierarchy comes from surface plus border; shadows only on overlays.',
  'Color never carries meaning alone: pair it with text or an icon with a name.',
  'Every interactive element needs an accessible name; icon-only controls require a `label`.',
  'Microcopy: English, sentence case, buttons are verb + object, no exclamation marks, no emoji. See content-rules.json.',
  'No user-visible string literals in components: use the message catalog and `DSProvider`.',
  'Money is integer minor units plus an ISO 4217 code; format dates, numbers and money with the provided utilities.',
  'Do not use `experimental` or `deprecated` components in recipes or generated code unless the user asks.',
];

const SUMMARY =
  'Loui DS is a dark, minimal, functional React design system (React 19, React Aria Components, CSS Modules, DTCG tokens) for internal tools, dashboards and apps. It is built to be operated by humans and AI agents.';

export function renderLlmsTxt(manifest: Manifest, tokens: TokenManifest, guides: Guide[]): string {
  const out: string[] = ['# Loui DS', '', `> ${SUMMARY}`, ''];
  out.push(
    `Package ${manifest.package.name}@${manifest.package.version}. Entry points: ${manifest.entryPoints.map((e) => code(e.importPath)).join(', ')}. All component and token names below are exact; do not invent others.`,
    '',
  );
  out.push('Rules for generated UI:', '', ...RULES.map((r) => `- ${r}`), '');
  out.push('## Guides', '');
  for (const g of guides) out.push(`- [${g.title}](./guides/${g.slug}.md): ${g.description}`);
  out.push('');
  out.push('## Components', '');
  for (const c of manifest.components) {
    out.push(
      `- [${c.name}](./ai/components/${c.name}.md): ${firstSentence(c.description)} (${c.status})`,
    );
  }
  out.push('');
  out.push('## Hooks, utilities and icons', '');
  out.push(
    `- [Hooks and utilities](./ai/hooks-and-utilities.md): ${manifest.hooks.map((h) => h.name).join(', ')}; ${String(manifest.utilities.length)} utilities and constants; ${String(manifest.icons.names.length)} icons.`,
    '',
  );
  out.push('## Machine-readable data', '');
  out.push(
    `- [manifest.json](./manifest.json): every export with props, variants, messages, CSS variables, stories and doc sections (${String(manifest.counts.components)} components).`,
  );
  out.push(
    `- [tokens.json](./tokens.json): ${String(tokens.counts.tokens)} design tokens with CSS variables, values, descriptions and allowed text/surface pairings.`,
  );
  out.push('- [content-rules.json](./ai/content-rules.json): microcopy rules as data.');
  out.push('');
  out.push('## Optional', '');
  out.push(
    '- [llms-full.txt](./llms-full.txt): guides, token summary and every component page in one file.',
  );
  out.push('');
  return out.join('\n');
}

function firstSentence(text: string): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed === '') return 'No description yet.';
  return /^(.*?[.!?])(?:\s|$)/.exec(collapsed)?.[1] ?? collapsed;
}

function tokenSummary(tokens: TokenManifest): string {
  const semantic = tokens.tokens.filter((t) => t.tier !== 'primitive');
  const out: string[] = ['# Design tokens', ''];
  out.push(
    `${String(tokens.counts.tokens)} tokens; the table lists the ${String(semantic.length)} semantic and core ones (primitives are listed in tokens.json). Use the CSS variable, never the value.`,
    '',
  );
  out.push(
    table(
      ['CSS variable', 'Value', 'Use'],
      semantic.map((t) => [
        code(t.cssVar ?? t.name),
        code(t.value.length > 60 ? `${t.value.slice(0, 57)}...` : t.value),
        t.description,
      ]),
    ),
    '',
  );
  const lowContrast = tokens.tokens.flatMap((t) =>
    (t.pairings?.notAllowed ?? []).map(
      (p) =>
        `- ${code(t.cssVar ?? t.name)} fails ${String(p.min)}:1 on ${p.on.join(' + ')} (${String(p.ratio)}:1).`,
    ),
  );
  if (lowContrast.length > 0) out.push('## Pairings that fail contrast', '', ...lowContrast, '');
  return `${out.join('\n').trimEnd()}\n`;
}

export function renderLlmsFull(manifest: Manifest, tokens: TokenManifest, guides: Guide[]): string {
  const out: string[] = ['# Loui DS: full documentation', '', `> ${SUMMARY}`, ''];
  out.push('Rules for generated UI:', '', ...RULES.map((r) => `- ${r}`), '');
  for (const g of guides) {
    if (g.slug === 'introduction' || g.slug === 'using-with-ai') continue;
    out.push('---', '', demote(g.content), '');
  }
  out.push('---', '', demote(tokenSummary(tokens)), '');
  out.push('---', '', '## Components', '');
  for (const c of manifest.components) out.push(demote(renderComponentPage(c), 1), '');
  out.push('---', '', demote(renderFunctionsPage(manifest)), '');
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

/** Keeps the document outline sane when pages are concatenated: `#` becomes `##`, and so on. */
function demote(markdown: string, extra = 0): string {
  let fence = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (/^```/.test(line)) fence = !fence;
      if (!fence && /^#{1,5}\s/.test(line)) return `${'#'.repeat(1 + extra)}${line}`;
      return line;
    })
    .join('\n');
}
