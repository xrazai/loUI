import { defineConfig } from 'vitest/config';

// Standalone config: the server is plain Node. Run with `pnpm --filter loui-ds-mcp test`.
export default defineConfig({
  test: {
    name: 'loui-ds-mcp',
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 30_000,
  },
});
