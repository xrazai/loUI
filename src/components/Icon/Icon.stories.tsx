import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Icon } from './Icon';
import { CheckIcon, ChevronRightIcon, SearchIcon, iconNames, iconSet } from './icons';

const row = {
  display: 'flex',
  gap: 'var(--ds-space-4)',
  alignItems: 'center',
} as const;

const meta = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { icon: SearchIcon },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    await expect(svg).toHaveAttribute('focusable', 'false');
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Icon {...args} size="xs" />
      <Icon {...args} size="sm" />
      <Icon {...args} size="md" />
      <Icon {...args} size="lg" />
    </div>
  ),
};

/** The icon carries meaning on its own, so it is an image with an accessible name. */
export const WithLabel: Story = {
  args: { icon: CheckIcon, label: 'Saved' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Saved' })).toBeVisible();
  },
};

/** Inherits the text color. Color never carries meaning alone: the text says what happened. */
export const InheritsColor: Story = {
  render: (args) => (
    <p style={{ ...row, color: 'var(--ds-text-2)', gap: 'var(--ds-space-2)' }}>
      <Icon {...args} icon={CheckIcon} size="sm" />
      Settings saved
    </p>
  ),
};

/** Directional icons mirror in right-to-left languages; the second one does not. */
export const DirectionalRtl: Story = {
  args: { icon: ChevronRightIcon, directional: true },
  render: (args) => (
    <div dir="rtl" style={row}>
      <Icon {...args} />
      <Icon {...args} directional={false} />
    </div>
  ),
};

/** Every icon of the curated set. */
export const Gallery: Story = {
  render: () => (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--ds-space-4)',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        color: 'var(--ds-text-2)',
      }}
    >
      {Object.entries(iconSet).map(([name, glyph]) => (
        <li key={name} style={{ ...row, gap: 'var(--ds-space-2)' }}>
          <Icon icon={glyph} size="lg" />
          <code title={iconNames[name as keyof typeof iconNames]}>{name}</code>
        </li>
      ))}
    </ul>
  ),
};
