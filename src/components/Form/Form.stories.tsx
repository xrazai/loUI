import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { FieldSet } from '../FieldSet';
import { Input } from '../Input';
import { Select } from '../Select';
import { Form } from './Form';
import type { FormProps } from './Form';
import { StoryFrame } from '../../test/StoryFrame';

function emptyMessage(text: string) {
  return (validation: { validationDetails: ValidityState; validationErrors: string[] }) =>
    validation.validationDetails.valueMissing ? text : validation.validationErrors.join(' ');
}

function ProfileFields() {
  return (
    <>
      <Input
        label="Full name"
        name="name"
        isRequired
        errorMessage={emptyMessage('Enter your full name.')}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        isRequired
        description="We send receipts here."
        errorMessage={emptyMessage('Enter a complete email address.')}
      />
      <Button type="submit" variant="primary">
        Save changes
      </Button>
    </>
  );
}

const meta = {
  title: 'Components/Form',
  component: Form,
  tags: ['autodocs'],
  args: { 'aria-label': 'Profile', children: <ProfileFields /> },
  argTypes: {
    validationBehavior: { control: 'inline-radio', options: ['native', 'aria'] },
    errorSummary: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <StoryFrame width={400}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A failed submit focuses the first invalid field, which reads its error. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: /Full name/ })).toHaveFocus());
    await expect(canvas.getByText('Enter your full name.')).toBeVisible();
  },
};

/** The summary takes focus after a failed submit and links to each invalid field by its label. */
export const WithErrorSummary: Story = {
  args: { errorSummary: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    const summary = await canvas.findByText('Fix 2 fields before saving');
    await waitFor(() => expect(summary.closest('[role="alert"]')).toHaveFocus());
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('textbox', { name: /Full name/ })).toHaveFocus();
  },
};

/** Errors from the server, keyed by the field name. */
export const ServerErrors: Story = {
  args: { errorSummary: true, validationErrors: { email: 'That email is already in use.' } },
  render: (args) => (
    <Form {...args}>
      <Input label="Full name" name="name" />
      <Input label="Email" name="email" type="email" />
      <Button type="submit" variant="primary">
        Save changes
      </Button>
    </Form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      (await canvas.findAllByText(/That email is already in use\./)).length,
    ).toBeGreaterThan(0);
  },
};

/** Server errors set by a submit handler, the way an app does it. */
export const ServerRoundTrip: Story = {
  render: function Render(args) {
    const [errors, setErrors] = useState<FormProps['validationErrors']>();
    return (
      <Form
        {...args}
        errorSummary
        validationErrors={errors}
        onSubmit={(event) => {
          event.preventDefault();
          setErrors({ email: 'That email is already in use.' });
        }}
      >
        <Input label="Email" name="email" type="email" />
        <Button type="submit" variant="primary">
          Save changes
        </Button>
      </Form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(await canvas.findByText('Fix 1 field before saving')).toBeVisible();
  },
};

/** FieldSet groups related fields; the form keeps one rhythm between groups and fields. */
export const WithFieldSets: Story = {
  args: {
    'aria-label': 'Account',
    children: [
      <FieldSet key="id" legend="Identity">
        <Input label="Full name" name="name" isRequired />
        <Input label="Email" name="email" type="email" isRequired />
      </FieldSet>,
      <FieldSet key="region" legend="Region" description="Where your data is stored.">
        <Select
          label="Country"
          name="country"
          isRequired
          options={[
            { value: 'br', label: 'Brazil' },
            { value: 'pt', label: 'Portugal' },
          ]}
        />
      </FieldSet>,
      <Button key="save" type="submit" variant="primary">
        Save changes
      </Button>,
    ],
  },
};

/** With aria validation the browser never blocks the submit. */
export const AriaValidation: Story = {
  args: { validationBehavior: 'aria' },
};

export const LongText: Story = {
  decorators: [
    (Story) => (
      <StoryFrame width={260}>
        <Story />
      </StoryFrame>
    ),
  ],
  args: {
    children: (
      <Input
        label="A very long label that has to wrap inside a narrow form without breaking the layout"
        name="long"
        isRequired
        description="A long description that also wraps."
      />
    ),
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <StoryFrame dir="rtl" width={400}>
        <Story />
      </StoryFrame>
    ),
  ],
};
