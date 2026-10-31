import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/patterns/index.ts'],
  unbundle: true,
  format: 'esm',
  platform: 'neutral',
  dts: true,
  clean: true,
  css: { splitting: false, fileName: 'styles.css' },
  sourcemap: true,
  deps: { neverBundle: [/^react($|\/)/, /^react-dom($|\/)/, /^react-aria-components($|\/)/] },
});
