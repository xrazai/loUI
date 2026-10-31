# FieldSet

Status: experimental

A group of related fields under a caption: a real `fieldset` with a `legend`, an optional description and disabled propagation.

## When to use

- A set of fields that answer one question: an address, a date range, notification channels.
- A group that should be disabled together.

## When not to use

- For every section of a form: a heading is enough to organize a long form.
- For a single `RadioGroup` or `CheckboxGroup`: they already render a labelled group.

## Anatomy

```
fieldset
  legend        mono caption, uppercase by CSS
  p             description (optional)
  div           the fields, stacked with --ds-field-set-gap
```

## Props

| Prop          | Type        | Default | Notes                                                                     |
| ------------- | ----------- | ------- | ------------------------------------------------------------------------- |
| `legend`      | `ReactNode` | —       | Required. The group's accessible name                                     |
| `description` | `ReactNode` |         | Linked with `aria-describedby`; a consumer `aria-describedby` is kept     |
| `isDisabled`  | `boolean`   | `false` | `fieldset disabled`: native controls inside are disabled and dim together |

Other `fieldset` attributes and `ref` go to the root.

## Accessibility

- A `fieldset` + `legend` is announced as a named group; screen readers read the legend before each field ("Billing address, Street").
- `isDisabled` uses the native attribute, so inputs, selects, textareas and buttons inside cannot be focused or submitted, and are skipped by constraint validation. Controls that are not native elements (menus, custom widgets) are **not** affected: disable those yourself.
- The legend uses `--ds-text-2` (the faint `--ds-text-3` is too low-contrast for a name).

## Content rules

- Legends are short nouns in sentence case ("Billing address"); CSS uppercases them. Descriptions say what the group is for, not how to fill each field.

## Examples

```tsx
<FieldSet legend="Billing address" description="Shown on every invoice.">
  <Input label="Street" name="street" />
  <Input label="City" name="city" />
</FieldSet>

<FieldSet legend="Shipping address" isDisabled>…</FieldSet>
```

## Differences from the handoff

- The handoff had no group component; fields were laid out in plain divs. FieldSet adds the group semantics and shared disabling.
