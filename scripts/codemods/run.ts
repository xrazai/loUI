/**
 * Codemod runner.
 *
 *   pnpm codemod <name> <path...> [--dry] [--print] [--<option>=<value> ...]
 *   pnpm codemod --list
 *
 * `<name>` is a file in scripts/codemods/transforms (without extension). Flags are passed through
 * to the jscodeshift CLI, which hands unknown `--key=value` flags to the transform as options.
 * The work is done by the jscodeshift CLI with the `tsx` parser, so `.ts`, `.tsx`, `.js` and
 * `.jsx` files are handled.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const transformsDir = path.join(here, 'transforms');

export function listTransforms(): string[] {
  return readdirSync(transformsDir)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .map((file) => file.slice(0, -'.ts'.length))
    .sort();
}

/** Arguments for the jscodeshift CLI. Pure, so it can be tested. */
export function buildArgs(argv: string[]): { transform: string; args: string[] } {
  const [name, ...rest] = argv;
  if (!name || name.startsWith('--')) throw new Error('Usage: pnpm codemod <name> <path...>');
  const transform = path.join(transformsDir, `${name}.ts`);
  if (!existsSync(transform)) {
    throw new Error(`Unknown codemod "${name}". Available: ${listTransforms().join(', ')}.`);
  }
  const paths = rest.filter((arg) => !arg.startsWith('--'));
  if (paths.length === 0) throw new Error('Pass at least one file or directory to transform.');
  const flags = rest.filter((arg) => arg.startsWith('--'));
  return {
    transform,
    args: [
      '--transform',
      transform,
      '--parser=tsx',
      '--extensions=ts,tsx,js,jsx',
      '--ignore-pattern=**/node_modules/**',
      '--ignore-pattern=**/dist/**',
      ...flags,
      ...paths,
    ],
  };
}

function main(): void {
  const argv = process.argv.slice(2);
  if (argv[0] === '--list') {
    console.log(listTransforms().join('\n'));
    return;
  }
  const { args } = buildArgs(argv);
  const bin = path.resolve(here, '../../node_modules/jscodeshift/bin/jscodeshift.js');
  const result = spawnSync(process.execPath, [bin, ...args], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
