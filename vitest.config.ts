import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = fileURLToPath(new URL('.', import.meta.url));

function browser(name: string, viewport?: { width: number; height: number }) {
  return {
    enabled: true,
    headless: true,
    provider: playwright(),
    instances: [{ browser: 'chromium' as const, name, ...(viewport ? { viewport } : {}) }],
  };
}

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        // Pure utilities and tokens: no DOM needed.
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
        },
      },
      {
        // Component tests in a real browser (focus, layout, contrast).
        plugins: [react()],
        test: {
          name: 'browser',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['src/test/setup.ts'],
          // Overlay and timer tests run real animations and clocks; the default 5 s is too tight
          // when the four projects share the machine in one `pnpm test` run.
          testTimeout: 20_000,
          browser: browser('browser'),
        },
      },
      {
        // Visual regression with toMatchScreenshot (ADR-0010).
        plugins: [react()],
        test: {
          name: 'visual',
          include: ['tests/visual/**/*.test.tsx'],
          setupFiles: ['src/test/setup.ts'],
          // Wide enough for the widest stories (DataTable, MatrixGrid); a fixed size keeps captures deterministic.
          browser: browser('visual', { width: 1024, height: 800 }),
        },
      },
      {
        // Every story is a test; a11y violations fail it (preview.ts).
        plugins: [storybookTest({ configDir: `${dirname}.storybook` })],
        test: {
          name: 'storybook',
          browser: browser('storybook'),
        },
      },
    ],
  },
});
