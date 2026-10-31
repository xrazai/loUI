// Tree-shaking check (TEST-009): bundle an app that imports only `Button` from the built
// package and assert that heavyweight components do not end up in the output.
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { rolldown } from 'rolldown';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = pathToFileURL(join(root, 'dist/index.js')).href;

// Declaration markers are unminified function/const names, which survive bundling.
const FORBIDDEN = [
  'DataTable',
  'Chart',
  'CommandPalette',
  'Combobox',
  'DatePicker',
  'FileUpload',
  'ShortcutsHelp',
  'AppShell',
];
// Sanity: the marker search must be able to find things, so Button itself has to be present.
const REQUIRED = ['Button'];
const MAX_BYTES = 120 * 1024; // unminified, no react/RAC (external); the real budget is size-limit.

async function bundle(source) {
  const dir = await mkdtemp(join(tmpdir(), 'loui-treeshake-'));
  try {
    const entry = join(dir, 'entry.js');
    await writeFile(entry, source);
    const build = await rolldown({
      input: entry,
      platform: 'neutral',
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^react-aria-components($|\/)/,
        /^react-stately/,
        /^lucide-react/,
        /^@internationalized\//,
      ],
      treeshake: true,
      logLevel: 'silent',
    });
    const { output } = await build.generate({ format: 'esm', minify: false });
    await build.close();
    return output
      .filter((o) => o.type === 'chunk')
      .map((o) => o.code)
      .join('\n');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const code = await bundle(
  `import { Button } from ${JSON.stringify(dist)};\nglobalThis.__x = Button;\n`,
);
const errors = [];
const declares = (name) =>
  new RegExp(String.raw`\b(?:function|const|class)\s+${name}(?:\$\d+)?\b`).test(code);
for (const name of FORBIDDEN) {
  if (declares(name)) errors.push(`found "${name}" in the Button-only bundle`);
}
for (const name of REQUIRED) {
  if (!declares(name)) errors.push(`marker "${name}" missing: the check is not sound`);
}
if (code.length > MAX_BYTES)
  errors.push(`Button-only bundle is ${code.length} bytes (> ${MAX_BYTES})`);

if (errors.length) {
  console.error('Tree-shaking check failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(
  `Tree-shaking ok: Button-only bundle is ${(code.length / 1024).toFixed(1)} kB (unminified, externals excluded).`,
);
