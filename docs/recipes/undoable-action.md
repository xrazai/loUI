# UndoableAction

Status: experimental

A reversible action (archive, mark as done, change status) that happens at once, with no confirmation, and an Undo in a toast. Built on the `useUndoable` hook.

Components: `Button`, `Badge`, `Toast` (through `useUndoable`).

## When to use

- Archive, mark as done, link, unlink, change a status: anything the user can take back.
- "Reversible actions never ask; they offer Undo" (AGENTS.md section 5).

## When not to use

- Deleting: ask first. See `destructive-confirm`.
- Anything that cannot be reversed or that reaches a customer: use an approval step. See `approval-queue`.

## What it does

1. Archive applies the change immediately: the order leaves the list and the counter changes.
2. A toast says what happened, in the past tense: "Order #1051 archived", with **Undo**. The timer is 5 seconds and pauses while the pointer or focus is on the toast (WCAG 2.2.1); `F6` moves focus into the toast region.
3. Undo calls `revert` with the status saved before acting. If the toast closes first, `commit` runs (`saveStatus`, the server call). A failing commit reverts the change and shows an error toast that stays until dismissed.

## `useUndoable`

```tsx
const undoable = useUndoable();
undoable.run({
  message: 'Order #1051 archived',
  apply: () => setStatus(id, 'archived'), // now
  revert: () => setStatus(id, previous), // Undo, or a failed commit
  commit: () => api.archive(id), // after the Undo window (optional)
});
```

Two ways to persist:

- **Deferred (this recipe):** `apply` changes local state, `commit` saves when the window closes. Simple, but a closed tab loses a pending change.
- **Immediate:** `apply` saves, `revert` sends the inverse change, no `commit`. Use it when losing the change is worse than a second request.

## Things to keep when you adapt it

- Save what Undo needs **before** acting (`order.status` here), not state that may move on.
- The element that had focus is gone after the action. The recipe moves focus to the list heading (`tabIndex={-1}`); focusing the next row's button is also fine.
- Give each repeated button a distinct name (`aria-label="Archive order #1051"`). It starts with the visible text, so voice control still works.

## Code

<!-- recipe-source:start -->

```tsx
import { useRef, useState } from 'react';
import { Badge, Button, Heading, Inline, Stack, Text, useUndoable } from '@loui/ds';

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
```

<!-- recipe-source:end -->

## Verified by

`src/recipes/UndoableAction/UndoableAction.test.tsx` (no dialog appears, Undo, keyboard, fake-timer commit, failed commit, axe), `src/hooks/useUndoable.test.tsx` (the hook itself) and the `Recipes/UndoableAction` stories.
