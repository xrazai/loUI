# DestructiveConfirm

Status: experimental

Delete a record from a row action: ask first in a dialog that names the object and the consequence, then delete and offer Undo in a toast.

Components: `DataTable`, `MoreActionsMenu`, `ConfirmDialog`, `Toast` (through `useUndoable`).

## When to use

- Any deletion of a record the user can see: an order, a customer, an invoice.
- Deleting is the one action that always asks (AGENTS.md section 5, rule 5). The toast with Undo follows it.

## When not to use

- Reversible actions (archive, mark as done, change status): do them at once and offer Undo, with no dialog. See `undoable-action`.
- Actions that cannot be undone at all: keep the dialog and say so in the consequence ("This can't be undone."), and do not show an Undo toast.

## What it does

1. The row has a "More actions for order #1048" menu with a danger item, "Delete order".
2. The item opens a `ConfirmDialog` (an `alertdialog`):
   - Title names the object: "Delete order #1048?".
   - Description is the consequence, one sentence.
   - The danger button names the action and the object: "Delete order #1048".
   - **Initial focus is on Cancel**, so Enter or Space right after it opens never deletes. Escape and Cancel close it without side effects.
3. Confirming runs `useUndoable`: the row leaves the table at once and the toast "Order #1048 deleted" appears with **Undo**.
4. Undo puts the row back. If the toast closes without Undo, `deleteOrder(order)` runs (the real delete). If it fails, the row returns and an error toast stays on screen.

## Things to keep when you adapt it

- Pass the server call as `deleteOrder`; do not call it before the Undo window closes. If your API deletes immediately, omit `commit` in `useUndoable` and make `revert` call a restore endpoint instead (soft delete).
- Mount one `ToastRegion` near the app root (`RecipeHost` does it in the stories and tests).
- The table is alphabetical by customer by default (`defaultSort`), so a restored row lands in its place.
- After the delete, React Aria moves focus to the next row's action. Keep a focusable element in the list; if your list can become empty, move focus to the heading yourself.
- Name each row's menu trigger with `messages={{ moreActions: ... }}` so a screen reader hears which order it belongs to.

## Code

<!-- recipe-source:start -->

```tsx
import { useState } from 'react';
import {
  ConfirmDialog,
  DataTable,
  formatCurrency,
  Heading,
  MenuItem,
  MoreActionsMenu,
  Stack,
  useDSLocale,
  useUndoable,
} from '@loui/ds';

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
            width: '96px',
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
```

<!-- recipe-source:end -->

## Verified by

`src/recipes/DestructiveConfirm/DestructiveConfirm.test.tsx` (behavior, keyboard flow through the grid and the dialog, fake-timer commit and failure, axe on the list, the dialog and the toast) and the `Recipes/DestructiveConfirm` stories.
