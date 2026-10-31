import allowedIcons from './rules/allowed-icons.js';
import contentRules from './rules/content-rules.js';
import iconButtonLabel from './rules/icon-button-label.js';
import noDeprecated from './rules/no-deprecated.js';
import noInlineStyleVisual from './rules/no-inline-style-visual.js';
import noRawColors from './rules/no-raw-colors.js';
import noRawSpacing from './rules/no-raw-spacing.js';
import onePrimaryAction from './rules/one-primary-action.js';

const plugin = {
  meta: { name: 'eslint-plugin-loui', version: '0.0.0', namespace: 'loui' },
  rules: {
    'allowed-icons': allowedIcons,
    'content-rules': contentRules,
    'icon-button-label': iconButtonLabel,
    'no-deprecated': noDeprecated,
    'no-inline-style-visual': noInlineStyleVisual,
    'no-raw-colors': noRawColors,
    'no-raw-spacing': noRawSpacing,
    'one-primary-action': onePrimaryAction,
  },
  configs: {},
};

/** Errors for the rules that are always wrong; warnings for the heuristics. */
export const recommendedRules = {
  'loui/no-raw-colors': 'error',
  'loui/no-raw-spacing': 'error',
  'loui/icon-button-label': 'error',
  'loui/no-inline-style-visual': 'error',
  'loui/one-primary-action': 'warn',
  'loui/no-deprecated': 'warn',
  'loui/allowed-icons': 'warn',
  'loui/content-rules': 'warn',
};

plugin.configs.recommended = {
  name: 'loui/recommended',
  files: ['**/*.{jsx,tsx,js,ts}'],
  plugins: { loui: plugin },
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  rules: recommendedRules,
};

export default plugin;
export const { rules, configs } = plugin;
