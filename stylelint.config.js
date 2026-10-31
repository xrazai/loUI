/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-declaration-strict-value'],
  ignoreFiles: ['raw_files/**', 'dist/**', 'storybook-static/**', 'node_modules/**'],
  rules: {
    // CSS Modules: camelCase class names are allowed.
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$|^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Use camelCase (CSS Modules) or kebab-case class names.' },
    ],
    // Tokens only (AGENTS.md section 2, rule 4). Raw values are errors.
    'scale-unlimited/declaration-strict-value': [
      [
        'color',
        'background-color',
        'border-color',
        'fill',
        'stroke',
        'z-index',
        'font-size',
        'border-radius',
        'box-shadow',
      ],
      {
        ignoreValues: [
          'transparent',
          'currentColor',
          'inherit',
          '0',
          'none',
          '/^var\\(--ds-[a-z0-9-]+\\)$/',
        ],
        ignoreFunctions: true,
        severity: 'error',
        message: 'Use a design token: var(--ds-*) (expected ${types}, got ${value}).',
      },
    ],
  },
  overrides: [
    {
      // The tokens task generates files here; they may contain raw values.
      files: ['src/tokens/**/*.css', 'src/styles/**/*.css'],
      rules: {
        'scale-unlimited/declaration-strict-value': null,
      },
    },
  ],
};
