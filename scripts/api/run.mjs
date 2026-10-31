// Public API report (TEST-007). Runs API Extractor over the built declarations of both entry
// points and compares the generated reports in api/ with the committed ones.
//   pnpm api:check   fails when the API differs from the committed report (unreviewed change)
//   pnpm api:update  rewrites the reports; review the diff in the pull request
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const update = process.argv.includes('--update');

const entries = [
  { name: 'loui-ds', entry: 'dist/index.d.ts' },
  { name: 'loui-ds-patterns', entry: 'dist/patterns/index.d.ts' },
];

let failed = false;
for (const { name, entry } of entries) {
  if (!existsSync(resolve(root, entry))) {
    console.error(`Missing ${entry}. Run "pnpm build" first.`);
    process.exit(1);
  }
  const config = ExtractorConfig.prepare({
    configObjectFullPath: resolve(root, 'api', `${name}.json`),
    packageJsonFullPath: resolve(root, 'package.json'),
    configObject: {
      projectFolder: root,
      newlineKind: 'lf',
      mainEntryPointFilePath: `<projectFolder>/${entry}`,
      compiler: {
        overrideTsconfig: {
          compilerOptions: {
            target: 'ES2023',
            module: 'ESNext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            skipLibCheck: true,
            strict: true,
            types: [],
          },
          include: [entry],
        },
      },
      apiReport: {
        enabled: true,
        reportFileName: `${name}.api.md`,
        reportFolder: '<projectFolder>/api/',
        reportTempFolder: '<projectFolder>/node_modules/.cache/api-extractor/',
      },
      docModel: { enabled: false },
      dtsRollup: { enabled: false },
      tsdocMetadata: { enabled: false },
      messages: {
        compilerMessageReporting: { default: { logLevel: 'warning' } },
        extractorMessageReporting: {
          default: { logLevel: 'warning' },
          // TSDoc in this repo is not strict about release tags.
          'ae-missing-release-tag': { logLevel: 'none' },
          'ae-undocumented': { logLevel: 'none' },
          'ae-forgotten-export': { logLevel: 'none' },
          'ae-unresolved-link': { logLevel: 'none' },
          'ae-incompatible-release-tags': { logLevel: 'none' },
        },
        tsdocMessageReporting: { default: { logLevel: 'none' } },
      },
    },
  });
  const result = Extractor.invoke(config, {
    localBuild: update,
    showVerboseMessages: false,
    showDiagnostics: false,
    messageCallback: (message) => {
      // Keep the output readable: only surface errors; the report diff is the signal.
      if (message.logLevel !== 'error' && !process.env.API_DEBUG) message.handled = true;
    },
  });
  if (!result.succeeded) {
    failed = true;
    console.error(
      `API report "${name}" is out of date or extraction failed. Run "pnpm api:update", review api/${name}.api.md and commit it.`,
    );
  } else {
    console.log(`api/${name}.api.md ${update && result.apiReportChanged ? 'updated' : 'ok'}`);
  }
}
process.exit(failed ? 1 : 0);
