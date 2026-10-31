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
  // styles.css references ./fonts/*.woff2 relative to itself (src/styles/fonts.css).
  copy: [{ from: 'src/styles/fonts/*', to: 'dist/fonts' }],
  deps: { neverBundle: [/^react($|\/)/, /^react-dom($|\/)/, /^react-aria-components($|\/)/] },
});
