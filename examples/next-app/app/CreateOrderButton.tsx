'use client';

import { Button, toast } from 'loui-ds';

// Event handlers are functions, so this part has to be a Client Component.
export function CreateOrderButton() {
  return (
    <Button variant="primary" onPress={() => toast.success('Order created')}>
      Create order
    </Button>
  );
}
