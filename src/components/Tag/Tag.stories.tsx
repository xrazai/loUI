import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Tag, TagGroup } from './Tag';
import { StoryFrame } from '../../test/StoryFrame';

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
  args: { children: 'notebook', onRemove: () => undefined },
};

export const Disabled: Story = {
  args: { children: 'notebook', isDisabled: true, onRemove: () => undefined },
};

export const LongText: Story = {
  args: { children: 'a-very-long-sku-code-that-keeps-going-ORD-1048-ORD-1048-ORD-1048' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={200}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  args: { children: 'notebook', onRemove: () => undefined },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

function RemovableGroup() {
  const [tags, setTags] = useState(['notebook', 'backpack', 'headphones', 'lamp']);
  return (
    <TagGroup
      label="Product filters"
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
    await expect(canvas.queryByText('backpack')).toBeNull();
    await expect(canvas.getAllByRole('row')).toHaveLength(3);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove lamp' }));
    await expect(canvas.queryByText('lamp')).toBeNull();
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
    <TagGroup label="Show products" selectionMode="multiple" defaultSelectedKeys={['notebook']}>
      <Tag id="notebook">notebook</Tag>
      <Tag id="backpack">backpack</Tag>
      <Tag id="headphones">headphones</Tag>
    </TagGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('row', { name: 'backpack' }));
    await expect(canvas.getByRole('row', { name: 'backpack' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const GroupWithDisabledTag: Story = {
  name: 'Group: disabled tag',
  render: () => (
    <TagGroup label="Product" onRemove={() => undefined} disabledKeys={['backpack']}>
      <Tag id="notebook">notebook</Tag>
      <Tag id="backpack">backpack</Tag>
    </TagGroup>
  ),
};

export const GroupEmpty: Story = {
  name: 'Group: empty',
  render: () => (
    <TagGroup label="Product filters" renderEmptyState={() => <span>No filters applied</span>}>
      {[]}
    </TagGroup>
  ),
};
