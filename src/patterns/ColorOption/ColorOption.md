# ColorOption

Status: experimental

A selectable option that shows a color swatch and the color's name, with an optional short mark. It is a toggle button: each option is chosen on its own. Import it from `@loui/ds/patterns`.

- Handoff source: `components/erp/ColorOption.jsx` (TODO `CMP-PAT-04`).

## When to use

- Choose any number of colors from a list: the colors available for an item, the colors to filter by.
- When the color name must be visible next to the swatch.

## When not to use

- To choose exactly one color: use `ChoiceTiles` or `RadioGroup` (radio semantics).
- A free-form color input: use a color field.
- To display a color with no interaction: use `Swatch`.

## Semantics decision: toggle, not radio

The option exposes `aria-pressed` (a toggle button), not a radio. The handoff uses it for multi-select ("which colors does this item come in?"), and a radio group would force a single answer and a roving tab stop. React Aria `ColorSwatchPicker` was evaluated and does not fit: it is a single-select listbox of bare swatches with generated color names and no room for a visible label or mark. For single choice, use `ChoiceTiles`.

Group several options in `role="group"` with an `aria-label` ("Available colors"); every option is its own tab stop.

## Anatomy

```
button[aria-pressed]
  Swatch (decorative)
  label
  mark | check            (mark text if given, otherwise a check while selected)
```

## Props

| Prop                                          | Type                       | Default  | Notes                                                    |
| --------------------------------------------- | -------------------------- | -------- | -------------------------------------------------------- |
| `color`                                       | `string`                   | required | `#rgb` or `#rrggbb`.                                     |
| `label`                                       | `string`                   | required | Visible name; accessible name of the button.             |
| `mark`                                        | `ReactNode`                | none     | Short text after the label. Part of the accessible name. |
| `isSelected` / `defaultSelected` / `onChange` | `boolean` / `(on) => void` | `false`  | React Aria names.                                        |
| `isDisabled`                                  | `boolean`                  | `false`  | Disabled opacity token and a dashed border.              |

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

## Differences from the handoff

- Built on React Aria `ToggleButton` (hover, press, focus and keyboard from RAC); no React hover state or inline styles.
- The swatch is decorative; the disabled opacity is `--ds-opacity-disabled` (handoff 0.45); the border is `--ds-line-control` instead of `--ds-line`.
- `selected` / `disabled` / `onClick` became `isSelected` / `isDisabled` / `onChange(isSelected)`. The mark ("✓" glyph) is an icon while selected, or your own `mark` text.
