# Swatch

Status: experimental

A small circle filled with a color, with a subtle inset ring so dark colors stay visible on dark surfaces. It shows a color; it never names it, so every swatch is either labelled or explicitly decorative.

- Handoff source: `components/erp/Swatch.jsx` (TODO `CMP-PAT-03`).

## When to use

- Next to the name of a color, tag or category (a legend, a table cell, an option).
- On its own, with a `label`, when the color is the whole content (a color chip in a toolbar).

## When not to use

- To carry a status: use `Badge` (text plus tone).
- To pick a color: use `ColorOption` from `@loui/ds/patterns`.
- For arbitrary CSS colors (`rgb()`, names): only `#rgb` and `#rrggbb` are accepted.

## Anatomy

```
span[role=img] aria-label="Navy"        (labelled)
span[aria-hidden]                        (decorative)
  background: var(--ds-swatch-color)
  inset ring: var(--ds-swatch-ring)
```

## Props

| Prop         | Type                   | Default  | Notes                                                                |
| ------------ | ---------------------- | -------- | -------------------------------------------------------------------- |
| `color`      | `string`               | required | `#rgb` or `#rrggbb`. Invalid values throw in development.            |
| `label`      | `string`               | -        | Name of the color. Required unless `decorative`.                     |
| `decorative` | `true`                 | -        | Hides the swatch from assistive technology. Use only next to a name. |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`   | 16px, 20px or 32px (`--ds-swatch-size-*`).                           |

The types make `label` and `decorative` mutually exclusive and require one of them.

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

## Differences from the handoff

- `label` or `decorative` is required (the handoff had neither by default and used `title`, a mouse-only tooltip).
- The color is applied through the `--ds-swatch-color` custom property, never as an inline `background` (ADR-0002 amendment). The inset ring is a token (`--ds-swatch-ring`) instead of `rgba(255,255,255,.12)`.
- The hex value is validated: development throws a `RangeError`, production renders an empty dashed circle.
- Sizes are tokens (`sm`/`md`/`lg`) instead of a free pixel number.
- React Aria `ColorSwatch` was evaluated and not used: it paints an inline `background` and names itself with a generated color description ("vibrant blue") that cannot be replaced by the product's own name.
