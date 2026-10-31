import { AppShell, Button, DataTable, Dialog, Input, Sidebar, Stack, TopBar } from '@loui/ds';
import { CreateOrderButton } from './CreateOrderButton';

const columns = [
  { key: 'id', label: 'Order', mono: true },
  { key: 'customer', label: 'Customer' },
  { key: 'total', label: 'Total', align: 'end' as const, mono: true },
];

const rows = [
  { id: 'ORD-1001', customer: 'Northwind', total: '$1,240.00' },
  { id: 'ORD-1002', customer: 'Tailspin', total: '$310.50' },
  { id: 'ORD-1003', customer: 'Wingtip', total: '$88.00' },
];

// Server Component rendering interactive design system components (they are client references).
export default function Page() {
  return (
    <AppShell
      sidebar={
        <Sidebar
          workspace={{ name: 'Loui' }}
          sections={[{ id: 'main', label: 'Main', items: [{ value: 'orders', label: 'Orders' }] }]}
          value="orders"
        />
      }
      topBar={<TopBar title="Orders" actions={<CreateOrderButton />} />}
    >
      <Stack gap={4}>
        <Input label="Customer" name="customer" />
        <DataTable aria-label="Orders" columns={columns} rows={rows} />
        <Dialog
          title="Delete order?"
          description="ORD-1001 will be removed. This can't be undone."
          trigger={<Button>Delete order</Button>}
        >
          Deleting an order also removes its invoices.
        </Dialog>
      </Stack>
    </AppShell>
  );
}
