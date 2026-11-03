import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { Button } from '../Button';
import { ActionList } from './ActionList';
import type { ActionListProps } from './ActionList';
import { ToastRegion, toastWithUndo } from '../Toast';
import { createDocuments, createTasks } from './ActionList.fixtures';

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

/** The checkbox input is visually hidden: click the label that wraps it, like a pointer user. */
const labelOf = (input: HTMLElement): HTMLElement => input.closest('label') ?? input;
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

/** `selectionMode="multiple"` adds a named checkbox to each row; `Space` toggles it. */
export const WithCheckboxes: Story = {
  args: { selectionMode: 'multiple' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(
      canvas.getByRole('checkbox', { name: 'Select Contract with Alfa Confecções' }),
    ).toBeChecked();
  },
};

/** Checkbox, row action and menu together: the checkbox toggles, `Enter` or a click runs the action. */
export const CheckboxWithRowActionAndMenu: Story = {
  args: { selectionMode: 'multiple', onAction: fn(), onSelectionChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      labelOf(canvas.getByRole('checkbox', { name: 'Select Price list 2026' })),
    );
    await expect(args.onSelectionChange).toHaveBeenCalledTimes(1);
    await expect(args.onAction).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByText('Price list 2026'));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

/** Task rows: control on the left, module label and due chip in `meta`, menu on the right. */
export const TaskRows: Story = {
  args: { items: createTasks(), selectionMode: 'multiple', 'aria-label': 'Tasks' },
};

/** `isDone` strikes the title through and adds a hidden "Done" for screen readers. */
export const DoneRows: Story = {
  args: {
    items: createTasks(),
    selectionMode: 'multiple',
    'aria-label': 'Tasks',
    defaultSelectedKeys: ['count-stock'],
  },
  play: async ({ canvasElement }) => {
    const rows = within(canvasElement).getAllByRole('row');
    await expect(rows[1]).toHaveTextContent('Done');
  },
};

export const CheckboxesLongText: Story = {
  args: {
    selectionMode: 'multiple',
    items: createDocuments().map((item, index) =>
      index === 0
        ? {
            ...item,
            title:
              'Contract with Alfa Confecções covering the 2026 wholesale supply of cotton twill and linen',
          }
        : item,
    ),
  },
};

export const CheckboxesDisabledRow: Story = {
  args: {
    selectionMode: 'multiple',
    items: createDocuments().map((item, index) =>
      index === 1 ? { ...item, isDisabled: true } : item,
    ),
  },
};

/**
 * Consumer pattern for reversible toggles: update the state, then `toastWithUndo`. The list never
 * asks for confirmation and never toggles silently.
 */
export const ToggleWithUndo: Story = {
  render: function Render() {
    const [done, setDone] = useState<Set<string>>(() => new Set(['count-stock']));
    const tasks = createTasks().map((task) => ({ ...task, isDone: done.has(task.id) }));
    return (
      <>
        <ActionList
          aria-label="Tasks"
          items={tasks}
          selectionMode="multiple"
          selectedKeys={done}
          onSelectionChange={(keys: Selection) => {
            if (keys === 'all') return;
            const before = done;
            setDone(new Set([...keys].map(String)));
            toastWithUndo('Task updated', {
              onUndo: () => {
                setDone(before);
              },
            });
          }}
        />
        <ToastRegion />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      labelOf(
        within(canvasElement).getByRole('checkbox', {
          name: 'Select Call the supplier about the delayed rolls',
        }),
      ),
    );
    await expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
  },
};
