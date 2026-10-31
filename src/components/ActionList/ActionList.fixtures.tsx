import { Avatar } from '../Avatar';
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
