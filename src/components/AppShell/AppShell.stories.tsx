import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Card } from '../Card';
import { Container } from '../Container';
import { Grid } from '../Grid';
import { Heading } from '../Heading';
import { Sidebar } from '../Sidebar';
import { Text } from '../Text';
import { TopBar } from '../TopBar';
import { AppShell, AppShellNavToggle } from './AppShell';
import { StoryFrame } from '../../test/StoryFrame';

const sidebar = (
  <Sidebar
    workspace={{ name: 'Northwind', subtitle: 'Production' }}
    value="orders"
    sections={[
      {
        id: 'work',
        title: 'Work',
        items: [
          { value: 'orders', label: 'Orders', href: '#orders', count: 3, countLabel: '3 pending' },
          { value: 'customers', label: 'Customers', href: '#customers' },
          { value: 'invoices', label: 'Invoices', href: '#invoices' },
        ],
      },
      {
        id: 'account',
        label: 'Account',
        items: [{ value: 'settings', label: 'Settings', href: '#settings' }],
      },
    ]}
    status={{ title: 'All systems operational', meta: 'Last sync', value: '2 min ago' }}
    user={{ name: 'Ada Lovelace', role: 'Owner' }}
  />
);

const topBar = (
  <TopBar
    title="Orders"
    subtitle="24 open"
    actions={
      <Button variant="primary" size="sm">
        New order
      </Button>
    }
  >
    <AppShellNavToggle />
    <Badge tone="success">Live</Badge>
  </TopBar>
);

function Page({ rows = 8 }: { rows?: number }) {
  return (
    <Container gutter={false}>
      <Grid minItemWidth="md">
        {Array.from({ length: rows }, (_, index) => (
          <Card key={index} title={`Card ${String(index + 1)}`}>
            <Text as="p" tone="secondary">
              Content that scrolls with the page, not with the sidebar.
            </Text>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}

const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { sidebar, topBar, children: <Page /> },
  decorators: [
    (Story) => (
      <StoryFrame height={560}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sidebar on the left, top bar and scrolling content on the right. The sidebar and the content scroll apart. */
export const Default: Story = {
  // A desktop width, so the in-flow sidebar layout (md and up) has a baseline.
  parameters: { visual: { width: 1024 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('main')).toHaveAttribute('id', 'main');
    await expect(canvas.getAllByRole('main')).toHaveLength(1);
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Skip to main content' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('main')).toHaveFocus();
  },
};

/** The detail aside (360px) holds the record selected in the content. */
export const WithDetail: Story = {
  args: {
    detail: (
      <>
        <Heading level={2} size="heading">
          Order ORD-1048
        </Heading>
        <Text as="p" tone="secondary" size="small">
          Placed by Ada Lovelace on 12 March.
        </Text>
      </>
    ),
  },
};

/** Without a sidebar the shell is a header and content. */
export const WithoutSidebar: Story = {
  args: { sidebar: undefined },
};

/** Content without padding, for a table or a page that brings its own container. */
export const Unpadded: Story = {
  args: { padded: false },
};

/** Content taller than the viewport scrolls inside `main`; the top bar stays put. */
export const LongContent: Story = {
  args: { children: <Page rows={40} /> },
};

/** Narrow screens: the sidebar leaves the flow; the Menu button opens it as a panel. */
export const NarrowClosed: Story = {
  decorators: [
    (Story) => (
      <StoryFrame width={375} height={560}>
        <Story />
      </StoryFrame>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(canvas.queryByRole('complementary', { name: 'Sidebar' })).toBeNull();
  },
};

/** Open: focus moves into the panel, the content is inert, Escape or the scrim closes it. */
export const NarrowOpen: Story = {
  decorators: NarrowClosed.decorators ?? [],
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    return <AppShell {...args} isNavOpen={open} onNavOpenChange={setOpen} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('complementary', { name: 'Sidebar' })).toBeVisible(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('complementary', { name: 'Sidebar' })).toBeNull(),
    );
  },
};

/** The smallest supported width. */
export const Narrow320: Story = {
  args: { detail: <Text as="p">Detail pane under the content</Text> },
  decorators: [
    (Story) => (
      <StoryFrame width={320} height={560}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <StoryFrame dir="rtl" height={560}>
        <Story />
      </StoryFrame>
    ),
  ],
};
