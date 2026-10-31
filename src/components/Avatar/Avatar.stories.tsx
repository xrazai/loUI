import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#6b6b73"/><circle cx="20" cy="16" r="7" fill="#d4d4d8"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#d4d4d8"/></svg>',
  );

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'Ada Lovelace' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
    </div>
  ),
};

export const WithPhoto: Story = { args: { src: PHOTO } };

export const BrokenPhoto: Story = {
  name: 'Photo fails to load',
  args: { src: 'data:image/png;base64,AAAA' },
};

export const Decorative: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Avatar decorative name="Ada Lovelace" />
      <span>Ada Lovelace</span>
    </div>
  ),
};

export const Shades: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
      <Avatar name="Edsger Dijkstra" />
    </div>
  ),
};

export const Stacked: Story = {
  render: () => (
    <div style={{ display: 'flex' }} role="group" aria-label="Project members">
      <Avatar name="Ada Lovelace" ring />
      <Avatar name="Grace Hopper" ring style={{ marginInlineStart: -8 }} />
      <Avatar name="Alan Turing" ring style={{ marginInlineStart: -8 }} />
    </div>
  ),
};

export const LongName: Story = {
  args: { name: 'Maria Aparecida de Souza Albuquerque Figueiredo', size: 'lg' },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <Avatar {...args} name="سارة أحمد" />
    </div>
  ),
};
