import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { PlusIcon, SearchIcon } from '../Icon';
import { Kbd } from '../Kbd';
import { TopBar } from './TopBar';

const meta = {
  title: 'Components/TopBar',
  component: TopBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { title: 'Orders' },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('banner')).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { level: 1, name: 'Orders' })).toBeInTheDocument();
    await expect(canvas.getByRole('banner').getBoundingClientRect().height).toBe(64);
  },
};

export const WithSubtitle: Story = {
  args: { subtitle: '1,248 orders, updated 2 min ago' },
};

export const WithPrimaryAction: Story = {
  args: {
    subtitle: 'Northwind Traders',
    actions: (
      <>
        <IconButton label="Search orders" icon={SearchIcon} variant="ghost" />
        <Button variant="primary" trailing={<Kbd keys={['N']} />} onPress={fn()}>
          Create order
        </Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Search orders' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /Create order/ })).toHaveFocus();
  },
};

export const WithContent: Story = {
  args: {
    children: <Badge tone="success">Live</Badge>,
    actions: (
      <Button variant="secondary" leading={<PlusIcon />}>
        Add filter
      </Button>
    ),
  },
};

export const WithBreadcrumb: Story = {
  args: {
    title: undefined,
    breadcrumb: [
      { label: 'Orders', href: '#orders' },
      { label: 'Northwind Traders', href: '#northwind' },
      { label: 'ORD-1048' },
    ],
    actions: <Button variant="primary">Mark as shipped</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    await expect(canvas.queryByRole('heading')).toBeNull();
  },
};

export const HeadingLevel2: Story = {
  args: { headingLevel: 2 },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', { level: 2, name: 'Orders' }),
    ).toBeInTheDocument();
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Purchase orders awaiting supplier confirmation and approval by finance',
    subtitle: 'A very long subtitle that also needs to be truncated instead of wrapping',
    actions: <Button variant="primary">Create order</Button>,
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 520 }}>
        <Story />
      </div>
    ),
  ],
};

export const RightToLeft: Story = {
  args: { subtitle: 'Northwind Traders', actions: <Button variant="primary">Create order</Button> },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
