import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Tag, TagGroup } from './Tag';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: { children: 'v2.4.0' },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Removable: Story = {
  args: { children: 'linen', onRemove: () => undefined },
};

export const Disabled: Story = {
  args: { children: 'linen', isDisabled: true, onRemove: () => undefined },
};

export const LongText: Story = {
  args: { children: 'a-very-long-sku-code-that-keeps-going-ORD-1048-ORD-1048-ORD-1048' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 200 }}>
        <Story />
      </div>
    ),
  ],
};

export const RightToLeft: Story = {
  args: { children: 'linen', onRemove: () => undefined },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

function RemovableGroup() {
  const [tags, setTags] = useState(['linen', 'cotton', 'silk', 'wool']);
  return (
    <TagGroup
      label="Fabric filters"
      onRemove={(keys) => {
        setTags((current) => current.filter((tag) => !keys.has(tag)));
      }}
      renderEmptyState={() => <span>No filters applied</span>}
    >
      {tags.map((tag) => (
        <Tag key={tag} id={tag}>
          {tag}
        </Tag>
      ))}
    </TagGroup>
  );
}

/** Arrow keys move between tags; Backspace or Delete removes the focused one. */
export const RemovableGroupStory: Story = {
  name: 'Group: removable',
  render: () => <RemovableGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.queryByText('cotton')).toBeNull();
    await expect(canvas.getAllByRole('row')).toHaveLength(3);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove wool' }));
    await expect(canvas.queryByText('wool')).toBeNull();
  },
};

export const GroupStatic: Story = {
  name: 'Group: static',
  render: () => (
    <TagGroup aria-label="Versions">
      <Tag id="v1">v1.0.0</Tag>
      <Tag id="v2">v2.4.0</Tag>
    </TagGroup>
  ),
};

export const GroupSelectable: Story = {
  name: 'Group: selectable',
  render: () => (
    <TagGroup label="Show fabrics" selectionMode="multiple" defaultSelectedKeys={['linen']}>
      <Tag id="linen">linen</Tag>
      <Tag id="cotton">cotton</Tag>
      <Tag id="silk">silk</Tag>
    </TagGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('row', { name: 'cotton' }));
    await expect(canvas.getByRole('row', { name: 'cotton' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const GroupWithDisabledTag: Story = {
  name: 'Group: disabled tag',
  render: () => (
    <TagGroup label="Fabric" onRemove={() => undefined} disabledKeys={['cotton']}>
      <Tag id="linen">linen</Tag>
      <Tag id="cotton">cotton</Tag>
    </TagGroup>
  ),
};

export const GroupEmpty: Story = {
  name: 'Group: empty',
  render: () => (
    <TagGroup label="Fabric filters" renderEmptyState={() => <span>No filters applied</span>}>
      {[]}
    </TagGroup>
  ),
};
