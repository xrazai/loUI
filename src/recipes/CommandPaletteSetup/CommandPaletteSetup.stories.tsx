import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { clearToastsAfterStory, recipeDecorator, whenVisible } from '../storybook';
import { CommandPaletteSetup } from './CommandPaletteSetup';

const meta = {
  title: 'Recipes/CommandPaletteSetup',
  component: CommandPaletteSetup,
  tags: ['autodocs'],
  args: { platform: 'other' },
  decorators: [recipeDecorator({ maxWidth: 640, minHeight: 420 })],
  beforeEach: clearToastsAfterStory,
  parameters: {
    visual: { width: 672 },
    docs: { story: { inline: false, iframeHeight: 460 } },
  },
} satisfies Meta<typeof CommandPaletteSetup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Control+K opens the palette; typing finds a command; Enter runs it. */
export const RunACommand: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.keyboard('{Control>}k{/Control}');
    await whenVisible(screen.findByRole('dialog', { name: 'Command palette' }));
    await userEvent.keyboard('customers');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole('heading', { level: 2, name: 'Customers' }),
      ).toBeVisible(),
    );
  },
};

export const ShortcutsList: Story = {
  parameters: { visual: { play: true, selector: '[role="dialog"]' } },
  play: async () => {
    await userEvent.keyboard('?');
    await whenVisible(screen.findByRole('dialog', { name: 'Keyboard shortcuts' }));
  },
};
