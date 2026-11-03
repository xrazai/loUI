# FieldSet

> Groups related fields under a caption: a real `fieldset` with a `legend`, an optional
> description, and disabled propagation. Use it for a set of fields that answer one question
> (an address, notification channels), not for every section of a form.

A group of related fields under a caption: a real `fieldset` with a `legend`, an optional description and disabled propagation.

- Import: `import { FieldSet } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/FieldSet/FieldSet.tsx`
- Stories (Storybook title `Components/FieldSet`): Default, WithDescription, Disabled, WithRadioGroup, LongText, RightToLeft

## Props

| Prop          | Type        | Required | Default | Description                                                                                                                                                                                                                                                                       |
| ------------- | ----------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `legend`      | `ReactNode` | yes      |         | Caption of the group, required. It is the `legend`: screen readers announce it before each field in the group ("Billing address, Street"). Write it in sentence case; CSS makes it a mono caption.                                                                                |
| `description` | `ReactNode` |          |         | Optional help for the whole group, linked to the fieldset with `aria-describedby`.                                                                                                                                                                                                |
| `isDisabled`  | `boolean`   |          | `false` | Disables every native control inside (inputs, selects, textareas, buttons), the way `<fieldset disabled>` does: they cannot be focused or submitted and dim together. Controls that are not native elements (menus, custom widgets) are not affected: disable those individually. |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-field-set-gap`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-opacity-disabled`, `--ds-text-2`, `--ds-text-3`, `--ds-tracking-caption`, `--ds-weight-medium`

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

## Accessibility

- A `fieldset` + `legend` is announced as a named group; screen readers read the legend before each field ("Billing address, Street").
- `isDisabled` uses the native attribute, so inputs, selects, textareas and buttons inside cannot be focused or submitted, and are skipped by constraint validation. Controls that are not native elements (menus, custom widgets) are **not** affected: disable those yourself.
- The legend uses `--ds-text-2` (the faint `--ds-text-3` is too low-contrast for a name).

## Legend or label

The two names look different on purpose:

| Name                                                    | Looks like                                     | Use it for                                           |
| ------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| `Label` (of `Input`, `Select`, `SegmentedControl`, ...) | 13/18 medium sentence-case text in `--ds-text` | Naming one field                                     |
| `FieldSet` `legend`                                     | Mono uppercase caption in `--ds-text-2`        | Naming a group of fields, like the title of a `Card` |

The legend is a section caption, one level above the field labels it contains, so a group never reads as one more field. A single `SegmentedControl`, `RadioGroup` or `CheckboxGroup` is already a labelled group: give it a `label` and do not wrap it in a `FieldSet`. Use a `FieldSet` when several fields answer one question ("Billing address").

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

## Related components

- Instead, see RadioGroup: For a single `RadioGroup` or `CheckboxGroup`: they already render a labelled group.
- Instead, see CheckboxGroup: For a single `RadioGroup` or `CheckboxGroup`: they already render a labelled group.
