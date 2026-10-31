/**
 * `pnpm manifest:build`: writes the AI-facing artifacts to `docs/` (committed) and `dist/`.
 * `pnpm manifest:check` (`--check`) fails when the committed copies in `docs/` are stale.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from './generate';

const root = fileURLToPath(new URL('../../', import.meta.url));
const check = process.argv.includes('--check');

function write(file: string, text: string): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text, 'utf8');
}

function listFiles(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory()
      ? listFiles(full, base)
      : [path.relative(base, full).split(path.sep).join('/')];
  });
}

const warnings: string[] = [];
const { manifest, tokens, common, distOnly } = await generate(root, {
  warn: (m) => warnings.push(m),
});
for (const warning of warnings) console.warn(`warning: ${warning}`);

if (check) {
  const docsRoot = path.join(root, 'docs');
  const stale: string[] = [];
  for (const [file, text] of common) {
    const target = path.join(docsRoot, file);
    const current = existsSync(target)
      ? readFileSync(target, 'utf8').replace(/\r\n/g, '\n')
      : undefined;
    if (current !== text) stale.push(`docs/${file}`);
  }
  const expected = new Set([...common.keys()].filter((f) => f.startsWith('ai/components/')));
  for (const file of listFiles(path.join(docsRoot, 'ai/components'), docsRoot)) {
    if (!expected.has(file)) stale.push(`docs/${file} (no longer generated)`);
  }
  if (stale.length > 0) {
    console.error(
      `Stale generated docs:\n${stale.map((s) => `  ${s}`).join('\n')}\nRun \`pnpm manifest:build\` and commit.`,
    );
    process.exit(1);
  }
  console.log('Generated docs are up to date.');
} else {
  // docs/ai/components is wholly generated: drop pages of removed components first.
  rmSync(path.join(root, 'docs/ai/components'), { recursive: true, force: true });
  for (const base of ['docs', 'dist']) {
    for (const [file, text] of common) write(path.join(root, base, file), text);
  }
  for (const [file, text] of distOnly) write(path.join(root, 'dist', file), text);
  console.log(
    `Manifest: ${String(manifest.counts.components)} components, ${String(manifest.counts.recipes)} recipes, ${String(manifest.counts.hooks)} hooks, ` +
      `${String(manifest.counts.utilities)} utilities, ${String(manifest.counts.icons)} icons, ` +
      `${String(tokens.counts.tokens)} tokens -> docs/ and dist/.`,
  );
}
