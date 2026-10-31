import { useState } from 'react';
import {
  ConfirmDialog,
  DataTable,
  Heading,
  MenuItem,
  MoreActionsMenu,
  Stack,
  formatCurrency,
  useDSLocale,
  useUndoable,
} from '../../index';

export interface Order {
  id: string;
  number: number;
  customer: string;
  lines: number;
  /** Integer minor units (cents). */
  total: number;
}

const ORDERS: Order[] = [
  { id: 'o-1046', number: 1046, customer: 'Acme Supply', lines: 6, total: 128_000 },
  { id: 'o-1047', number: 1047, customer: 'Northwind', lines: 3, total: 45_050 },
  { id: 'o-1048', number: 1048, customer: 'Contoso', lines: 14, total: 310_075 },
  { id: 'o-1049', number: 1049, customer: 'Globex', lines: 2, total: 9_900 },
];

export interface DestructiveConfirmProps {
  initialOrders?: Order[];
  /** Permanently deletes the order on the server. Runs after the Undo window closes. */
  deleteOrder?: (order: Order) => Promise<void>;
}

/**
 * Deleting always asks first (a dialog that names the object and the consequence, focus on
 * Cancel), then offers Undo in a toast. The row leaves the list at once; the real delete runs
 * when the Undo window closes, and is reverted with an error toast if it fails.
 */
export function DestructiveConfirm({
  initialOrders = ORDERS,
  deleteOrder,
}: DestructiveConfirmProps) {
  const locale = useDSLocale();
  const [orders, setOrders] = useState(initialOrders);
  const [target, setTarget] = useState<Order | null>(null); // kept while the dialog fades out
  const [isConfirming, setConfirming] = useState(false);
  const undoable = useUndoable();

  function remove(order: Order) {
    undoable.run({
      message: `Order #${order.number} deleted`,
      apply: () => {
        setOrders((list) => list.filter((item) => item.id !== order.id));
      },
      revert: () => {
        setOrders((list) => [...list, order]);
      },
      commit: () => deleteOrder?.(order),
    });
  }

  return (
    <Stack gap={4}>
      <Heading level={2}>Orders</Heading>
      <DataTable
        aria-label="Orders"
        rows={orders}
        defaultSort={{ key: 'customer', direction: 'asc' }}
        columns={[
          { key: 'number', label: 'Order', width: '120px', mono: true, muted: true },
          { key: 'customer', label: 'Customer', isRowHeader: true },
          { key: 'lines', label: 'Lines', width: '96px', align: 'end', mono: true },
          {
            key: 'total',
            label: 'Total',
            width: '140px',
            align: 'end',
            mono: true,
            render: (order) => formatCurrency(order.total, 'USD', locale),
          },
          {
            key: 'actions',
            label: 'Actions',
            width: '72px',
            align: 'end',
            sortable: false,
            render: (order) => (
              <MoreActionsMenu
                size="sm"
                messages={{ moreActions: `More actions for order #${order.number}` }}
                onAction={() => {
                  setTarget(order);
                  setConfirming(true);
                }}
              >
                <MenuItem id="delete" tone="danger">
                  Delete order
                </MenuItem>
              </MoreActionsMenu>
            ),
          },
        ]}
      />
      <ConfirmDialog
        isOpen={isConfirming}
        onOpenChange={setConfirming}
        title={target ? `Delete order #${target.number}?` : ''}
        description={
          target
            ? `The order and its ${target.lines} lines will be removed. You can undo this for a few seconds.`
            : ''
        }
        confirmLabel={target ? `Delete order #${target.number}` : 'Delete order'}
        onConfirm={() => {
          if (target) remove(target);
        }}
      />
    </Stack>
  );
}
