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
} from '../../index';

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
          if (!isOpen) setActiveId(null);
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
