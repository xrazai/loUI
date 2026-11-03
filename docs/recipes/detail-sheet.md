# DetailSheet

Status: experimental

Open a record next to its list: a row opens a side `Sheet` with the details in editable fields, a footer with the destructive action at the start and Cancel plus one primary action at the end.

Components: `DataTable`, `Sheet`, `ConfirmDialog`, `Input`, `Select`, `Textarea`, `Badge`, `Toast`.

## When to use

- View and edit a record without leaving the list (orders, customers, invoices).
- Edits that are a few fields. For a large editor use a page.

## When not to use

- A short decision with two buttons: use a `Dialog`.
- A very small edit of one value: edit it in the row.

## What it does

- **Rows are actionable.** `onRowAction` runs on click and on Enter; the open row keeps a raised background and an ink bar (`activeKey`).
- **The sheet** is a modal dialog named "Order", with the order number in mono next to the title. Focus is trapped; **Esc** closes it and focus returns to the row.
- **Footer layout:** "Delete order" (danger) at the start, "Cancel" and "Save order" (the one primary) at the end.
- **Delete asks first.** The button opens a `ConfirmDialog` on top of the sheet. Esc closes **only the confirmation**; the sheet stays. Confirming removes the order, closes the sheet and shows "Order ORD-1048 deleted" with Undo.
- **Save** updates the row, closes the sheet and shows "Order ORD-1048 saved".
- Edits live in a `draft` copy, so Cancel and Esc discard them. The draft is cleared when the sheet closes; the `Sheet` keeps showing the last details while it slides out, so the panel never animates out empty.

## Things to keep when you adapt it

- Edit a copy; commit it only on Save.
- Unsaved changes: if losing them matters, close with a `ConfirmDialog` instead of silently discarding. The sheet's `isDismissable` can be turned off while the draft is dirty.
- Build the footer with the render function (`({ close }) => ...`) so Cancel closes the sheet without extra state.

## Code

<!-- recipe-source:start -->

```tsx
import { useState } from 'react';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Heading,
  Input,
  Select,
  Sheet,
  Stack,
  Textarea,
  toast,
  useUndoable,
} from 'loui-ds';

type Status = 'open' | 'shipped';

export interface Order {
  id: string;
  number: string;
  customer: string;
  status: Status;
  notes: string;
}

const ORDERS: Order[] = [
  { id: 'o-1', number: 'ORD-1047', customer: 'Northwind', status: 'open', notes: '' },
  {
    id: 'o-2',
    number: 'ORD-1048',
    customer: 'Contoso',
    status: 'open',
    notes: 'Call before delivery.',
  },
  { id: 'o-3', number: 'ORD-1050', customer: 'Initech', status: 'shipped', notes: '' },
];

const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'shipped', label: 'Shipped' },
];

export interface DetailSheetProps {
  initialOrders?: Order[];
}

/**
 * Open a record next to its list. A row opens a Sheet with the details in editable fields;
 * the footer puts the destructive action at the start (behind a confirmation) and Cancel plus
 * the one primary action at the end. Esc closes the sheet, or only the confirmation when that
 * is on top, and focus returns to the row.
 */
export function DetailSheet({ initialOrders = ORDERS }: DetailSheetProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Order | null>(null);
  const undoable = useUndoable();

  function open(order: Order) {
    setDraft(order);
    setActiveId(order.id);
  }

  function save(order: Order, close: () => void) {
    setOrders((list) => list.map((item) => (item.id === order.id ? order : item)));
    toast.success(`Order ${order.number} saved`);
    close();
  }

  function remove(order: Order, close: () => void) {
    undoable.run({
      message: `Order ${order.number} deleted`,
      apply: () => {
        setOrders((list) => list.filter((item) => item.id !== order.id));
      },
      revert: () => {
        setOrders((list) => [...list, order]);
      },
    });
    close();
  }

  return (
    <Stack gap={4}>
      <Heading level={2}>Orders</Heading>
      <DataTable
        aria-label="Orders"
        rows={orders}
        defaultSort={{ key: 'customer', direction: 'asc' }}
        activeKey={activeId ?? ''}
        onRowAction={open}
        columns={[
          { key: 'number', label: 'Order', width: '140px', mono: true, muted: true },
          { key: 'customer', label: 'Customer', isRowHeader: true },
          {
            key: 'status',
            label: 'Status',
            width: '140px',
            render: (order) => (
              <Badge tone={order.status === 'shipped' ? 'success' : 'warning'}>
                {order.status === 'shipped' ? 'Shipped' : 'Open'}
              </Badge>
            ),
          },
        ]}
      />
      <Sheet
        isOpen={activeId !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Clearing the draft is safe: the Sheet keeps showing the last details while it
            // slides out, so there is no need to hold on to the record for the animation.
            setActiveId(null);
            setDraft(null);
          }
        }}
        title="Order"
        meta={draft?.number}
        footerStart={({ close }) =>
          draft ? (
            <ConfirmDialog
              trigger={<Button variant="danger">Delete order</Button>}
              title={`Delete order ${draft.number}?`}
              description="The order will be removed from the list. You can undo this for a few seconds."
              confirmLabel="Delete order"
              onConfirm={() => {
                remove(draft, close);
              }}
            />
          ) : null
        }
        footer={({ close }) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <Button
              variant="primary"
              onPress={() => {
                if (draft) save(draft, close);
              }}
            >
              Save order
            </Button>
          </>
        )}
      >
        {draft ? (
          <Stack gap={4}>
            <Input
              label="Customer"
              value={draft.customer}
              onChange={(customer) => {
                setDraft({ ...draft, customer });
              }}
            />
            <Select
              label="Status"
              options={STATUSES}
              value={draft.status}
              onChange={(status) => {
                if (status) setDraft({ ...draft, status: status as Status });
              }}
            />
            <Textarea
              label="Notes"
              value={draft.notes}
              onChange={(notes) => {
                setDraft({ ...draft, notes });
              }}
            />
          </Stack>
        ) : null}
      </Sheet>
    </Stack>
  );
}
```

<!-- recipe-source:end -->

## Verified by

`src/recipes/DetailSheet/DetailSheet.test.tsx` (open, footer order, Esc and focus return, keyboard open, save, cancel, nested confirmation and Esc, delete with Undo, axe with the sheet and the confirmation open) and the `Recipes/DetailSheet` stories.
