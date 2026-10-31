import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

/**
 * Loads data files that live in the design system package (`manifest.json`,
 * `content-rules.json`) at lint time. Resolution order, first hit wins:
 *
 * 1. inline object in `settings.loui` (`manifest` / `contentRules`), used by tests and tools;
 * 2. explicit path in `settings.loui` (`manifestPath` / `contentRulesPath`), relative to cwd;
 * 3. the installed `@loui/ds` package (`dist/manifest.json`, `dist/ai/content-rules.json`);
 * 4. a walk up from cwd looking for `docs/manifest.json` / `docs/ai/content-rules.json`
 *    (this is how the design system repo itself is linted).
 *
 * Missing or unreadable data never throws: rules that depend on it simply have nothing to check.
 */

const cache = new Map();

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function packageRoot(cwd) {
  try {
    const require = createRequire(path.join(cwd, 'noop.js'));
    return path.dirname(require.resolve('@loui/ds/package.json'));
  } catch {
    return null;
  }
}

function walkUp(cwd, relative) {
  for (let dir = cwd; ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, relative);
    if (existsSync(candidate)) return candidate;
    if (path.dirname(dir) === dir) return null;
  }
}

function load(kind, cwd, settings, { inlineKey, pathKey, packageFile, repoFile, valid }) {
  const loui = settings?.loui ?? {};
  if (loui[inlineKey] && typeof loui[inlineKey] === 'object') return loui[inlineKey];
  const cacheKey = `${kind}|${cwd}|${loui[pathKey] ?? ''}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const candidates = [];
  if (loui[pathKey]) candidates.push(path.resolve(cwd, loui[pathKey]));
  const root = packageRoot(cwd);
  if (root) candidates.push(path.join(root, packageFile));
  const repo = walkUp(cwd, repoFile);
  if (repo) candidates.push(repo);

  let data = null;
  for (const candidate of candidates) {
    const json = readJson(candidate);
    if (json && valid(json)) {
      data = json;
      break;
    }
  }
  cache.set(cacheKey, data);
  return data;
}

/**
 * @returns {{ found: boolean, components: Map<string, any>, icons: Set<string> }}
 */
export function loadManifest(context) {
  const raw = load('manifest', context.cwd, context.settings, {
    inlineKey: 'manifest',
    pathKey: 'manifestPath',
    packageFile: 'dist/manifest.json',
    repoFile: 'docs/manifest.json',
    valid: (json) => Array.isArray(json.components),
  });
  const components = new Map();
  for (const component of raw?.components ?? []) components.set(component.name, component);
  const icons = new Set(raw?.icons?.names ?? []);
  return { found: raw !== null, components, icons };
}

/** @returns {any | null} The parsed content-rules.json, or null when it cannot be found. */
export function loadContentRules(context) {
  return load('content-rules', context.cwd, context.settings, {
    inlineKey: 'contentRules',
    pathKey: 'contentRulesPath',
    packageFile: 'dist/ai/content-rules.json',
    repoFile: 'docs/ai/content-rules.json',
    valid: (json) => Array.isArray(json.rules),
  });
}
