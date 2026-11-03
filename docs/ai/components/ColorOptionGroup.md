# ColorOptionGroup

> A named group of `ColorOption`s that shares one value: the list of chosen option `id`s. It
> adds the group name (`label`, `aria-label` or `aria-labelledby`), helper text, an error linked
> with `aria-describedby`, per-option `isDisabled` (set it on the `ColorOption`) and one tab
> stop with arrow keys between options (they stop at the ends, like `ToggleGroup`). `Space` and
> `Enter` choose the focused option.

List the options alphabetically by label (AGENTS.md 5b); the group keeps the order you give.
Built on React Aria `ToggleButtonGroup`.

A selectable option that shows a color swatch and the color's name, with an optional short mark. It is a toggle button: each option is chosen on its own. Import it from `loui-ds/patterns`.

- Handoff source: `components/erp/ColorOption.jsx` (TODO `CMP-PAT-04`).

- Import: `import { ColorOptionGroup } from 'loui-ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/ColorOption/ColorOptionGroup.tsx`
- Stories (Storybook title `Patterns/ColorOption`): Default, Selected, WithMark, SelectedWithMark, Disabled, DisabledSelected, LongLabel, LightColor, DarkColor, InAGroup, KeyboardToggle, RightToLeft, Focused, Default, Preselected, WithDescription, DisabledItem, DisabledGroup, Invalid, SingleSelection, Controlled, LongLabels, SingleColumn, Portuguese, RightToLeft, KeyboardRoving

## Props

| Prop              | Type                        | Required | Default      | Description                                                                                                                                                                 |
| ----------------- | --------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`        | `ReactNode`                 | yes      |              | The `ColorOption` children. Each needs an `id` that is unique in the group (its value).                                                                                     |
| `selectionMode`   | `'single' \| 'multiple'`    |          | `'multiple'` | `multiple` (default): any number of colors can be chosen (the group is a `toolbar` of toggle buttons). `single`: at most one color (a `radiogroup`).                        |
| `value`           | `readonly string[]`         |          |              | The `id`s of the chosen options (controlled). Pair with `onChange`.                                                                                                         |
| `defaultValue`    | `readonly string[]`         |          |              | The `id`s of the options chosen at the start (uncontrolled).                                                                                                                |
| `onChange`        | `(value: string[]) => void` |          |              | Called with the `id`s of all chosen options after the user chooses or clears one.                                                                                           |
| `description`     | `ReactNode`                 |          |              | Helper text under the options. Linked with `aria-describedby`.                                                                                                              |
| `errorMessage`    | `FieldErrorMessage`         |          |              | Error text, shown while `isInvalid` is set. Linked with `aria-describedby`.                                                                                                 |
| `isInvalid`       | `boolean`                   |          | `false`      | Marks the group invalid: danger border on the unselected options and the error text.                                                                                        |
| `columns`         | `number`                    |          | `2`          | Maximum number of columns. Default `2`. The grid collapses to fewer columns on narrow containers so an option never gets narrower than `--ds-color-option-group-min-width`. |
| `className`       | `string`                    |          |              | Class name for the group root.                                                                                                                                              |
| `ref`             | `Ref<HTMLDivElement>`       |          |              | Ref to the element that holds the options.                                                                                                                                  |
| `label`           | `ReactNode`                 |          |              | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                         |
| `aria-label`      | `string`                    |          |              | Accessible name when there is no visible label (for example a search box with an icon).                                                                                     |
| `aria-labelledby` | `string`                    |          |              | Id of the element that names the field.                                                                                                                                     |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-details`
- From `ToggleGroupProps` (react-stately): `isDisabled`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-accent-soft`, `--ds-bg`, `--ds-color-option-group-columns`, `--ds-color-option-group-gap`, `--ds-color-option-group-min-width`, `--ds-control-h-md`, `--ds-danger`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-sans`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-lh-meta`, `--ds-lh-small`, `--ds-line-control`, `--ds-opacity-disabled`, `--ds-radius-md`, `--ds-space-3`, `--ds-text`, `--ds-text-2`, `--ds-text-3`

## When to use

- Choose any number of colors from a list: the colors available for an item, the colors to filter by.
- When the color name must be visible next to the swatch.

## When not to use

- To choose exactly one color: use `ChoiceTiles` or `RadioGroup` (radio semantics).
- A free-form color input: use a color field.
- To display a color with no interaction: use `Swatch`.

## Semantics decision: toggle, not radio

The option exposes `aria-pressed` (a toggle button), not a radio. The handoff uses it for multi-select ("which colors does this item come in?"), and a radio group would force a single answer and a roving tab stop. React Aria `ColorSwatchPicker` was evaluated and does not fit: it is a single-select listbox of bare swatches with generated color names and no room for a visible label or mark. For single choice, use `ChoiceTiles`.

Group several options with `ColorOptionGroup` (a named group with a shared `value`, error text and roving arrow keys, see `ColorOptionGroup.md`). Outside a group every option is its own tab stop.

## Anatomy

```
button[aria-pressed]
  Swatch (decorative)
  label
  mark | check            (mark text if given, otherwise a check while selected)
```

## Accessibility

- `aria-pressed` states the selection; the selected look is also a doubled accent border, a soft fill and a check (not color alone).
- The swatch is decorative because the label names the color.
- Boundaries use `--ds-line-control` (3:1); hover brightens the border, never the fill. Focus: accent border and ring. Forced colors: `Highlight` border when selected.

## Content rules

- Label is the color name in sentence case ("Brick red"); `mark` is two or three words at most.

## Examples

```tsx
<div role="group" aria-label="Available colors">
  <ColorOption color="#1f3a93" label="Navy" isSelected={on.navy} onChange={set('navy')} />
  <ColorOption color="#c0392b" label="Brick red" mark="12 left" />
</div>
```

## Related components

- Instead, see ChoiceTiles: To choose exactly one color: use `ChoiceTiles` or `RadioGroup` (radio semantics).
- Instead, see RadioGroup: To choose exactly one color: use `ChoiceTiles` or `RadioGroup` (radio semantics).
- Instead, see Swatch: To display a color with no interaction: use `Swatch`.
- Renders: ErrorText, Label
