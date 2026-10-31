import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'Introduction',
          'Guides',
          ['Getting started', 'Principles', 'Content guidelines', 'Accessibility', 'Using with AI'],
          'Foundations',
          [
            'Color',
            'Typography',
            'Spacing, sizing and radius',
            'States and interaction',
            'Motion, layering and iconography',
            'Tokens',
          ],
          'Components',
          'Patterns',
        ],
      },
    },
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
