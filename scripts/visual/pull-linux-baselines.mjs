// Pulls the Linux visual baselines produced by .github/workflows/visual-baselines.yml
// into tests/visual/__screenshots__/stories.visual.test.tsx (TEST-019).
//
// Usage: pnpm visual:pull-linux [<run-id>] [--no-prune]
//   <run-id>    Workflow run to download. Default: the latest successful run.
//   --no-prune  Keep existing *-linux.png files that are not in the artifact.
//               By default they are removed, because a full regeneration also drops
//               baselines of deleted stories.
// Requires the GitHub CLI (`gh`) authenticated for the repository.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORKFLOW = 'visual-baselines.yml';
const ARTIFACT = 'visual-baselines-linux';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dest = join(root, 'tests', 'visual', '__screenshots__', 'stories.visual.test.tsx');

const args = process.argv.slice(2).filter((a) => a !== '--');
const prune = !args.includes('--no-prune');
let runId = args.find((a) => /^\d+$/.test(a));

/** Runs `gh` and returns trimmed stdout. */
function gh(...ghArgs) {
  return execFileSync('gh', ghArgs, { cwd: root, encoding: 'utf8' }).trim();
}

/** Recursively lists files under `dir`. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

if (!runId) {
  const out = gh(
    'run',
    'list',
    '--workflow',
    WORKFLOW,
    '--status',
    'success',
    '--limit',
    '1',
    '--json',
    'databaseId',
  );
  runId = String(JSON.parse(out)[0]?.databaseId ?? '');
  if (!runId) {
    console.error(
      `No successful run of ${WORKFLOW} found. Trigger it with: gh workflow run ${WORKFLOW}`,
    );
    process.exit(1);
  }
}
console.log(`Downloading artifact "${ARTIFACT}" from run ${runId}...`);

const tmp = mkdtempSync(join(tmpdir(), 'loui-visual-'));
try {
  gh('run', 'download', runId, '--name', ARTIFACT, '--dir', tmp);
  const pngs = walk(tmp).filter((f) => f.endsWith('-linux.png'));
  if (pngs.length === 0) {
    console.error('The artifact contains no *-linux.png files.');
    process.exit(1);
  }
  mkdirSync(dest, { recursive: true });
  const incoming = new Set(pngs.map((f) => basename(f)));
  let removed = 0;
  if (prune) {
    for (const name of readdirSync(dest)) {
      if (name.endsWith('-linux.png') && !incoming.has(name)) {
        rmSync(join(dest, name));
        removed++;
      }
    }
  }
  for (const file of pngs) copyFileSync(file, join(dest, basename(file)));
  console.log(
    `Copied ${pngs.length} baselines to ${dest}${prune ? ` (removed ${removed} stale)` : ''}.`,
  );
  console.log('Review them, then commit: git add tests/visual && git commit');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
