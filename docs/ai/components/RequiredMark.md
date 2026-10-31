# RequiredMark

> The visible marker of a required field, text from messages. Hidden from assistive technology:
> the control announces "required" itself. Use it when a field cannot use `Label`
> (for example inside a `Checkbox` label).

Shared building blocks that make every form control (`Input`, `Textarea`, `Select`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`) look and behave the same: the same label, description and error styles, the same spacing, the same required marker, the same disabled treatment and the same validation timing. Tickets: ARCH-008, ARCH-009, part of GAP-003.

Most code never imports from `Field` directly: use the ready-made controls. Use the pieces when you compose a field that has no ready-made component yet (for example a custom picker built on a React Aria field).

- Import: `import { RequiredMark } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Field/Field.tsx`
- Stories (Storybook title `Components/Field`): Anatomy, ErrorsAfterSaveAttempt, RealtimeValidation

## Props

| Prop       | Type                                 | Required | Default | Description                                           |
| ---------- | ------------------------------------ | -------- | ------- | ----------------------------------------------------- |
| `messages` | `Partial<{ requiredMark: string; }>` |          |         | Message overrides for this instance (`requiredMark`). |

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Field: { ... } }}>`.

| Key            | English default | Notes                                                                                 |
| -------------- | --------------- | ------------------------------------------------------------------------------------- |
| `requiredMark` | `*`             | Visible marker after the label of a required field. Hidden from assistive technology. |

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-control-h-lg`, `--ds-control-h-md`, `--ds-control-h-sm`, `--ds-danger`, `--ds-duration`, `--ds-ease`, `--ds-field-gap`, `--ds-focus-ring`, `--ds-focus-ring-danger`, `--ds-font-sans`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line-control`, `--ds-opacity-disabled`, `--ds-radius-md`, `--ds-space-1`, `--ds-surface`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`

## Exports

| Export                                 | What it is                                                                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Label`                                | React Aria `Label` with the field label style (13/18, medium). `isRequired` appends the required marker.                                                         |
| `Description`                          | React Aria `Text slot="description"`, 13/18 in `--ds-text-3`. Linked to the control with `aria-describedby`.                                                     |
| `FieldError`                           | React Aria `FieldError`: renders only while the field is invalid and the error is displayed. The message is in a `role="alert"` element. 13/18 in `--ds-danger`. |
| `FieldMessages`                        | `Description` followed by `FieldError`. Every control renders it under its box.                                                                                  |
| `RequiredMark`                         | The marker alone, for fields whose label is not a `Label`.                                                                                                       |
| `FieldLabelingProps`, `WithLabel`      | Types. `FieldLabelingProps` makes "label, `aria-label` or `aria-labelledby`" mandatory. `WithLabel<P>` helps type stories.                                       |
| `FieldErrorMessage`, `FieldValidation` | Types for the `errorMessage` prop (a node or a function of the validation result).                                                                               |

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

- Provide an `errorMessage` that says how to fix the problem ("Enter a complete email address."). Without one, React Aria shows the browser's own message, in the browser's language.
- To control `isInvalid` yourself (for example after a server response), pass `isInvalid` and `errorMessage`; the error shows at once.
- The error text is announced when it appears (`role="alert"`) and read again when focus lands on the field.
- Putting `<form>` in the page is enough; no wrapper component is required.

## Accessibility

- Every control needs an accessible name: `label`, `aria-label` or `aria-labelledby`. The types enforce it; a development warning covers untyped callers.
- `Description` and `FieldError` are linked with `aria-describedby`; the order is description, then error.
- Disabled fields are exempt from contrast requirements; everything else meets 4.5:1 for text and 3:1 for borders.

## Related components

- Used by: Checkbox, Switch
