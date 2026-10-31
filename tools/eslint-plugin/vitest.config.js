import { defineConfig } from 'vitest/config';

// Standalone config: the plugin is plain Node ESM, so no DOM and no root projects are involved.
// Run with `pnpm --filter eslint-plugin-loui test`.
export default defineConfig({
  test: {
    name: 'eslint-plugin-loui',
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
