import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { clearToastsAfterStory, expectToast, recipeDecorator } from '../storybook';
import { FilterableTable } from './FilterableTable';

const meta = {
  title: 'Recipes/FilterableTable',
  component: FilterableTable,
  tags: ['autodocs'],
  decorators: [recipeDecorator({ maxWidth: 880, minHeight: 520 })],
  beforeEach: clearToastsAfterStory,
  parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
} satisfies Meta<typeof FilterableTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const customers = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll('tbody [role="rowheader"]')].map((cell) => cell.textContent);

/** Alphabetical by customer until the user sorts. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(customers(canvasElement)[0]).toBe('Acme Supply');
  },
};

export const FilteredByStatus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: /^Open/ }));
    await waitFor(() =>
      expect(customers(canvasElement)).toEqual(['Contoso', 'Northwind', 'Umbrella']),
    );
  },
};

/** No match: what happened and what to do, with a way out. */
export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search orders' }), 'zzz');
    await expect(await canvas.findByRole('heading', { name: 'No orders found' })).toBeVisible();
    await expect(canvas.getByText('Try another filter or search term.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() => expect(customers(canvasElement)).toHaveLength(6));
  },
};

/** Select rows, archive them in one action, undo. */
export const BulkArchive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByRole('checkbox', { name: 'Select row Contoso' }).closest('label');
    if (label) await userEvent.click(label);
    await userEvent.click(await canvas.findByRole('button', { name: 'Archive orders' }));
    await expectToast(/1 order archived/);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
  },
};
