import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { Sheet } from './Sheet';

/**
 * Sets `dir="rtl"` on the document while the story is mounted: the overlay is portaled to the
 * body, so a wrapper element would not mirror it.
 */
function RtlDocument({ children }: { children: ReactNode }) {
  useEffect(() => {
    const previous = document.documentElement.dir;
    document.documentElement.dir = 'rtl';
    return () => {
      document.documentElement.dir = previous;
    };
  }, []);
  return <div dir="rtl">{children}</div>;
}

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  args: {
    trigger: <Button>View order</Button>,
    title: 'Order',
    meta: 'ORD-1048',
    headerExtra: <Badge tone="success">Shipped</Badge>,
    footerStart: <Button variant="danger">Delete order</Button>,
    footer: ({ close }) => (
      <>
        <Button onPress={close}>Cancel</Button>
        <Button variant="primary" onPress={close}>
          Save order
        </Button>
      </>
    ),
    children: (
      <>
        <Input label="Customer" defaultValue="Northwind" />
        <Input label="Delivery date" defaultValue="2026-11-12" />
      </>
    ),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  // Open sheets cover the page, so the docs page renders each story in its own frame.
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 520 } } },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, focus trapped inside, Escape closes, focus returns to the trigger. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'View order' });
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    const sheet = await screen.findByRole('dialog', { name: 'Order' });
    await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true));
    for (let step = 0; step < 8; step += 1) {
      await userEvent.tab();
      await expect(sheet.contains(document.activeElement)).toBe(true);
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Open for the visual review. */
export const Open: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true },
};

export const Medium: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true, size: 'md' },
};
export const Large: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true, size: 'lg' },
};

export const CloseButton: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'View order' });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('button', { name: 'Close panel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Long content scrolls in the body; the header and the footer stay in view. */
export const LongContent: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: {
    defaultOpen: true,
    children: Array.from({ length: 40 }, (_, index) => (
      <Input key={index} label={`Line ${index + 1}`} />
    )),
  },
};

/** A list or table that bleeds to the edges. */
export const NotPadded: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: {
    defaultOpen: true,
    padded: false,
    children: (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {['Cotton twill', 'Linen blend', 'Wool crepe'].map((name) => (
          <li
            key={name}
            style={{
              padding: 'var(--ds-space-4) var(--ds-space-6)',
              borderBlockEnd: '1px solid var(--ds-line)',
            }}
          >
            {name}
          </li>
        ))}
      </ul>
    ),
  },
};

export const LongTitle: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: {
    defaultOpen: true,
    title: 'Order for a customer with a very long registered company name that does not fit',
  },
};

export const WithDescription: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true, description: 'Edit the lines and the delivery date.' },
};

export const RightToLeft: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true },
  decorators: [
    (Story) => (
      <RtlDocument>
        <Story />
      </RtlDocument>
    ),
  ],
};
