import { formatCurrency } from '../../utils/currency';
import { Badge } from '../Badge';
import type { BadgeTone } from '../Badge';
import type { DataTableColumn } from './DataTable';

/** Sample rows shared by the stories and the tests. */
export interface Order {
  id: string;
  customer: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  /** Minor units (cents). */
  total: number;
  date: string;
}

const TONES: Record<Order['status'], BadgeTone> = {
  Paid: 'success',
  Pending: 'warning',
  Overdue: 'danger',
};

/** Deliberately not alphabetical: the table shows rows as given until the user sorts. */
export const orders: Order[] = [
  { id: 'ORD-1001', customer: 'Zeta Supplies', status: 'Paid', total: 124000, date: '2026-10-28' },
  { id: 'ORD-1002', customer: 'Émile Studio', status: 'Pending', total: 8900, date: '2026-10-27' },
  {
    id: 'ORD-1003',
    customer: 'Alfa Confecções',
    status: 'Overdue',
    total: 45050,
    date: '2026-10-12',
  },
  { id: 'ORD-1004', customer: 'Eva Moda', status: 'Paid', total: 1000, date: '2026-10-30' },
  { id: 'ORD-1005', customer: 'Bruno Costa', status: 'Pending', total: 230000, date: '2026-10-05' },
  { id: 'ORD-1006', customer: 'ana lima', status: 'Paid', total: 76000, date: '2026-09-30' },
  { id: 'ORD-1007', customer: 'Casa Norte', status: 'Overdue', total: 15500, date: '2026-10-01' },
];

export const orderColumns: DataTableColumn<Order>[] = [
  { key: 'id', label: 'Order', width: '120px', mono: true, muted: true },
  { key: 'customer', label: 'Customer' },
  {
    key: 'status',
    label: 'Status',
    width: '120px',
    render: (row) => <Badge tone={TONES[row.status]}>{row.status}</Badge>,
  },
  {
    key: 'total',
    label: 'Total',
    width: '120px',
    align: 'end',
    mono: true,
    render: (row) => formatCurrency(row.total, 'USD', 'en-US'),
  },
];
