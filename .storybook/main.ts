import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    // Serves an MCP endpoint at /mcp while `storybook dev` runs; see docs/ai/storybook-mcp.md.
    '@storybook/addon-mcp',
  ],
};

export default config;
