/**
 * Fills the source block of every recipe doc from the recipe's `.tsx` file.
 *
 *   pnpm exec tsx src/recipes/sync.ts           rewrite docs/recipes/*.md
 *   pnpm exec tsx src/recipes/sync.ts --check   fail when a doc is out of date (CI)
 *
 * `src/recipes/docs.test.ts` runs the same comparison, so a stale doc also fails `pnpm test`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECIPE_NAMES, docSource, extractSource, replaceSource, toKebab } from './docs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const check = process.argv.includes('--check');
let stale = 0;

for (const name of RECIPE_NAMES) {
  const tsxPath = path.join(root, 'src/recipes', name, `${name}.tsx`);
  const mdPath = path.join(root, 'docs/recipes', `${toKebab(name)}.md`);
  const expected = await docSource(readFileSync(tsxPath, 'utf8'));
  const markdown = readFileSync(mdPath, 'utf8');
  if (extractSource(markdown) === expected) continue;
  stale += 1;
  if (check) {
    console.error(`docs/recipes/${toKebab(name)}.md is out of date with ${name}.tsx`);
  } else {
    writeFileSync(mdPath, replaceSource(markdown, expected));
    console.log(`updated docs/recipes/${toKebab(name)}.md`);
  }
}

if (check && stale > 0) {
  console.error('Run: pnpm exec tsx src/recipes/sync.ts');
  process.exit(1);
}
