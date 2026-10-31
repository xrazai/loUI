import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { Button } from '../Button';
import { ActionList } from './ActionList';
import type { ActionListProps } from './ActionList';
import { createDocuments } from './ActionList.fixtures';

type Props = Extract<ActionListProps, { 'aria-label': string }>;

const meta = {
  title: 'Components/ActionList',
  component: ActionList,
  tags: ['autodocs'],
  args: {
    items: createDocuments(),
    'aria-label': 'Files',
  },
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
} satisfies Meta<Props>;

export default meta;
type Story = StoryObj<Props>;

/** Rows are listed in the order given; sort with `sortByText` for the alphabetical default. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid', { name: 'Files' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')).toHaveLength(3);
    await expect(
      canvas.getByRole('button', { name: 'More actions for Price list 2026' }),
    ).toBeInTheDocument();
  },
};

/** With `onAction` the whole row is a press target; the menu button does not trigger it. */
export const Actionable: Story = {
  args: { onAction: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Price list 2026'));
    await expect(args.onAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'price-list' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'More actions for Price list 2026' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

/** The arrow keys, Home and End move between rows; the right arrow reaches the row menu. */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const rows = canvas.getAllByRole('row');
    await expect(rows[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(rows[1]).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(rows[2]).toHaveFocus();
    await userEvent.keyboard('{Home}{ArrowRight}');
    await expect(
      canvas.getByRole('button', { name: 'More actions for Contract with Alfa Confecções' }),
    ).toHaveFocus();
  },
};

/** Enter opens the row menu, Escape closes it and returns focus to the button. */
export const RowMenu: Story = {
  args: { items: createDocuments({ onDownload: fn() }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: 'More actions for Contract with Alfa Confecções',
    });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: 'Download file' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(button).toHaveFocus());
  },
};

export const Borderless: Story = { args: { bordered: false } };

export const WithLeadingAndLongText: Story = {
  args: {
    items: createDocuments().map((item, index) =>
      index === 1
        ? {
            ...item,
            title:
              'Annual price list for wholesale customers of the southern region, revised edition',
            description:
              'Updated by Bruno Costa after the October supplier review meeting with finance',
          }
        : item,
    ),
  },
};

export const DisabledRow: Story = {
  args: {
    items: createDocuments().map((item, index) =>
      index === 1 ? { ...item, isDisabled: true } : item,
    ),
    onAction: fn(),
  },
};

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', { name: 'No items found' }),
    ).toBeInTheDocument();
  },
};

export const CustomEmpty: Story = {
  args: { items: [], emptyState: <Button size="sm">Upload a file</Button> },
};

/** Row action button names, the empty state and numbers follow the provider locale. */
export const PortugueseBrazil: Story = {
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Mais ações para Price list 2026' }),
    ).toBeInTheDocument();
  },
};
