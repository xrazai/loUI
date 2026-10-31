import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { CalendarIcon, CircleCheckIcon, SearchIcon, StarIcon } from '../Icon';
import { Sidebar } from './Sidebar';
import type { SidebarProps, SidebarSection } from './Sidebar';

const sections: SidebarSection[] = [
  {
    id: 'work',
    title: 'Work',
    items: [
      {
        value: 'orders',
        label: 'Orders',
        href: '#orders',
        icon: StarIcon,
        count: 3,
        countLabel: '3 pending',
        countTone: 'warning',
      },
      { value: 'customers', label: 'Customers', href: '#customers', icon: SearchIcon },
      { value: 'calendar', label: 'Calendar', href: '#calendar', icon: CalendarIcon },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    items: [
      { value: 'settings', label: 'Settings', href: '#settings', icon: CircleCheckIcon },
      { value: 'help', label: 'Help' },
    ],
  },
];

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    workspace: { name: 'Northwind', subtitle: 'Production' },
    sections,
    value: 'orders',
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ blockSize: 640, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('complementary', { name: 'Sidebar' })).toBeInTheDocument();
    await expect(canvas.getByRole('navigation', { name: 'Work' })).toBeInTheDocument();
    await expect(canvas.getByRole('navigation', { name: 'Account' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Orders 3 pending' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

export const Complete: Story = {
  args: {
    status: { title: 'All systems operational', meta: 'Last sync', value: '2 min ago' },
    footer: <a href="#help">Help center</a>,
    user: { name: 'Ana Souza', role: 'ana@example.com' },
  },
};

export const StatusTones: Story = {
  args: {
    status: { tone: 'danger', title: 'Sync failed', meta: 'Last attempt', value: '10:42' },
    user: { name: 'Ana Souza', role: 'Owner' },
  },
};

export const WithoutCaptions: Story = {
  args: {
    sections: [
      { id: 'main', label: 'Main', items: sections[0]?.items ?? [] },
      { id: 'other', label: 'Other', items: sections[1]?.items ?? [] },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('navigation', { name: 'Main' }),
    ).toBeInTheDocument();
  },
};

/** Focus order follows the visual order: sections top to bottom, then the footer. */
export const FocusOrder: Story = {
  args: {
    footer: <a href="#help">Help center</a>,
    user: { name: 'Ana Souza', role: 'Owner' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const order = ['Orders 3 pending', 'Customers', 'Calendar', 'Settings', 'Help'];
    for (const name of order) {
      await userEvent.tab();
      await expect(canvas.getByRole(name === 'Help' ? 'button' : 'link', { name })).toHaveFocus();
    }
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Help center' })).toHaveFocus();
  },
};

function ControlledSidebar(args: SidebarProps) {
  const [value, setValue] = useState('orders');
  return (
    <DSProvider navigate={() => undefined}>
      <Sidebar {...args} value={value} onChange={setValue} />
    </DSProvider>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledSidebar {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('link', { name: 'Customers' }));
    await expect(canvas.getByRole('link', { name: 'Customers' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('link', { name: 'Orders 3 pending' })).not.toHaveAttribute(
      'aria-current',
    );
  },
};

/** Taller content scrolls inside the sidebar; the page does not. */
export const ManyItems: Story = {
  args: {
    sections: Array.from({ length: 4 }, (_, group) => ({
      id: `g${String(group)}`,
      title: `Group ${String(group + 1)}`,
      items: Array.from({ length: 6 }, (_, index) => ({
        value: `g${String(group)}-${String(index)}`,
        label: `Item ${String(group * 6 + index + 1)}`,
        href: `#item-${String(group * 6 + index + 1)}`,
      })),
    })),
    user: { name: 'Ana Souza', role: 'Owner' },
  },
};

export const LongText: Story = {
  args: {
    workspace: {
      name: 'A workspace with a name that is far too long to fit',
      subtitle: 'Production environment, region eu-west-1',
    },
    user: { name: 'Maria de Fátima Albuquerque Nascimento', role: 'maria.albuquerque@example.com' },
  },
};

export const Portuguese: Story = {
  render: (args) => (
    <DSProvider locale="pt-BR">
      <Sidebar {...args} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('complementary', { name: 'Barra lateral' }),
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
  args: { user: { name: 'Ana Souza', role: 'Owner' } },
};
