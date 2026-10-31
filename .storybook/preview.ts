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
          'Recipes',
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
      // React Aria's live announcer keeps an unnamed `role="img"` node after a message is cleared
      // (axe role-img-alt). Library-owned and visually hidden; same skip as `src/test/axe.ts`.
      context: { exclude: ['[data-live-announcer]'] },
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
