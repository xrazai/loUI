import {
  AppShell,
  Button,
  DataTable,
  Dialog,
  Input,
  Sidebar,
  Stack,
  TopBar,
  toast,
} from '@loui/ds';
import type { DataTableColumn } from '@loui/ds';
import { useState } from 'react';

interface Order {
  id: string;
  customer: string;
  total: string;
}

const columns: DataTableColumn<Order>[] = [
  { key: 'id', label: 'Order', mono: true },
  { key: 'customer', label: 'Customer' },
  { key: 'total', label: 'Total', align: 'end', mono: true },
];

const rows: Order[] = [
  { id: 'ORD-1001', customer: 'Northwind', total: '$1,240.00' },
  { id: 'ORD-1002', customer: 'Tailspin', total: '$310.50' },
  { id: 'ORD-1003', customer: 'Wingtip', total: '$88.00' },
];

export function App() {
  const [name, setName] = useState('');
  return (
    <AppShell
      sidebar={
        <Sidebar
          workspace={{ name: 'Loui' }}
          sections={[{ id: 'main', label: 'Main', items: [{ value: 'orders', label: 'Orders' }] }]}
          value="orders"
        />
      }
      topBar={
        <TopBar
          title="Orders"
          actions={
            <Button variant="primary" onPress={() => toast.success('Order created')}>
              Create order
            </Button>
          }
        />
      }
    >
      <Stack gap={4}>
        <Input label="Customer" value={name} onChange={setName} />
        <DataTable aria-label="Orders" columns={columns} rows={rows} />
        <Dialog
          title="Delete order?"
          description="ORD-1001 will be removed. This can't be undone."
          trigger={<Button>Delete order</Button>}
          footer={({ close }) => <Button onPress={close}>Cancel</Button>}
        />
      </Stack>
    </AppShell>
  );
}
