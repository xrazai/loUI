import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import loui, { cssVarName, mixCss } from './scripts/tokens/plugin';

/**
 * Token build (ADR-0003). Sources: src/tokens/*.json (DTCG 2025.10), listed explicitly so
 * contrast-pairs.json and generated/ are never parsed as tokens.
 * Outputs (see scripts/tokens/plugin.ts): src/styles/tokens.css and src/tokens/generated/*.
 */
const sources = [
  'primitive.color',
  'semantic.color',
  'focus',
  'typography',
  'typography.composite',
  'space',
  'size',
  'radius',
  'shadow',
  'motion',
  'z-index',
  'opacity',
];

// Component-scoped tokens (docs/contributing/component-workflow.md): one file per component,
// token ids start with the component name, e.g. `button.hover-brightness` → --ds-button-hover-brightness.
const componentDir = './src/tokens/component';
const componentSources = existsSync(componentDir)
  ? readdirSync(componentDir)
      .filter((file) => file.endsWith('.json'))
      .sort()
      .map((file) => `${componentDir}/${file}`)
  : [];

export default defineConfig({
  tokens: [...sources.map((name) => `./src/tokens/${name}.json`), ...componentSources],
  outDir: './src/',
  // Keep file order so tokens.css reads like the sources.
  alphabetize: false,
  plugins: [
    css({
      // Value formatting only; the plugin below writes the CSS file.
      skipBuild: true,
      legacyHex: true,
      // Composite typography tokens are documentation/tooling only; CSS uses fs, lh, weight, tracking.
      exclude: ['typography.*'],
      variableName: (token) => cssVarName(token.id),
      transform: (token) => mixCss(token),
    }),
    loui(),
  ],
});
