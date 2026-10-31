// REL-001: build the consumer examples against a packed tarball of the library.
//   pnpm examples:verify [--only vite|next] [--no-pack]
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const packDir = join(root, '.pack');
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}   (${cwd.replace(root, '.')})`);
  const result = spawnSync(cmd, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', CI: '1' },
  });
  if (result.status !== 0) {
    console.error(`\nFailed: ${cmd}`);
    process.exit(result.status ?? 1);
  }
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

function assert(condition, message) {
  if (!condition) {
    console.error(`\nAssertion failed: ${message}`);
    process.exit(1);
  }
  console.log(`ok: ${message}`);
}

if (!existsSync(join(root, 'dist/index.js'))) {
  console.error('dist/ is missing. Run "pnpm build" first.');
  process.exit(1);
}

// 1. Pack the library exactly as it would be published (respects "files" and "exports").
if (!args.includes('--no-pack')) {
  rmSync(packDir, { recursive: true, force: true });
  mkdirSync(packDir, { recursive: true });
  run(`pnpm pack --pack-destination "${packDir}"`, root);
  const tarball = readdirSync(packDir).find((f) => f.endsWith('.tgz'));
  assert(Boolean(tarball), 'pnpm pack produced a tarball');
  renameSync(join(packDir, tarball), join(packDir, 'loui-ds.tgz'));
}

function install(dir) {
  // Fresh install every time: the tarball hash changes with each build.
  rmSync(join(dir, 'node_modules'), { recursive: true, force: true });
  rmSync(join(dir, 'pnpm-lock.yaml'), { force: true });
  run('pnpm install --ignore-workspace --no-frozen-lockfile --ignore-scripts', dir);
}

const examples = {
  vite(dir) {
    install(dir);
    run('pnpm run build', dir);
    const files = walk(join(dir, 'dist'));
    const css = files.filter((f) => f.endsWith('.css'));
    assert(
      css.length > 0 && css.some((f) => readFileSync(f, 'utf8').includes('--ds-')),
      'vite: build contains the design system CSS (tokens)',
    );
    assert(
      files.some((f) => /Geist.*\.woff2$/i.test(f)),
      'vite: Geist fonts are emitted from the package',
    );
  },
  next(dir) {
    install(dir);
    rmSync(join(dir, '.next'), { recursive: true, force: true });
    run('pnpm run build', dir);
    const files = walk(join(dir, '.next/static'));
    assert(
      files.some((f) => f.endsWith('.css') && readFileSync(f, 'utf8').includes('--ds-')),
      'next: static CSS contains the design system tokens',
    );
    assert(
      files.some((f) => /\.woff2$/i.test(f)),
      'next: fonts are emitted from the package',
    );
    assert(statSync(join(dir, '.next/BUILD_ID')).isFile(), 'next: production build completed');
  },
};

for (const [name, fn] of Object.entries(examples)) {
  if (only && only !== name) continue;
  fn(join(root, 'examples', `${name === 'vite' ? 'vite-app' : 'next-app'}`));
}
console.log('\nexamples:verify passed');
