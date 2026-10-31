import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    title: 'Storage',
    children: <p style={{ margin: 0 }}>6.2 of 10 GB used.</p>,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'raised'] },
    padding: { control: 'inline-radio', options: ['md', 'none'] },
    headingLevel: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: { actions: <button type="button">Manage</button> },
};

export const Raised: Story = {
  args: { variant: 'raised', title: 'Pinned panel' },
};

export const WithoutTitle: Story = {
  args: { title: undefined, 'aria-label': 'Summary' },
};

export const HeadingLevel3: Story = {
  args: { headingLevel: 3, title: 'Nested card' },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li style={{ padding: 'var(--ds-space-3)' }}>First row</li>
        <li style={{ padding: 'var(--ds-space-3)' }}>Second row</li>
      </ul>
    ),
  },
};

export const LongText: Story = {
  args: {
    title: 'A very long card title that has to wrap inside the available width without breaking',
    actions: <button type="button">Manage</button>,
    children: (
      <p style={{ margin: 0, overflowWrap: 'anywhere' }}>
        Content with a long unbroken value: ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048
      </p>
    ),
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
  args: { actions: <button type="button">Manage</button> },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
