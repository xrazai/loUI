import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import loui from 'eslint-plugin-loui';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'examples/**',
      '.pack/**',
      'tools/*/dist/**',
      'storybook-static/**',
      'raw_files/**',
      'coverage/**',
      '.changeset/**',
      'src/tokens/generated/**',
    ],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Reasonable, not noisy.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  reactHooks.configs.flat.recommended,
  jsxA11y.configs.strict,
  {
    // Dogfooding (AI-007, AI-015): the design system's own stories and examples are checked with
    // the consumer rules at error level, so the examples we ship follow the rules we publish.
    files: ['src/**/*.stories.tsx', 'examples/**/*.{ts,tsx}'],
    plugins: { loui },
    rules: {
      ...Object.fromEntries(
        Object.keys(loui.configs.recommended.rules).map((rule) => [rule, 'error']),
      ),
      // Region labels in the Select and RadioGroup stories are code-prefixed names.
      'loui/content-rules': [
        'error',
        { properNouns: ['EU: Frankfurt', 'US: Virginia', 'SA: Sao Paulo', 'AP: Singapore'] },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
