# ErrorText

> Standalone error text for a group of controls that has no React Aria field around it (a
> hand-built set of colour options, a list of rows). Same look as `FieldError`, but it needs no
> field context and renders whenever it has content: you decide when it shows. Link it from
> the group with `aria-describedby` , see Field.md. Use `FieldError` inside
> a field and `Alert` for an error about the whole page or form.

Shared building blocks that make every form control (`Input`, `Textarea`, `Select`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`) look and behave the same: the same label, description and error styles, the same spacing, the same required marker, the same disabled treatment and the same validation timing. Tickets: ARCH-008, ARCH-009, part of GAP-003.

Most code never imports from `Field` directly: use the ready-made controls. Use the pieces when you compose a field that has no ready-made component yet (for example a custom picker built on a React Aria field).

- Import: `import { ErrorText } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Field/Field.tsx`
- Stories (Storybook title `Components/Field`): Anatomy, ErrorsAfterSaveAttempt, RealtimeValidation, StandaloneErrorText

## Props

| Prop        | Type                        | Required | Default | Description                                                                                                                                                                                                                                                                                                                |
| ----------- | --------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`  | `ReactNode`                 |          |         | The message. Renders nothing when empty (`null`, `undefined`, `false` or `''`).                                                                                                                                                                                                                                            |
| `id`        | `string`                    |          |         | Element id. Defaults to a generated one; pass your own to link the group with `aria-describedby={id}` (and `aria-errormessage={id}`).                                                                                                                                                                                      |
| `announce`  | `boolean`                   |          | `false` | Announces the message when it appears by rendering it as `role="alert"`. Off by default: the group links the text with `aria-describedby`, and focus normally moves to the first invalid control on submit, which reads it. Turn it on for an error that appears with no focus move (for example after a server response). |
| `className` | `string`                    |          |         |                                                                                                                                                                                                                                                                                                                            |
| `ref`       | `Ref<HTMLParagraphElement>` |          |         |                                                                                                                                                                                                                                                                                                                            |

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-control-h-lg`, `--ds-control-h-md`, `--ds-control-h-sm`, `--ds-danger`, `--ds-duration`, `--ds-ease`, `--ds-field-gap`, `--ds-focus-ring`, `--ds-focus-ring-danger`, `--ds-font-sans`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line-control`, `--ds-opacity-disabled`, `--ds-radius-md`, `--ds-space-1`, `--ds-success`, `--ds-surface`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-warning`, `--ds-weight-medium`

## Exports

| Export                                 | What it is                                                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Label`                                | React Aria `Label` with the field label style (13/18, medium). `isRequired` appends the required marker.                                                                       |
| `Description`                          | React Aria `Text slot="description"`, 13/18 in `--ds-text-3`. Linked to the control with `aria-describedby`. `tone` tints it (see Toned description).                          |
| `FieldError`                           | React Aria `FieldError`: renders only while the field is invalid and the error is displayed. The message is in a `role="alert"` element. 13/18 in `--ds-danger`.               |
| `ErrorText`                            | Standalone error text for a group with no field around it. Same look as `FieldError`; `id` (generated by default), `announce` adds `role="alert"`. Renders nothing when empty. |
| `FieldMessages`                        | `Description` (with `descriptionTone`) followed by `FieldError`. Every control renders it under its box.                                                                       |
| `RequiredMark`                         | The marker alone, for fields whose label is not a `Label`.                                                                                                                     |
| `FieldMessageTone`                     | Type: `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'`, the tone of a description.                                                                                |
| `FieldLabelingProps`, `WithLabel`      | Types. `FieldLabelingProps` makes "label, `aria-label` or `aria-labelledby`" mandatory. `WithLabel<P>` helps type stories.                                                     |
| `FieldErrorMessage`, `FieldValidation` | Types for the `errorMessage` prop (a node or a function of the validation result).                                                                                             |

## Anatomy and spacing

```
Label                       13/18 medium, --ds-text
  gap: --ds-field-gap (6px)
Control box                 border --ds-line-control, radius md, height 32/40/48
  gap: --ds-field-gap
Description                 13/18, --ds-text-3
Error                       13/18, --ds-danger
```

The description stays visible when an error shows (the handoff replaced the hint with the error). Constraints such as "8 characters or more" remain useful while the user fixes the value, and both texts are linked to the control.

## Toned description (GAP-039)

A live check under a field ("Matches", "Over by $5", "Short by $5") is a description with a tone, not an error: the field stays valid and no `role="alert"` is added.

```tsx
<CurrencyInput
  label="Amount received"
  currency="USD"
  description="Short by $5.00"
  descriptionTone="danger"
/>
```

- `descriptionTone` (`neutral` default, `accent`, `success`, `warning`, `danger`) is supported by `Input`, `Textarea`, `Select`, `Combobox`, `NumberField`, `CurrencyInput` and `SegmentedControl`; `Description` and `FieldMessages` take `tone` / `descriptionTone`.
- The text carries the meaning; the tone only reinforces it. Write the words yourself ("Over by $5", not a bare "$5") and never rely on colour alone. The tone sets `data-tone` on the description element and nothing else changes: the description is announced exactly as before through `aria-describedby`.
- Colours are the signal tokens `--ds-accent`, `--ds-success`, `--ds-warning`, `--ds-danger`, which pass 4.5:1 on `--ds-bg`, `--ds-surface` and `--ds-surface-raised` (see `contrast-pairs.json`).
- Use `errorMessage` when the value must be fixed before submitting; use a toned description for information that can be left as it is.
- Other fields built on `FieldMessages` (`Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `ChoiceTiles`, `DatePicker`, `TagInput`) do not expose `descriptionTone` yet.

## One state model (ARCH-009)

| State     | Look                                                                                                                       | Semantics                                          |
| --------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Default   | `--ds-line-control` border, `--ds-bg` fill                                                                                 |                                                    |
| Hover     | Border brightens to `--ds-text-3`. The fill never changes, so the border stays at 3:1 or more.                             |                                                    |
| Focus     | Accent border and the 3px focus ring (`--ds-focus-ring`); forced-colors gets a system outline                              |                                                    |
| Invalid   | Danger border and danger focus ring                                                                                        | `aria-invalid`, error linked by `aria-describedby` |
| Read only | `--ds-surface` fill, same border                                                                                           | `readonly`; focusable, submitted with the form     |
| Disabled  | Label and control at `--ds-opacity-disabled`, dashed border, `--ds-surface` fill; description and error stay full strength | `disabled`; not focusable, not submitted           |
| Required  | Marker after the label                                                                                                     | `required` / `aria-required` on the control        |

Form-control borders use `--ds-line-control` and stay at 3:1 or better against the page in every state (WCAG 1.4.11). The suites assert this per state.

## Required marker

`Label isRequired` appends the text of the `requiredMark` message (`*` by default) inside the label. The marker is `aria-hidden`: the control itself exposes "required", so announcing the marker too would repeat it. Override the text per instance (`messages={{ requiredMark: '(required)' }}`) or app-wide:

```tsx
<DSProvider locale="pt-BR" messages={{ Field: { requiredMark: '(obrigatório)' } }}>
```

## Validation behavior: native (default), and why

React Aria fields validate in one of two modes:

- `validationBehavior="native"` (React Aria's default, kept here): the browser's constraint validation. Constraints such as `required`, `type`, `pattern` and `minLength` block submission. The error is **not displayed until the user tries to submit**; then focus moves to the first invalid field and the error appears. Custom `validate` rules report when the user commits the field (leaves it) and again on submit.
- `validationBehavior="aria"`: only ARIA attributes are set; nothing blocks submission, and the error follows every keystroke.

**Decision: `native` is the default for all fields.** It implements the product rule _errors appear only after a save attempt_ without extra code, it works without JavaScript hydration problems (the browser blocks the submit), it puts `required` on the real control and it moves focus to the first problem. `aria` suits fields that need live feedback (a username availability check, a counter): opt in per field with `validationBehavior="aria"`. A consumer that renders its own `Form` can set the mode for every field below it.

Rules for authors:

- Provide an `errorMessage` that says how to fix the problem ("Enter a complete email address."). Without one, React Aria shows the browser's own message, in the browser's language. A static `errorMessage` replaces only that browser text: a message the app supplied (a `validate` rule or `validationErrors` on a `Form`) is shown instead (GAP-009).
- To control `isInvalid` yourself (for example after a server response), pass `isInvalid` and `errorMessage`; the error shows at once.
- The error text is announced when it appears (`role="alert"`) and read again when focus lands on the field.
- Putting `<form>` in the page is enough; no wrapper component is required.

## Errors outside a field: `ErrorText`

| Use                   | When                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `FieldError`          | Inside a React Aria field (`Input`, `Select`, `CheckboxGroup`, ...): validation is wired for you.                     |
| `ErrorText`           | A group of controls you built by hand (colour options, rows) with no field around it. Light, inline, under the group. |
| `Alert tone="danger"` | An error about the whole page, form or request ("Could not save the order"). Heavy, boxed.                            |

`ErrorText` renders whenever it has content, so you decide when it shows. It is not a live region by default: link it with `aria-describedby`, and move focus to the first invalid control on submit so the message is read. Set `announce` when the error appears with no focus move (it adds `role="alert"`). `aria-invalid` is not allowed on `role="group"`; if the group has a role that supports it (`radiogroup`, `listbox`), set it together with `aria-describedby`.

```tsx
const errorId = useId();
<div
  role="group"
  aria-labelledby={labelId}
  aria-describedby={error ? errorId : undefined}
>
  {options}
</div>
<ErrorText id={errorId}>{error}</ErrorText>
```

## Accessibility

- Every control needs an accessible name: `label`, `aria-label` or `aria-labelledby`. The types enforce it; a development warning covers untyped callers.
- `Description` and `FieldError` are linked with `aria-describedby`; the order is description, then error.
- Disabled fields are exempt from contrast requirements; everything else meets 4.5:1 for text and 3:1 for borders.
