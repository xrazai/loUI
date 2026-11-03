import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Card } from '../Card';
import { Grid } from '../Grid';
import { Icon, BellIcon, UsersIcon } from '../Icon';
import { AddCard } from '../AddCard';
import { StoryFrame } from '../../test/StoryFrame';
import { CardLink } from './CardLink';
import type { CardLinkProps } from './CardLink';

type LinkArgs = Extract<CardLinkProps, { href: string }>;

const meta = {
  title: 'Components/CardLink',
  component: CardLink,
  tags: ['autodocs'],
  args: {
    title: 'Billing',
    description: 'Plans, invoices and payment methods.',
    href: '#billing',
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<LinkArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The title is the link; its name is only the title, the description is the accessible description. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Billing' });
    await expect(link).toHaveAccessibleDescription('Plans, invoices and payment methods.');
  },
};

export const WithLeadingAndMeta: Story = {
  args: {
    leading: <Icon icon={UsersIcon} />,
    title: 'Team',
    description: 'Members, roles and invitations.',
    meta: '12 members',
    href: '#team',
  },
};

const onImport = fn();

export const AsButton: Story = {
  render: () => (
    <CardLink title="Import data" description="Upload a CSV file." onPress={onImport} />
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Import data' });
    await userEvent.click(button);
    await expect(onImport).toHaveBeenCalledTimes(1);
  },
};

export const LongText: Story = {
  args: {
    leading: <Icon icon={BellIcon} />,
    title: 'A very long category title that has to wrap inside the available width',
    description:
      'A long description with an unbroken value: ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048',
    meta: 'ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048',
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, title: 'Integrations', description: 'Available on the Pro plan.' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Integrations' });
    await expect(link).toHaveAttribute('aria-disabled', 'true');
  },
};

/** Keyboard focus draws the ring on the whole card outline. */
export const Focused: Story = {
  play: async () => {
    await userEvent.tab();
  },
};

export const ExternalLink: Story = {
  args: { href: 'https://example.com/docs', target: '_blank', title: 'Documentation' },
};

export const RightToLeft: Story = {
  args: { leading: <Icon icon={UsersIcon} />, meta: '12 members' },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

/** Next to plain `Card`s and an `AddCard`; every tile stretches to the row height. */
export const InGrid: Story = {
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={760}>
        <Story />
      </StoryFrame>
    ),
  ],
  render: () => (
    <Grid minItemWidth="md" gap={4}>
      <CardLink
        leading={<Icon icon={UsersIcon} />}
        title="Team"
        description="Members, roles and invitations."
        href="#team"
      />
      <CardLink
        leading={<Icon icon={BellIcon} />}
        title="Notifications"
        description="Choose what reaches you, and when. Digest emails can be sent daily or weekly."
        meta="3 channels"
        href="#notifications"
      />
      <Card title="Storage">6.2 of 10 GB used.</Card>
      <AddCard href="#new">Create category</AddCard>
    </Grid>
  ),
};
