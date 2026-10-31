import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Storybook chrome in the Loui DS dark palette. The manager UI cannot read our CSS
// variables, so the hex values mirror the semantic tokens (src/tokens/semantic.color.json).
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Loui DS',
    brandUrl: 'https://github.com/xrazai/loUI',
    fontBase: '"Geist", system-ui, sans-serif',
    fontCode: '"Geist Mono", ui-monospace, monospace',
    appBg: '#0B0B0C', // --ds-bg
    appContentBg: '#0B0B0C', // --ds-bg
    appPreviewBg: '#0B0B0C', // --ds-bg
    appBorderColor: '#26262B', // --ds-line
    appBorderRadius: 6, // --ds-radius-md
    barBg: '#111113', // --ds-surface
    textColor: '#EDEDEA', // --ds-text
    textMutedColor: '#86868E', // --ds-text-3
    colorSecondary: '#8AB4FF', // --ds-accent
  }),
});
