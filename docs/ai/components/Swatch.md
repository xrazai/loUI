# Swatch

> A small circle filled with a color, with a subtle inset ring so dark colors stay visible on
> dark surfaces. It needs either a `label` (the color's name) or `decorative`, so the color is
> never the only carrier of meaning.

Built as a plain element rather than React Aria `ColorSwatch`: that one paints an inline
`background` and names itself with a generated description ("vibrant blue"), while this one
sets only the `--ds-swatch-color` custom property and uses the name you give it.

A small circle filled with a color, with a subtle inset ring so dark colors stay visible on dark surfaces. It shows a color; it never names it, so every swatch is either labelled or explicitly decorative.

- Handoff source: `components/erp/Swatch.jsx` (TODO `CMP-PAT-03`).

- Import: `import { Swatch } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Swatch/Swatch.tsx`
- Stories (Storybook title `Components/Swatch`): Default, Sizes, ExtremeColors, Decorative, ShortHex

## Props

| Prop         | Type                   | Required | Default | Description                                                                                                                                                                        |
| ------------ | ---------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`      | `string`               | yes      |         | The color to show, as `#rgb` or `#rrggbb`. Anything else throws in development and renders an empty circle in production.                                                          |
| `label`      | `string`               |          |         | Name of the color ("Navy"). Required whenever the swatch is the only thing that identifies the color: a color on its own says nothing to a screen reader or to a color-blind user. |
| `decorative` | `true`                 |          |         | Hides the swatch from assistive technology. Use it only when the color is also named by adjacent text (a table cell, an option label).                                             |
| `size`       | `'sm' \| 'md' \| 'lg'` |          | `'md'`  | Diameter token: `sm` 16px, `md` 20px (default), `lg` 32px.                                                                                                                         |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Design tokens used

`--ds-line-control`, `--ds-radius-pill`, `--ds-swatch-color`, `--ds-swatch-ring`, `--ds-swatch-size-lg`, `--ds-swatch-size-md`, `--ds-swatch-size-sm`

## When to use

- Next to the name of a color, tag or category (a legend, a table cell, an option).
- On its own, with a `label`, when the color is the whole content (a color chip in a toolbar).

## When not to use

- To carry a status: use `Badge` (text plus tone).
- To pick a color: use `ColorOption` from `loui-ds/patterns`.
- For arbitrary CSS colors (`rgb()`, names): only `#rgb` and `#rrggbb` are accepted.

## Anatomy

```
span[role=img] aria-label="Navy"        (labelled)
span[aria-hidden]                        (decorative)
  background: var(--ds-swatch-color)
  inset ring: var(--ds-swatch-ring)
```

## Accessibility

- A color on its own is not information: it is invisible to screen readers and ambiguous for color-blind users, hence the required `label` or `decorative`.
- Labelled swatches are `role="img"`. Decorative ones are `aria-hidden`.
- The inset ring uses `--ds-swatch-ring`, a low-contrast outline that keeps near-black swatches visible. It is not a boundary meant to reach 3:1: the name next to or on the swatch is what identifies it.
- Forced colors: `forced-color-adjust: none` keeps the fill, and a `ButtonText` border is added.

## Content rules

- Labels are plain color names in sentence case ("Navy", "Brick red"), not hex codes.

## Examples

```tsx
<Swatch color="#1f3a93" label="Navy" />

<span>
  <Swatch color="#c0392b" decorative size="sm" /> Brick red
</span>
```

## Related components

- Instead, see Badge: To carry a status: use `Badge` (text plus tone).
- Instead, see ColorOption: To pick a color: use `ColorOption` from `loui-ds/patterns`.
- Used by: ApprovalCard, ColorOption, MatrixGrid, RankList
