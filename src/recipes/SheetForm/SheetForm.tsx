import { useId, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Button, Form, Heading, Input, Select, Sheet, Stack, Text, toast } from '../../index';

export interface SupplierValues {
  name: string;
  email: string;
  country: string;
}

export interface SheetFormProps {
  /** Called with the values after a valid submit. The sheet closes and "saved" is announced. */
  onSave?: (values: SupplierValues) => void;
}

const COUNTRIES = [
  { value: 'br', label: 'Brazil' },
  { value: 'de', label: 'Germany' },
  { value: 'us', label: 'United States' },
];

/**
 * A form inside a Sheet whose submit button lives in the Sheet footer, outside the form. The
 * button and the form are linked with the `form` attribute, so the browser does the work: a
 * click submits natively, Enter inside a field submits, and an invalid form is blocked with
 * focus on the first invalid field. One primary action (the submit button), Cancel beside it.
 */
export function SheetForm({ onSave }: SheetFormProps) {
  const formId = useId();
  const [isOpen, setIsOpen] = useState(false);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => {
      const value = data.get(name);
      return typeof value === 'string' ? value : '';
    };
    const values = { name: text('name'), email: text('email'), country: text('country') };
    onSave?.(values);
    toast.success(`Supplier ${values.name} saved`);
    setIsOpen(false);
  }

  return (
    <Stack gap={4}>
      <Heading level={2}>Suppliers</Heading>
      <Text tone="secondary">No suppliers yet. Add the first one.</Text>
      <div>
        <Button
          onPress={() => {
            setIsOpen(true);
          }}
        >
          New supplier
        </Button>
      </div>
      <Sheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="New supplier"
        footer={({ close }) => (
          <>
            <Button onPress={close}>Cancel</Button>
            {/* Outside the <form>, but `form` points at it: a native submit with validation. */}
            <Button type="submit" form={formId} variant="primary">
              Save supplier
            </Button>
          </>
        )}
      >
        <Form id={formId} aria-label="New supplier" onSubmit={handleSubmit}>
          <Input
            label="Name"
            name="name"
            autoComplete="organization"
            isRequired
            errorMessage="Enter the supplier's name."
          />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            isRequired
            errorMessage={(validity) =>
              validity.validationDetails.valueMissing || validity.validationDetails.typeMismatch
                ? 'Enter a complete email address.'
                : validity.validationErrors.join(' ')
            }
          />
          <Select
            label="Country"
            name="country"
            options={COUNTRIES}
            isRequired
            errorMessage="Select a country."
          />
        </Form>
      </Sheet>
    </Stack>
  );
}
