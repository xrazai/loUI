import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { StoryFrame } from '../../test/StoryFrame';
import { ToolCallList } from './ToolCallList';
import { ToolCallStep } from './ToolCallStep';

const meta = {
  title: 'Patterns/ToolCallStep',
  component: ToolCallStep,
  tags: ['autodocs'],
  args: {
    name: 'search_orders',
    status: 'succeeded',
    durationMs: 1240,
    input: '{ "customer": "C-204", "status": "open" }',
    output: '{ "count": 3, "orders": ["ORD-1048", "ORD-1049", "ORD-1051"] }',
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['running', 'succeeded', 'failed'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={560}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof ToolCallStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /search_orders/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/"count": 3/)).toBeVisible();
  },
};

export const Running: Story = {
  render: () => <ToolCallStep name="draft_reply" status="running" />,
};

export const Failed: Story = {
  args: {
    status: 'failed',
    durationMs: 380,
    output: 'Timeout: the orders service did not answer in 30 s.',
    defaultExpanded: true,
  },
};

export const Expanded: Story = { args: { defaultExpanded: true } };

/** Without input or output there is nothing to open: the header is plain text. */
export const WithoutDetails: Story = {
  render: () => <ToolCallStep name="read_config" status="succeeded" durationMs={85} />,
};

export const LongName: Story = {
  args: {
    name: 'a_tool_with_a_very_long_name_that_has_to_wrap_somewhere_inside_the_header_row',
    defaultExpanded: true,
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  args: { defaultExpanded: true },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={560} dir="rtl">
        <Story />
      </StoryFrame>
    ),
  ],
};

/** A run in progress: the last step finishes and a polite announcement says so. */
export const MultiStepRun: Story = {
  render: function Render() {
    const [lastStatus, setLastStatus] = useState<'running' | 'succeeded'>('running');
    useEffect(() => {
      const timer = setTimeout(() => {
        setLastStatus('succeeded');
      }, 400);
      return () => {
        clearTimeout(timer);
      };
    }, []);
    return (
      <ToolCallList
        aria-label="Steps of the order check"
        steps={[
          {
            stepId: 's1',
            name: 'search_orders',
            status: 'succeeded',
            durationMs: 1240,
            input: '{ "customer": "C-204" }',
            output: '{ "count": 3 }',
          },
          {
            stepId: 's2',
            name: 'read_order',
            status: 'failed',
            durationMs: 380,
            output: 'Order ORD-1049 was not found.',
          },
          {
            stepId: 's3',
            name: 'draft_reply',
            status: lastStatus,
            ...(lastStatus === 'succeeded' ? { durationMs: 2100 } : {}),
          },
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(await canvas.findByText('Succeeded', {}, { timeout: 2000 })).toBeVisible();
  },
};
