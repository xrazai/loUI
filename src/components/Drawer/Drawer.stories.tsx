import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { StoryFrame } from '../../test/StoryFrame';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { Drawer } from './Drawer';
import type { DrawerProps } from './Drawer';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  args: {
    title: 'Filters',
    defaultOpen: true,
    children: (
      <>
        <Input label="Customer" />
        <Input label="Reference" />
      </>
    ),
    footer: ({ close }) => (
      <>
        <Button onPress={close}>Clear filters</Button>
        <Button variant="primary" onPress={close}>
          Apply filters
        </Button>
      </>
    ),
  },
  argTypes: {
    placement: { control: 'inline-radio', options: ['start', 'end'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    role: { control: 'inline-radio', options: ['complementary', 'region'] },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page layout a drawer is made for: the drawer is a sibling of the content, in a flex row. */
function Page({ children, dir }: { children: React.ReactNode; dir?: 'ltr' | 'rtl' }) {
  return (
    <StoryFrame flex height={360} box {...(dir ? { dir } : {})}>
      <main style={{ flex: 1, padding: 'var(--ds-space-4)', minInlineSize: 0 }}>
        <p>Page content stays interactive while the drawer is open.</p>
        <Button>Page action</Button>
      </main>
      {children}
    </StoryFrame>
  );
}

function WithTrigger(props: Partial<DrawerProps>) {
  const [open, setOpen] = useState(false);
  return (
    <StoryFrame flex height={360} box>
      <main style={{ flex: 1, padding: 'var(--ds-space-4)', minInlineSize: 0 }}>
        <Button
          onPress={() => {
            setOpen(true);
          }}
        >
          Open filters
        </Button>
      </main>
      <Drawer title="Filters" isOpen={open} onOpenChange={setOpen} {...props}>
        <Input label="Customer" />
      </Drawer>
    </StoryFrame>
  );
}

export const Default: Story = {
  decorators: [(Story) => <Page>{<Story />}</Page>],
};

export const AtStart: Story = {
  args: { placement: 'start' },
  decorators: [
    (Story) => (
      <StoryFrame flex height={360} box>
        <Story />
        <main style={{ flex: 1, padding: 'var(--ds-space-4)' }}>
          <p>Page content</p>
        </main>
      </StoryFrame>
    ),
  ],
};

export const Small: Story = {
  args: { size: 'sm' },
  decorators: [(Story) => <Page>{<Story />}</Page>],
};

export const Large: Story = {
  args: { size: 'lg' },
  decorators: [(Story) => <Page>{<Story />}</Page>],
};

export const Region: Story = {
  args: { role: 'region', title: 'Order details' },
  decorators: [(Story) => <Page>{<Story />}</Page>],
};

export const Unpadded: Story = {
  args: {
    padded: false,
    title: 'Activity',
    children: <p style={{ margin: 0, padding: 'var(--ds-space-4)' }}>Full-bleed content</p>,
  },
  decorators: [(Story) => <Page>{<Story />}</Page>],
};

export const LongContent: Story = {
  args: {
    title: 'A very long drawer title that must be cut with an ellipsis instead of wrapping',
    children: (
      <>
        {Array.from({ length: 14 }, (_, index) => (
          <Input key={index} label={`Field ${String(index + 1)}`} />
        ))}
        <Badge>Scrolls inside the drawer</Badge>
      </>
    ),
  },
  decorators: [(Story) => <Page>{<Story />}</Page>],
};

export const Rtl: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Page dir="rtl">
          <Story />
        </Page>
      </div>
    ),
  ],
};

export const OpenAndCloseWithKeyboard: Story = {
  render: () => <WithTrigger />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open filters' });
    await userEvent.click(trigger);
    const drawer = await canvas.findByRole('complementary', { name: 'Filters' });
    await waitFor(() => expect(drawer).toHaveFocus());
    // Non-modal: the page behind stays reachable.
    await expect(trigger).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('complementary')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
