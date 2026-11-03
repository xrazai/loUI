# ChoiceTiles

> Single-choice tiles: a `radiogroup` whose options are drawn as big buttons with a label and an
> optional meta line. The group is one tab stop; arrow keys move focus and select, `Space`
> selects (React Aria roving focus; arrows wrap at the ends like any radio group).
> `value`, `defaultValue` and `onChange(value)` follow React Aria. A group needs a name: pass
> `label`, `aria-label` or `aria-labelledby`.

For a few short options drawn as one bar, use `SegmentedControl`; for a plain list of
options, use `RadioGroup`.

Single-choice tiles: a labelled group where the options are drawn as large buttons with a label and an optional meta line. Built on React Aria `RadioGroup` with custom radio buttons, so it is a real `radiogroup` with roving focus.

- Handoff source: `components/erp/ChoiceTiles.jsx` (TODO `CMP-PAT-08`).

- Import: `import { ChoiceTiles } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/ChoiceTiles/ChoiceTiles.tsx`
- Stories (Storybook title `Components/ChoiceTiles`): Default, Selected, Medium, ThreeColumns, WithoutMeta, DisabledTile, DisabledGroup, WithDescription, Invalid, Required, LongText, NarrowContainer, RightToLeft, KeyboardSelection, Controlled, Focused

## Props

| Prop              | Type                                 | Required | Default | Description                                                                                                                                                        |
| ----------------- | ------------------------------------ | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`         | `readonly ChoiceTilesOption[]`       | yes      |         | The tiles, in display order. Two to eight fit well.                                                                                                                |
| `description`     | `ReactNode`                          |          |         | Helper text under the label. Linked with `aria-describedby`.                                                                                                       |
| `errorMessage`    | `FieldErrorMessage`                  |          |         | Error text, shown while the group is invalid.                                                                                                                      |
| `columns`         | `number`                             |          | `2`     | Maximum number of columns. Default `2`. The grid collapses to fewer columns on narrow containers so a tile never gets narrower than `--ds-choice-tiles-min-width`. |
| `size`            | `'md' \| 'lg'`                       |          | `'lg'`  | Tile height: `md` 40px or `lg` 48px (default).                                                                                                                     |
| `className`       | `string`                             |          |         | Class name for the group root.                                                                                                                                     |
| `messages`        | `Partial<{ requiredMark: string; }>` |          |         | Message overrides for this instance (`requiredMark`).                                                                                                              |
| `ref`             | `Ref<HTMLDivElement>`                |          |         | Ref to the group root `<div>`.                                                                                                                                     |
| `label`           | `ReactNode`                          |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                |
| `aria-label`      | `string`                             |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                            |
| `aria-labelledby` | `string`                             |          |         | Id of the element that names the field.                                                                                                                            |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaValidationProps` (@react-types/shared): `aria-errormessage`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`, `name`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `SlotProps` (react-aria-components): `slot`
- From `Validation` (@react-types/shared): `isInvalid`, `isRequired`, `validate`
- From `ValueBase` (@react-types/shared): `defaultValue`, `onChange`, `value`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `md`, `lg`

## Design tokens used

`--ds-accent`, `--ds-accent-soft`, `--ds-bg`, `--ds-choice-tiles-columns`, `--ds-choice-tiles-gap`, `--ds-choice-tiles-height-lg`, `--ds-choice-tiles-height-md`, `--ds-choice-tiles-min-width`, `--ds-danger`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-small`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-line-control`, `--ds-opacity-disabled`, `--ds-radius-md`, `--ds-space-1`, `--ds-space-3`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`, `--ds-weight-regular`

## When to use

- A choice with 2 to 8 short options where each option deserves weight: delivery method, plan, size, payment type.
- When a secondary fact helps decide (a price, a duration, a code): use `meta`.

## When not to use

- For a view mode or a small filter: use `SegmentedControl`.
- For a long list of options or long descriptions: use `RadioGroup` (with descriptions) or `Select`.
- For several selections at once: use `CheckboxGroup` or `TagGroup`.

## Anatomy

```
div[role=radiogroup] aria-labelledby=label
  label                      (group label, from `label`)
  div.grid                   (responsive grid, at most `columns` columns)
    div > label.tile         (one per option; hidden native radio inside)
      label text
      meta                   (optional, mono)
  description / error
```

## Accessibility

- Semantics: `radiogroup` of native radio inputs; the tile is the radio's label.
- Keyboard: one tab stop; arrows (`←` `↑` previous, `→` `↓` next) move focus and select, wrapping at the ends; `Space` selects the focused tile. Disabled tiles are skipped.
- State is not color alone: the selected tile has a doubled (2px) accent border, a soft fill and ink text, and screen readers get "checked".
- Boundaries: unselected tiles use `--ds-line-control` (3:1) and hover brightens the border instead of changing the fill, so the 3:1 holds in every state. The meta line uses `--ds-text-2` (`--ds-text-3` fails 4.5:1 on the selected fill).
- Focus: accent border plus ring. Forced colors: the selected border uses `Highlight`.

## Content rules

- Labels in sentence case, one to three words. Put the differentiating fact in `meta`, not in the label.
- Keep the same shape across tiles: avoid `meta` on some tiles only.

## Examples

```tsx
<ChoiceTiles
  label="Delivery"
  columns={2}
  options={[
    { value: 'standard', label: 'Standard', meta: '3-5 days' },
    { value: 'express', label: 'Express', meta: '1 day' },
  ]}
  value={method}
  onChange={setMethod}
/>
```

## Related components

- Instead, see SegmentedControl: For a view mode or a small filter: use `SegmentedControl`.
- Instead, see RadioGroup: For a long list of options or long descriptions: use `RadioGroup` (with descriptions) or `Select`.
- Instead, see Select: For a long list of options or long descriptions: use `RadioGroup` (with descriptions) or `Select`.
- Instead, see CheckboxGroup: For several selections at once: use `CheckboxGroup` or `TagGroup`.
- Instead, see TagGroup: For several selections at once: use `CheckboxGroup` or `TagGroup`.
- Renders: FieldMessages, Label
