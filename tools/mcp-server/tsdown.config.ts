import { defineConfig } from 'tsdown';

// Builds the published entry points. In the repo the server also runs straight from source
// (`node src/cli.ts`, Node 24 type stripping), so a build is only needed for `bin` use.
export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node24',
  dts: false,
  clean: true,
  fixedExtension: false,
});
