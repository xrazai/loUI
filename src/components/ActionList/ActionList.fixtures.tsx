import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { MenuItem, MenuSeparator } from '../Menu';
import type { ActionListItem } from './ActionList';

/** Sample rows shared by the stories and the tests, already in alphabetical order. */
export function createDocuments(
  handlers: {
    onDownload?: (id: string) => void;
    onDelete?: (id: string) => void;
  } = {},
): ActionListItem[] {
  const actions = (id: string) => (
    <>
      <MenuItem
        onAction={() => {
          handlers.onDownload?.(id);
        }}
      >
        Download file
      </MenuItem>
      <MenuItem>Rename file</MenuItem>
      <MenuSeparator />
      <MenuItem
        tone="danger"
        onAction={() => {
          handlers.onDelete?.(id);
        }}
      >
        Delete file
      </MenuItem>
    </>
  );
  return [
    {
      id: 'contract',
      title: 'Contract with Alfa Confecções',
      description: 'Updated by Ana',
      meta: '1.2 MB',
      actions: actions('contract'),
    },
    {
      id: 'price-list',
      title: 'Price list 2026',
      description: 'Updated by Bruno',
      meta: '2.4 MB',
      leading: <Avatar name="Bruno Costa" decorative size="sm" />,
      actions: actions('price-list'),
    },
    { id: 'notes', title: 'Supplier notes', description: 'No actions here', meta: '12 KB' },
  ];
}

/** Task rows for the checkbox stories: module label and due chip in `meta`, a menu on the end. */
export function createTasks(): ActionListItem[] {
  const menu = (
    <>
      <MenuItem>Edit task</MenuItem>
      <MenuItem tone="danger">Delete task</MenuItem>
    </>
  );
  return [
    {
      id: 'call-supplier',
      title: 'Call the supplier about the delayed rolls',
      meta: (
        <>
          <span>Purchasing</span>
          <Badge tone="warning">Due today</Badge>
        </>
      ),
      actions: menu,
    },
    {
      id: 'count-stock',
      title: 'Count the stock of cotton twill',
      isDone: true,
      meta: <span>Warehouse</span>,
      actions: menu,
    },
    {
      id: 'send-quote',
      title: 'Send the quote to Alfa Confecções',
      meta: (
        <>
          <span>Sales</span>
          <Badge>Due Friday</Badge>
        </>
      ),
      actions: menu,
    },
  ];
}
