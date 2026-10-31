# FormErrorSummary

> The error summary of a `Form`: after a failed submit (or new server errors) it takes focus,
> is announced (`role="alert"`), says how many fields need fixing, and lists them as links that
> move focus to the field. It renders nothing while the form is valid. Place it inside a
> `Form`, or turn it on with the form's `errorSummary` prop.

A form built on React Aria `Form`: native validation by default, server errors, a consistent vertical rhythm and an optional error summary.

- Import: `import { FormErrorSummary } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Form/Form.tsx`
- Stories (Storybook title `Components/Form`): Default, WithErrorSummary, ServerErrors, ServerRoundTrip, WithFieldSets, AriaValidation, LongText, RightToLeft

## Props

| Prop        | Type     | Required | Default | Description                 |
| ----------- | -------- | -------- | ------- | --------------------------- |
| `className` | `string` |          |         | Class name for the summary. |

## Design tokens used

`--ds-danger`, `--ds-danger-line`, `--ds-danger-soft`, `--ds-focus-ring-danger`, `--ds-font-sans`, `--ds-form-gap`, `--ds-form-summary-gap`, `--ds-form-summary-padding`, `--ds-fs-small`, `--ds-lh-small`, `--ds-radius-lg`, `--ds-space-5`, `--ds-text`, `--ds-text-2`, `--ds-weight-semibold`

## When to use

- Any set of fields submitted together: create or edit a record, settings, sign-in.
- When you want a failed submit to move focus to the first problem and to list all problems.

## When not to use

- A single search box or an auto-saving inline edit: use the field alone.
- A filter bar that updates as you type: no submit, no form.

## Anatomy

```
form (flex column, gap --ds-form-gap)
  FormErrorSummary   (errorSummary prop, or placed by hand)
  children           fields, FieldSets, actions
```

## Validation flow

1. The user presses the submit button. With native validation the browser blocks an invalid submit and fires `invalid` on each invalid field.
2. React Aria displays the errors (`FieldError`) and focuses the **first invalid field**, whose error is read through `aria-describedby`.
3. With `errorSummary`, focus goes to the **summary** instead: a `role="alert"` box, "Fix 2 fields before saving", listing each invalid field as a link that focuses it.
4. Fixing a field (on blur, when React Aria commits the edit) updates the summary; it disappears when nothing is left.
5. Server errors: set `validationErrors` after the request; the matching fields show their message and the summary (if on) lists them and takes focus. Clear them on the next submit or edit.

Keep the submit button enabled: a disabled submit gives no way to learn what is wrong.

## Accessibility

- The summary is `role="alert"` with `tabindex="-1"`, so it is announced and can take focus programmatically. The links use the field label (the required marker is excluded) and the field's error text.
- Radio and checkbox groups count once, under the group's label.
- Give the form a name (`aria-label` or `aria-labelledby`) when it should be a landmark.

## Content rules

- The summary title is "Fix {n} fields before saving" (pluralized; "Fix 1 field before saving"). `pt-BR` has "Corrija {n} campos antes de salvar".
- Field messages say how to fix the problem ("Enter a complete email address."). A static `errorMessage` text replaces the server's text for that field, so use a function when the server may reply: `errorMessage={(v) => v.validationDetails.valueMissing ? 'Enter a name.' : v.validationErrors.join(' ')}`.

## Examples

```tsx
<Form aria-label="Profile" errorSummary onSubmit={save} validationErrors={errors}>
  <Input label="Full name" name="name" isRequired />
  <FieldSet legend="Contact">
    <Input label="Email" name="email" type="email" isRequired />
  </FieldSet>
  <Button type="submit" variant="primary">
    Save changes
  </Button>
</Form>
```
