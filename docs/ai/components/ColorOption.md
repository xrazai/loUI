# ColorOption

> A selectable option that shows a color swatch and its name. It is a toggle button
> (`aria-pressed`), so each option is chosen independently: put several in a
> `role="group"` with an accessible name to pick any number of colors.
> `isSelected` / `defaultSelected` / `onChange(isSelected)` follow React Aria.

Why a toggle and not a radio: the handoff uses it to pick several colors (a product's
available colors). To pick exactly one color, use `ChoiceTiles` or `RadioGroup` instead.

A selectable option that shows a color swatch and the color's name, with an optional short mark. It is a toggle button: each option is chosen on its own. Import it from `loui-ds/patterns`.

- Handoff source: `components/erp/ColorOption.jsx` (TODO `CMP-PAT-04`).

- Import: `import { ColorOption } from 'loui-ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/ColorOption/ColorOption.tsx`
- Stories (Storybook title `Patterns/ColorOption`): Default, Selected, WithMark, SelectedWithMark, Disabled, DisabledSelected, LongLabel, LightColor, DarkColor, InAGroup, KeyboardToggle, RightToLeft, Focused, Default, Preselected, WithDescription, DisabledItem, DisabledGroup, Invalid, SingleSelection, Controlled, LongLabels, SingleColumn, Portuguese, RightToLeft, KeyboardRoving

## Props

| Prop        | Type                     | Required | Default | Description                                                                                                                                                                         |
| ----------- | ------------------------ | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`     | `string`                 | yes      |         | The color to show, as `#rgb` or `#rrggbb`.                                                                                                                                          |
| `label`     | `string`                 | yes      |         | Name of the color ("Navy"). It is the accessible name of the option and is always visible.                                                                                          |
| `mark`      | `ReactNode`              |          |         | Optional short text after the label (a count, "Default", a code). It is part of the accessible name. While the option is selected and no `mark` is given, a check is shown instead. |
| `className` | `string`                 |          |         | Class name for the button.                                                                                                                                                          |
| `ref`       | `Ref<HTMLButtonElement>` |          |         | Ref to the underlying `<button>`.                                                                                                                                                   |

### Inherited props

- From `AriaBaseButtonProps` (react-aria): `aria-controls`, `aria-disabled`, `aria-expanded`, `aria-haspopup`, `preventFocusOnPress`
- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `ButtonProps` (react-aria): `isDisabled`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `HoverEvents` (@react-types/shared): `onHoverChange`, `onHoverEnd`, `onHoverStart`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `PressEvents` (@react-types/shared): `onClick`, `onPress`, `onPressChange`, `onPressEnd`, `onPressStart`, `onPressUp`
- From `SlotProps` (react-aria-components): `slot`
- From `ToggleButtonProps` (react-aria-components): `id`
- From `ToggleButtonProps` (react-aria): `defaultSelected`, `isSelected`, `onChange`
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
- Renders: Icon, Swatch
