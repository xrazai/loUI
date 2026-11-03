# Form

Status: experimental

A form built on React Aria `Form`: native validation by default, server errors, a consistent vertical rhythm and an optional error summary.

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

## Props

| Prop                               | Type                                 | Default    | Notes                                                                                  |
| ---------------------------------- | ------------------------------------ | ---------- | -------------------------------------------------------------------------------------- |
| `validationBehavior`               | `'native' \| 'aria'`                 | `'native'` | Form level; fields inherit it. `aria` marks fields invalid but never blocks the submit |
| `validationErrors`                 | `Record<string, string \| string[]>` |            | Server errors keyed by field `name`                                                    |
| `errorSummary`                     | `boolean`                            | `false`    | Shows `FormErrorSummary` at the top                                                    |
| `onSubmit`, `onReset`, `action`, … |                                      |            | As on a `form`                                                                         |
| `messages`                         | `{ summaryTitle(n) }`                |            | Per-instance message overrides                                                         |

`ref` points at the `<form>`. `FormErrorSummary` takes `className` and must be rendered inside a `Form`.

## Submitting from outside the form

Give the form an `id` and point a submit button at it with the `form` attribute. The browser then submits (and validates) the form natively, so the button can live anywhere in the document, such as the footer of a `Sheet`, which sits outside the body that holds the form:

```tsx
<Sheet
  title="New customer"
  footer={
    <Button type="submit" form="customer-form" variant="primary">
      Save customer
    </Button>
  }
>
  <Form id="customer-form" aria-label="New customer" onSubmit={save}>
    �
  </Form>
</Sheet>
```

Enter inside a field submits the form as usual, and a failed native validation focuses the first invalid field (or the summary). See the `SheetForm` recipe.

Keep consumer handlers (`onKeyDown`, `onFocus`, �) to what the form level needs, such as `Ctrl+Enter` to save. The form registers no React key or focus handler, so yours never replace an internal one. A handler on the form also sees keys from fields, so `event.key === 'Enter'` there is not a submit: let the browser submit instead.

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
- Field messages say how to fix the problem ("Enter a complete email address."). A static `errorMessage` text replaces only the browser's own constraint text ("Please fill out this field"); a server error from `validationErrors` (or a `validate` message) is shown instead of it. Use the function form when you need full control: `errorMessage={(v) => v.validationDetails.valueMissing ? 'Enter a name.' : v.validationErrors.join(' ')}`.

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

## Differences from the handoff

- The handoff had no form-level validation; each field validated itself. Validation behavior is set once on the form, server errors are first-class, and the summary is new (GAP-003).
