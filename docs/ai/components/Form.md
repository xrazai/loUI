# Form

> A form built on React Aria `Form`: native validation by default, server errors through
> `validationErrors`, a vertical rhythm of `--ds-form-gap` between its children, and an
> optional error summary. Fields inside inherit the form's `validationBehavior`.

Put exactly one primary action in it, at the end ("Save changes"), and keep submit enabled:
a disabled submit gives no way to learn what is wrong.

A form built on React Aria `Form`: native validation by default, server errors, a consistent vertical rhythm and an optional error summary.

- Import: `import { Form } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Form/Form.tsx`
- Stories (Storybook title `Components/Form`): Default, WithErrorSummary, ServerErrors, ServerRoundTrip, WithFieldSets, AriaValidation, LongText, RightToLeft

## Props

| Prop                 | Type                                                    | Required | Default    | Description                                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validationBehavior` | `'native' \| 'aria'`                                    |          | `'native'` | Native validation (default) uses the browser's constraint validation: a failed submit focuses the first invalid field. `aria` marks fields invalid with ARIA only and never blocks the submit; use it when the server is the only validator.                    |
| `validationErrors`   | `ValidationErrors`                                      |          |            | Errors from the server, keyed by the field `name`. The matching fields become invalid and show the message; the first one takes focus (or the summary does, with `errorSummary`). Clear them (pass `undefined`) when the user edits the field or submits again. |
| `errorSummary`       | `boolean`                                               |          | `false`    | Shows a `FormErrorSummary` at the top of the form. After a failed submit it takes focus and lists the invalid fields as links. Default `false`. To place the summary elsewhere, leave this off and render `FormErrorSummary` inside the form yourself.          |
| `children`           | `ReactNode`                                             |          |            | The fields and actions of the form.                                                                                                                                                                                                                             |
| `messages`           | `Partial<{ summaryTitle: (count: number) => string; }>` |          |            | Per-instance overrides of the built-in messages.                                                                                                                                                                                                                |
| `className`          | `string`                                                |          |            |                                                                                                                                                                                                                                                                 |
| `ref`                | `Ref<HTMLFormElement>`                                  |          |            | Ref to the `<form>` element.                                                                                                                                                                                                                                    |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `DOMProps` (@react-types/shared): `id`
- From `FormProps` (@react-types/shared): `action`, `autoCapitalize`, `autoComplete`, `encType`, `method`, `onInvalid`, `onReset`, `onSubmit`, `role`, `target`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Form: { ... } }}>`.

| Key                           | English default              | Notes                                                                                            |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `summaryTitle(count: number)` | `Fix 2 fields before saving` | Title of the error summary shown after a failed submit. `count` is the number of invalid fields. |

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
