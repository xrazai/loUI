import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Code } from './Code';
import { StoryFrame } from '../../test/StoryFrame';

const snippet = `curl -X POST https://api.example.com/v1/orders \\
  -H "Content-Type: application/json" \\
  -d '{"customer": "cus_1048", "items": [{"sku": "TWL-200", "quantity": 12}]}'`;

const meta = {
  title: 'Typography/Code',
  component: Code,
  tags: ['autodocs'],
  args: { children: 'pnpm check' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['inline', 'block'] },
  },
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <p style={{ margin: 0, color: 'var(--ds-text)' }}>
      Run <Code {...args} /> before you push.
    </p>
  ),
};

export const Block: Story = {
  args: {
    variant: 'block',
    children: 'const total = items.reduce((sum, item) => sum + item.price, 0);',
  },
};

/** A block that overflows is a labelled region and a keyboard stop. Press Tab, then the right arrow (the browser test covers the scrolling itself). */
export const BlockScrolls: Story = {
  args: { variant: 'block', 'aria-label': 'Request example', children: snippet },
  decorators: [
    (Story) => (
      <StoryFrame width={360}>
        <Story />
      </StoryFrame>
    ),
  ],
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', { name: 'Request example' });
    await waitFor(() => expect(region).toHaveAttribute('tabindex', '0'));
    await userEvent.tab();
    await expect(region).toHaveFocus();
  },
};

export const InlineLongToken: Story = {
  render: () => (
    <StoryFrame width={220}>
      <p style={{ margin: 0, color: 'var(--ds-text)' }}>
        Set <Code>NEXT_PUBLIC_VERY_LONG_ENVIRONMENT_VARIABLE_NAME_THAT_WRAPS</Code> first.
      </p>
    </StoryFrame>
  ),
};

export const RightToLeft: Story = {
  render: () => (
    <p dir="rtl" style={{ margin: 0, color: 'var(--ds-text)' }}>
      Run <Code>pnpm check</Code> before you push.
    </p>
  ),
};
