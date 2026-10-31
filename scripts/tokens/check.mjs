/**
 * `pnpm tokens:check`: fails when the committed token outputs are stale.
 *
 * Regenerates the outputs with Terrazzo, compares them with what was on disk, and restores the
 * previous contents if they differ (so a failed check never rewrites your working tree).
 * Run `pnpm tokens:build` to accept the new output.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const outputs = [
  'src/styles/tokens.css',
  'src/tokens/generated/tokens.ts',
  'src/tokens/generated/tokens.json',
];
const read = (file) => (existsSync(root + file) ? readFileSync(root + file, 'utf8') : null);

const before = new Map(outputs.map((file) => [file, read(file)]));

execFileSync(process.execPath, [root + 'node_modules/@terrazzo/cli/bin/cli.js', 'build'], {
  cwd: root,
  stdio: ['ignore', 'ignore', 'inherit'],
});

const stale = outputs.filter((file) => before.get(file) !== read(file));
for (const file of stale) {
  const previous = before.get(file);
  if (previous === null || previous === undefined) unlinkSync(root + file);
  else writeFileSync(root + file, previous);
}

if (stale.length > 0) {
  console.error(`Token outputs are stale:\n${stale.map((file) => `  - ${file}`).join('\n')}`);
  console.error('Run `pnpm tokens:build` and commit the result.');
  process.exit(1);
}
console.log('Token outputs are up to date.');
