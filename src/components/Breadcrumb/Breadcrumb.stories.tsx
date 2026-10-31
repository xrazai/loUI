import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { Breadcrumb } from './Breadcrumb';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Orders', href: '#orders' },
      { label: 'Northwind Traders', href: '#northwind' },
      { label: 'ORD-1048' },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.getByText('ORD-1048')).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
  },
};

export const SingleItem: Story = {
  args: { items: [{ label: 'Orders' }] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('link')).toBeNull();
  },
};

/** Tab visits each ancestor link in order; the current page is plain text. */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Orders' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Northwind Traders' })).toHaveFocus();
  },
};

export const LongTrail: Story = {
  args: {
    items: [
      { label: 'Purchase orders awaiting approval', href: '#a' },
      { label: 'Supplier: Fabrics and Notions International Trading Company', href: '#b' },
      { label: 'Delivery batch 2026-10-31 from the northern warehouse', href: '#c' },
      { label: 'ORD-1048 line items with partial shipment and credit note' },
    ],
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={420}>
        <Story />
      </StoryFrame>
    ),
  ],
};

const navigate = fn();

export const RouterNavigation: Story = {
  render: (args) => (
    <DSProvider navigate={navigate}>
      <Breadcrumb {...args} items={[{ label: 'Orders', href: '/orders' }, { label: 'ORD-1048' }]} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('link', { name: 'Orders' }));
    await expect(navigate).toHaveBeenCalledWith('/orders', undefined);
  },
};

export const Portuguese: Story = {
  render: (args) => (
    <DSProvider locale="pt-BR">
      <Breadcrumb {...args} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('navigation', { name: 'Trilha de navegação' }),
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
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
