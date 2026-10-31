declare module 'eslint-plugin-loui' {
  import type { ESLint, Linter } from 'eslint';
  const plugin: ESLint.Plugin & { configs: { recommended: Linter.Config } };
  export default plugin;
}
