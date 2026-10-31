import { useRef, useState } from 'react';
import { Badge, Button, Heading, Inline, Stack, Text } from '../../index';
import { useUndoable } from '../../hooks/useUndoable';

export interface Order {
  id: string;
  number: number;
  customer: string;
  status: 'open' | 'archived';
}

const ORDERS: Order[] = [
  { id: 'o-1049', number: 1049, customer: 'Globex', status: 'open' },
  { id: 'o-1050', number: 1050, customer: 'Contoso', status: 'open' },
  { id: 'o-1051', number: 1051, customer: 'Northwind', status: 'open' },
];

export interface UndoableActionProps {
  initialOrders?: Order[];
  /** Saves the new status on the server. Runs after the Undo window closes. */
  saveStatus?: (order: Order, status: Order['status']) => Promise<void>;
}

/**
 * A reversible action never asks for confirmation: it happens now and a toast offers Undo.
 * `useUndoable` applies the change, shows "Order #1051 archived" with an Undo button and either
 * reverts (Undo) or commits (the toast closes).
 */
export function UndoableAction({ initialOrders = ORDERS, saveStatus }: UndoableActionProps) {
  const [orders, setOrders] = useState(initialOrders);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const undoable = useUndoable();
  const open = orders.filter((order) => order.status === 'open');

  function setStatus(id: string, status: Order['status']) {
    setOrders((list) => list.map((order) => (order.id === id ? { ...order, status } : order)));
  }

  function archive(order: Order) {
    undoable.run({
      message: `Order #${order.number} archived`,
      apply: () => {
        setStatus(order.id, 'archived');
      },
      revert: () => {
        setStatus(order.id, order.status); // the status saved before acting
      },
      commit: () => saveStatus?.(order, 'archived'),
    });
    headingRef.current?.focus();
  }

  return (
    <Stack gap={4}>
      <Heading level={2} ref={headingRef} tabIndex={-1}>
        Open orders
      </Heading>
      <Text tone="secondary" size="small" as="p">
        {`${open.length} open, ${orders.length - open.length} archived`}
      </Text>
      <Stack as="ul" gap={2}>
        {open.map((order) => (
          <Inline as="li" key={order.id} justify="between">
            <Inline gap={3}>
              <Text mono tone="secondary">{`#${order.number}`}</Text>
              <Text>{order.customer}</Text>
              <Badge tone="warning">Open</Badge>
            </Inline>
            <Button
              size="sm"
              aria-label={`Archive order #${order.number}`}
              onPress={() => {
                archive(order);
              }}
            >
              Archive
            </Button>
          </Inline>
        ))}
      </Stack>
    </Stack>
  );
}
