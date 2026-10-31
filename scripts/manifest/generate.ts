/**
 * Generates every AI-facing artifact in memory: manifest.json, tokens.json, llms.txt,
 * llms-full.txt and the per-component Markdown pages. `build.ts` writes them to disk.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import * as prettier from 'prettier';
import { buildManifest } from './components';
import type { BuildOptions } from './components';
import {
  FOUNDATION_META,
  GUIDE_META,
  renderComponentPage,
  renderFunctionsPage,
  renderLlmsFull,
  renderLlmsTxt,
} from './llms';
import type { Guide } from './llms';
import { readRecipeDocs } from './recipes';
import { buildTokenManifest } from './tokens';
import type { Manifest, TokenManifest } from './types';

export interface Generated {
  manifest: Manifest;
  tokens: TokenManifest;
  guides: Guide[];
  /** Files shared by `docs/` and `dist/`, keyed by path relative to either root. */
  common: Map<string, string>;
  /** Files copied to `dist/` only (the sources live elsewhere in the repository). */
  distOnly: Map<string, string>;
}

async function pretty(root: string, file: string, text: string): Promise<string> {
  const config = (await prettier.resolveConfig(path.join(root, file))) ?? {};
  return prettier.format(text, { ...config, filepath: path.join(root, file) });
}

function readGuides(root: string): Guide[] {
  const guides: Guide[] = [];
  const sources = [
    { dir: 'guides', metas: GUIDE_META },
    { dir: 'foundations', metas: FOUNDATION_META },
  ] as const;
  for (const { dir, metas } of sources) {
    const folder = path.join(root, 'docs', dir);
    const present = existsSync(folder) ? new Set(readdirSync(folder)) : new Set<string>();
    for (const meta of metas) {
      if (!present.has(`${meta.slug}.md`)) continue;
      const content = readFileSync(path.join(folder, `${meta.slug}.md`), 'utf8')
        .replace(/\r\n/g, '\n')
        // Storybook-only markers for live examples (docs/foundations/*.md).
        .replace(/^<!-- demo:[a-z0-9-]+ -->\n+/gm, '');
      const title = /^#\s+(.+)$/m.exec(content)?.[1]?.trim() ?? meta.slug;
      guides.push({ dir, slug: meta.slug, title, description: meta.description, content });
    }
  }
  return guides;
}

export async function generate(root: string, options: BuildOptions = {}): Promise<Generated> {
  const manifest = await buildManifest(root, options);
  const tokens = buildTokenManifest(root);
  const guides = readGuides(root);
  const recipeDocs = readRecipeDocs(root);

  const common = new Map<string, string>();
  common.set(
    'manifest.json',
    await pretty(root, 'manifest.json', JSON.stringify(manifest, null, 2)),
  );
  common.set('tokens.json', await pretty(root, 'tokens.json', JSON.stringify(tokens, null, 2)));
  common.set('llms.txt', renderLlmsTxt(manifest, tokens, guides));
  common.set('llms-full.txt', renderLlmsFull(manifest, tokens, guides, recipeDocs));
  common.set(
    'ai/hooks-and-utilities.md',
    await pretty(root, 'x.md', renderFunctionsPage(manifest)),
  );
  for (const component of manifest.components) {
    common.set(
      `ai/components/${component.name}.md`,
      await pretty(root, 'x.md', renderComponentPage(component)),
    );
  }

  const distOnly = new Map<string, string>();
  for (const guide of guides) {
    distOnly.set(`${guide.dir ?? 'guides'}/${guide.slug}.md`, guide.content);
  }
  for (const recipe of recipeDocs) distOnly.set(recipe.doc, recipe.content);
  const rules = path.join(root, 'docs/ai/content-rules.json');
  if (existsSync(rules)) distOnly.set('ai/content-rules.json', readFileSync(rules, 'utf8'));
  const schemas = path.join(root, 'schemas');
  if (existsSync(schemas)) {
    for (const file of readdirSync(schemas).filter((f) => f.endsWith('.json'))) {
      distOnly.set(`schemas/${file}`, readFileSync(path.join(schemas, file), 'utf8'));
    }
  }
  return { manifest, tokens, guides, common, distOnly };
}
