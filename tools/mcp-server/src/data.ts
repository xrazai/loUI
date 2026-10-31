import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Manifest, ManifestEntry, Token } from './types.ts';

export interface LoadOptions {
  /** Directory with `manifest.json` (a package `dist/` or the repo `docs/`). */
  root?: string;
}

export interface DsData {
  /** Directory the data was read from. */
  root: string;
  manifest: Manifest;
  tokens: Token[];
  contentRules: unknown;
  llmsTxt: string | null;
  /** Every manifest entry (components, providers, hooks, utilities) in one list. */
  entries: ManifestEntry[];
  guideNames: () => string[];
  readGuide: (name: string) => string | null;
  readComponentDoc: (name: string) => string | null;
  recipeNames: () => string[];
  readRecipe: (name: string) => string | null;
}

function readText(file: string): string | null {
  try {
    const text = readFileSync(file, 'utf8');
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  } catch {
    return null;
  }
}

function readJson(file: string): unknown {
  const text = readText(file);
  return text === null ? null : (JSON.parse(text) as unknown);
}

function isDocsRoot(dir: string): boolean {
  return existsSync(path.join(dir, 'manifest.json'));
}

/**
 * Finds the directory that holds `manifest.json`. Order: explicit option, `LOUI_DS_ROOT`, an
 * installed `@loui/ds` package (`dist/`, then `docs/`), then `docs/` found walking up from the
 * working directory and from this file (the monorepo case).
 */
export function resolveRoot(options: LoadOptions = {}): string {
  const tried: string[] = [];
  const candidates: string[] = [];
  const explicit = options.root ?? process.env['LOUI_DS_ROOT'];
  if (explicit) {
    // An explicit location never falls back silently: a typo should fail loudly.
    const dir = path.resolve(explicit);
    if (isDocsRoot(dir)) return dir;
    throw new Error(`No manifest.json in ${dir}. Check --root / LOUI_DS_ROOT.`);
  }
  try {
    const require = createRequire(path.join(process.cwd(), 'noop.js'));
    const pkgDir = path.dirname(require.resolve('@loui/ds/package.json'));
    candidates.push(path.join(pkgDir, 'dist'), path.join(pkgDir, 'docs'));
  } catch {
    // @loui/ds is not installed here; fall through to the repository layout.
  }
  for (const start of [process.cwd(), path.dirname(fileURLToPath(import.meta.url))]) {
    let dir = start;
    for (;;) {
      candidates.push(path.join(dir, 'docs'));
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  for (const candidate of candidates) {
    tried.push(candidate);
    if (isDocsRoot(candidate)) return candidate;
  }
  throw new Error(
    `Could not find manifest.json. Set LOUI_DS_ROOT (or pass --root) to the directory that contains it. Looked in: ${[...new Set(tried)].slice(0, 6).join(', ')}`,
  );
}

function listMarkdown(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.slice(0, -3))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

function safeJoin(dir: string, name: string): string | null {
  if (!/^[\w.-]+$/.test(name) || name.includes('..')) return null;
  return path.join(dir, `${name}.md`);
}

export function loadData(options: LoadOptions = {}): DsData {
  const root = resolveRoot(options);
  const manifest = readJson(path.join(root, 'manifest.json')) as Manifest | null;
  if (!manifest) throw new Error(`manifest.json at ${root} is unreadable.`);
  const tokensFile = readJson(path.join(root, 'tokens.json')) as { tokens: Token[] } | null;
  const guidesDir = path.join(root, 'guides');
  const componentsDir = path.join(root, 'ai', 'components');
  // dist/ does not ship recipes; fall back to the repository docs/ next to it.
  const recipeDirs = [path.join(root, 'recipes'), path.join(root, '..', 'docs', 'recipes')];

  const entries = [
    ...manifest.components,
    ...(manifest.providers ?? []),
    ...(manifest.hooks ?? []),
    ...(manifest.utilities ?? []),
  ];

  const readFrom = (dir: string, name: string): string | null => {
    const file = safeJoin(dir, name);
    return file ? readText(file) : null;
  };

  return {
    root,
    manifest,
    tokens: tokensFile?.tokens ?? [],
    contentRules: readJson(path.join(root, 'ai', 'content-rules.json')),
    llmsTxt: readText(path.join(root, 'llms.txt')),
    entries,
    guideNames: () => listMarkdown(guidesDir),
    readGuide: (name) => readFrom(guidesDir, name),
    readComponentDoc: (name) => readFrom(componentsDir, name),
    recipeNames: () => [...new Set(recipeDirs.flatMap(listMarkdown))].sort(),
    readRecipe: (name) => {
      for (const dir of recipeDirs) {
        const text = readFrom(dir, name);
        if (text !== null) return text;
      }
      return null;
    },
  };
}

/** Case-insensitive name lookup in a list. */
export function findByName<T extends { name: string }>(list: T[], name: string): T | undefined {
  const wanted = name.trim().toLowerCase();
  return list.find((item) => item.name.toLowerCase() === wanted);
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j] ?? 0;
      row[j] = Math.min(
        (row[j] ?? 0) + 1,
        (row[j - 1] ?? 0) + 1,
        prev + (a[i - 1]?.toLowerCase() === b[j - 1]?.toLowerCase() ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return row[b.length] ?? 0;
}

/** Closest names to `name`, for "did you mean" hints. */
export function suggest(name: string, candidates: string[], limit = 3): string[] {
  const lower = name.toLowerCase();
  return candidates
    .map((c) => ({
      c,
      d: c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()) ? 0 : distance(name, c),
    }))
    .filter((x) => x.d <= Math.max(2, Math.floor(name.length / 3)))
    .sort((a, b) => a.d - b.d || a.c.localeCompare(b.c))
    .slice(0, limit)
    .map((x) => x.c);
}
