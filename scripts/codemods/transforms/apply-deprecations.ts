/**
 * Applies the migration hints of deprecated props (AI-011 / AI-016).
 *
 *   pnpm codemod apply-deprecations src
 *   pnpm codemod apply-deprecations src --manifest=node_modules/loui-ds/dist/manifest.json
 *
 * Reads `manifest.json`, finds every prop with a `deprecated` hint that names one replacement
 * (`Use variant.`, see hint.ts) and renames it on the matching components. Hints that are not
 * plain renames are reported, never guessed. Deprecated props keep working, so the codemod is
 * safe to run at any time and is idempotent.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { API, FileInfo, Options } from 'jscodeshift';
import { parseMigrationHint } from '../hint';
import { localNames, renameProp } from './rename-prop';

export const parser = 'tsx';

interface ManifestLike {
  components?: { name: string; props?: { name: string; deprecated?: string }[] }[];
}

function findManifest(explicit: string | undefined): string {
  if (explicit) return path.resolve(explicit);
  for (let dir = process.cwd(); ; dir = path.dirname(dir)) {
    for (const candidate of ['node_modules/loui-ds/dist/manifest.json', 'docs/manifest.json']) {
      const file = path.join(dir, candidate);
      if (existsSync(file)) return file;
    }
    if (path.dirname(dir) === dir) throw new Error('manifest.json not found; pass --manifest.');
  }
}

const cache = new Map<string, ManifestLike>();
function loadManifest(file: string): ManifestLike {
  let manifest = cache.get(file);
  if (!manifest) {
    manifest = JSON.parse(readFileSync(file, 'utf8')) as ManifestLike;
    cache.set(file, manifest);
  }
  return manifest;
}

export default function transform(file: FileInfo, api: API, options: Options): string | undefined {
  // `deprecations` (a JSON manifest fragment) is for tests and tools; users pass `--manifest`.
  const manifest: ManifestLike = options['deprecations']
    ? (JSON.parse(String(options['deprecations'])) as ManifestLike)
    : loadManifest(findManifest(options['manifest'] as string | undefined));
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = 0;
  for (const component of manifest.components ?? []) {
    const locals = localNames(j, root, component.name);
    if (locals.size === 0) continue;
    for (const prop of component.props ?? []) {
      if (prop.deprecated === undefined) continue;
      const hint = parseMigrationHint(prop.deprecated);
      if (!hint) {
        const note = prop.deprecated ? ` (${prop.deprecated})` : '';
        (api as Partial<API>).report?.(
          `${file.path}: ${component.name}.${prop.name} is deprecated and needs a manual migration${note}.`,
        );
        continue;
      }
      changed += renameProp(j, root, locals, prop.name, hint.to, (message) => {
        (api as Partial<API>).report?.(`${file.path}: ${message}`);
      });
    }
  }
  return changed > 0 ? root.toSource() : undefined;
}
