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

export default defineConfig({
  tokens: sources.map((name) => `./src/tokens/${name}.json`),
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
