import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-vitest'],
  // The components manifest / MCP (@storybook/addon-mcp) is deferred; see the scaffold report.
};

export default config;
