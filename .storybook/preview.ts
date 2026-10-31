import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        dark: { name: 'dark', value: '#0b0b0c' },
      },
    },
    a11y: {
      // Violations fail the Vitest story tests (AGENTS.md section 10).
      test: 'error',
    },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'dark' },
  },
};

export default preview;
