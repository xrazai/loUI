import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input as RACInput, TextField } from 'react-aria-components';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Checkbox } from '../Checkbox';
import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Description, FieldError, Label } from './Field';

const meta = {
  title: 'Components/Field',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The building blocks composed by hand inside a React Aria field. Prefer the ready-made fields. */
export const Anatomy: Story = {
  render: () => (
    <TextField isRequired isInvalid>
      <Label isRequired>Workspace name</Label>
      <RACInput style={{ display: 'block', inlineSize: '100%' }} />
      <Description>Visible to everyone on the team.</Description>
      <FieldError>Enter a name.</FieldError>
    </TextField>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toHaveAccessibleDescription(
      'Visible to everyone on the team. Enter a name.',
    );
  },
};

const statuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

/**
 * Validation timing: native validation (the default) keeps every error hidden until the first
 * save attempt, then focuses the first invalid field.
 */
export const ErrorsAfterSaveAttempt: Story = {
  render: () => (
    <form
      noValidate={false}
      style={{ display: 'grid', gap: 'var(--ds-space-4)' }}
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Input label="Name" name="name" isRequired errorMessage="Enter a name." />
      <Select
        label="Status"
        name="status"
        options={statuses}
        isRequired
        errorMessage="Choose a status."
      />
      <Textarea label="Notes" name="notes" isRequired errorMessage="Write a note." />
      <Checkbox
        label="I accept the terms"
        name="terms"
        isRequired
        errorMessage="Accept to continue."
      />
      <button type="submit">Save</button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('alert')).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(canvas.getAllByRole('alert').length).toBeGreaterThan(0));
    await expect(canvas.getByRole('textbox', { name: /Name/ })).toHaveFocus();
  },
};

/** The alternative: `validationBehavior="aria"` reports problems while the user types. Use sparingly. */
export const RealtimeValidation: Story = {
  render: () => (
    <Input
      label="Code"
      validationBehavior="aria"
      validate={(value) => (value.length < 3 ? 'Use at least 3 characters.' : null)}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'a');
    await waitFor(() => expect(canvas.getByRole('alert')).toBeVisible());
  },
};
