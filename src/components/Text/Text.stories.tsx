import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Text } from './Text';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Typography/Text',
  component: Text,
  tags: ['autodocs'],
  args: { children: 'Orders shipped this week' },
  argTypes: {
    size: { control: 'inline-radio', options: ['body', 'small', 'label', 'meta', 'caption'] },
    tone: { control: 'inline-radio', options: ['default', 'secondary', 'tertiary'] },
    mono: { control: 'boolean' },
    truncate: { control: 'boolean' },
    as: { control: 'select', options: ['span', 'p', 'div', 'label', 'strong', 'em', 'small'] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = { args: { size: 'small' } };

export const Label: Story = { args: { size: 'label' } };

export const Meta_: Story = { name: 'Meta', args: { size: 'meta' } };

/** Mono, uppercase by CSS and tracked: the source text stays in sentence case. */
export const Caption: Story = { args: { size: 'caption', children: 'Group name' } };

export const Secondary: Story = { args: { tone: 'secondary' } };

/** Tertiary text is for hints on the base surfaces. It is too faint on raised and hover surfaces. */
export const Tertiary: Story = { args: { tone: 'tertiary', size: 'small' } };

export const Mono: Story = { args: { mono: true, children: 'ORD-1048' } };

export const AsParagraph: Story = {
  args: { as: 'p' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Orders shipped this week').tagName).toBe('P');
  },
};

/** One line, cut with an ellipsis. */
export const Truncated: Story = {
  args: {
    truncate: true,
    children: 'A very long value that cannot fit in the box and is cut with an ellipsis',
  },
  decorators: [
    (Story) => (
      <StoryFrame width={200}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const LongText: Story = {
  args: {
    as: 'p',
    children:
      'A long paragraph wraps inside its container. An unbroken value such as ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048 breaks instead of overflowing.',
  },
  decorators: [
    (Story) => (
      <StoryFrame width={240}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
