import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { SkipLink } from './SkipLink';

const meta = {
  title: 'Components/SkipLink',
  component: SkipLink,
  tags: ['autodocs'],
  render: (args) => (
    <div>
      <SkipLink {...args} />
      <nav aria-label="Primary">
        <a href="#orders">Orders</a> <a href="#customers">Customers</a>
      </nav>
      <main id="main" style={{ outline: 'none' }}>
        <h1 style={{ margin: 0 }}>Orders</h1>
        <p>Main content.</p>
      </main>
    </div>
  ),
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hidden until it receives keyboard focus: press Tab. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Skip to main content' });
    await expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.getBoundingClientRect().width).toBeGreaterThan(40);
  },
};

/** Enter jumps past the navigation: focus lands on the main content. */
export const JumpsToMain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('main')).toHaveFocus();
  },
};

export const CustomTarget: Story = {
  args: { targetId: 'content', children: 'Skip to the results' },
  render: (args) => (
    <div>
      <SkipLink {...args} />
      <nav aria-label="Primary">
        <a href="#orders">Orders</a>
      </nav>
      <section id="content" aria-label="Results">
        Results
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Skip to the results' })).toHaveAttribute(
      'href',
      '#content',
    );
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('region', { name: 'Results' })).toHaveFocus();
  },
};

export const Portuguese: Story = {
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Pular para o conteúdo principal' }),
    ).toBeInTheDocument();
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
