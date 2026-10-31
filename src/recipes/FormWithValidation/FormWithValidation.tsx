import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Button, FieldSet, Form, Heading, Inline, Input, Select, Stack, Text } from '../../index';

export interface CustomerValues {
  name: string;
  email: string;
  street: string;
  country: string;
}

/** Field name to message. This is the shape most APIs can produce for a rejected save. */
export type ServerErrors = Record<string, string>;

export interface FormWithValidationProps {
  /** Saves the customer. Resolve with server-side errors keyed by field name, or nothing. */
  saveCustomer?: (values: CustomerValues) => Promise<ServerErrors | undefined>;
}

const COUNTRIES = [
  { value: 'br', label: 'Brazil' },
  { value: 'de', label: 'Germany' },
  { value: 'us', label: 'United States' },
];

/** Stand-in for a real request: the server rejects an address that is already taken. */
async function fakeSave(values: CustomerValues): Promise<ServerErrors | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (values.email === 'taken@example.com') {
    return { email: 'This email belongs to another customer. Enter a different email.' };
  }
  return undefined;
}

/**
 * A form that fails well: native validation with one message per field, an error summary that
 * takes focus on a failed submit, server errors on the same fields, a Save button that stays
 * enabled, and a "Saved" confirmation next to it.
 */
export function FormWithValidation({ saveCustomer = fakeSave }: FormWithValidationProps) {
  const [errors, setErrors] = useState<ServerErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => {
      const value = data.get(name);
      return typeof value === 'string' ? value : '';
    };
    setErrors({}); // clear the previous server errors on every attempt
    setSaved(false);
    setIsSaving(true);
    const result = await saveCustomer({
      name: text('name'),
      email: text('email'),
      street: text('street'),
      country: text('country'),
    });
    setIsSaving(false);
    if (result) setErrors(result);
    else setSaved(true);
  }

  return (
    <Stack
      gap={4}
      onInput={() => {
        setSaved(false); // editing again makes "Saved" stale
      }}
    >
      <Heading level={2}>New customer</Heading>
      <Form
        aria-label="New customer"
        errorSummary
        validationErrors={errors}
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          isRequired
          errorMessage="Enter the customer's full name."
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          description="Invoices are sent to this address."
          isRequired
          errorMessage={(validity) =>
            validity.validationDetails.valueMissing || validity.validationDetails.typeMismatch
              ? 'Enter a complete email address.'
              : validity.validationErrors.join(' ')
          }
        />
        <FieldSet legend="Billing address" description="Shown on every invoice.">
          <Input label="Street" name="street" autoComplete="street-address" />
          <Select label="Country" name="country" options={COUNTRIES} />
        </FieldSet>
        <Inline gap={3}>
          <Button type="submit" variant="primary" isPending={isSaving}>
            Save customer
          </Button>
          <Text role="status" size="small" tone="secondary">
            {saved ? 'Saved' : ''}
          </Text>
        </Inline>
      </Form>
    </Stack>
  );
}
