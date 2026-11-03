import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Alert } from '../Alert';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Divider } from '../Divider';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    title: 'Storage',
    children: <p style={{ margin: 0 }}>6.2 of 10 GB used.</p>,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'raised'] },
    padding: { control: 'inline-radio', options: ['md', 'none'] },
    headingLevel: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: { actions: <button type="button">Manage</button> },
};

export const Raised: Story = {
  args: { variant: 'raised', title: 'Pinned panel' },
};

export const WithoutTitle: Story = {
  args: { title: undefined, 'aria-label': 'Summary' },
};

export const HeadingLevel3: Story = {
  args: { headingLevel: 3, title: 'Nested card' },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li style={{ padding: 'var(--ds-space-3)' }}>First row</li>
        <li style={{ padding: 'var(--ds-space-3)' }}>Second row</li>
      </ul>
    ),
  },
};

export const LongText: Story = {
  args: {
    title: 'A very long card title that has to wrap inside the available width without breaking',
    actions: <button type="button">Manage</button>,
    children: (
      <p style={{ margin: 0, overflowWrap: 'anywhere' }}>
        Content with a long unbroken value: ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048
      </p>
    ),
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  args: { actions: <button type="button">Manage</button> },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

/**
 * The paper scope (`data-theme="paper"`): the only light surface, for receipt and PDF previews.
 * Success, warning and danger use their darker paper twins (TOK-012), so badges, alerts and
 * tinted buttons keep 4.5:1 on the paper.
 */
export const PaperReceipt: Story = {
  args: { title: 'Receipt #1051', variant: 'raised' },
  render: (args) => (
    <StoryFrame theme="paper" padding={4}>
      <Card {...args}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-space-2)' }}>
            <Badge tone="success">Paid</Badge>
            <Badge tone="warning">Awaiting stamp</Badge>
            <Badge tone="danger">Refused</Badge>
            <Badge tone="accent">Copy</Badge>
          </div>
          <Alert tone="success" title="Payment received">
            R$ 1.240,00 on 29 Oct 2026.
          </Alert>
          <Alert tone="warning" title="Delivery date unconfirmed">
            The carrier has not confirmed the pickup.
          </Alert>
          <Alert tone="danger" title="Invoice rejected">
            The tax authority refused the invoice.
          </Alert>
          <div style={{ display: 'flex', gap: 'var(--ds-space-2)' }}>
            <Button variant="secondary" size="sm">
              Print
            </Button>
            <Button variant="danger" size="sm">
              Cancel receipt
            </Button>
          </div>
        </div>
      </Card>
    </StoryFrame>
  ),
};

/**
 * The entry point of the paper scope: put `data-theme="paper"` on the `Card` itself. The card
 * takes the light paper surface, border and text, and nested `Text`, `Heading` and `Divider`
 * (solid and dashed) follow. This is an example composition, not a receipt component.
 */
export const ReceiptPreview: Story = {
  args: { title: 'Receipt #1051' },
  render: (args) => (
    <StoryFrame maxWidth={360} padding={4}>
      <Card {...args} data-theme="paper">
        <Heading level={3}>Northwind Web</Heading>
        <Text tone="secondary">Order placed 29 Oct 2026</Text>
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>Linen, 2 m</Text>
          <Text mono>$1,200.00</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text tone="secondary">Shipping</Text>
          <Text mono>$40.00</Text>
        </div>
        <Divider variant="dashed" />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>Total</Text>
          <Text mono>$1,240.00</Text>
        </div>
      </Card>
    </StoryFrame>
  ),
};
