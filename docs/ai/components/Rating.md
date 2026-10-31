# Rating

> A read-only star rating. It is a single image (`role="img"`) with a text alternative such
> as "3.5 out of 5 stars"; the stars themselves are decorative. Half stars are supported.

It does not accept input. An interactive rating needs radio-group semantics and is not part
of the design system yet.

A read-only star rating, such as a review score. One image with a text alternative ("3.5 out of 5 stars"); half stars are supported.

- Handoff source: `components/display/Rating` (TODO `CMP-DSP-06`).

- Import: `import { Rating } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Rating/Rating.tsx`
- Stories (Storybook title `Components/Rating`): Default, HalfStar, Empty, Full, WithValue, Sizes, CustomScale, OutOfRange, RightToLeft

## Props

| Prop        | Type                                                                            | Required | Default | Description                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`     | `number`                                                                        | yes      |         | The rating to show, from 0 to `max`. Values are clamped and rounded to the nearest half star ("3.7" shows three and a half stars, and says "3.5 out of 5 stars"). |
| `max`       | `number`                                                                        |          | `5`     | Number of stars. A whole number from 1. Default `5`.                                                                                                              |
| `size`      | `'sm' \| 'md' \| 'lg'`                                                          |          | `'md'`  | Star size token: `sm` 12px, `md` 14px (default), `lg` 18px.                                                                                                       |
| `showValue` | `boolean`                                                                       |          | `false` | Also shows the value as text ("3.5/5") after the stars. Hidden from assistive technology: the name already says it.                                               |
| `messages`  | `Partial<{ label: (value: string, max: string, maxCount: number) => string; }>` |          |         | Override the built-in messages for this instance.                                                                                                                 |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Rating: { ... } }}>`.

| Key                                                   | English default              | Notes                                                                          |
| ----------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `label(value: string, max: string, maxCount: number)` | `{value} out of {max} stars` | Accessible name of the rating. Arguments are already formatted for the locale. |

## Design tokens used

`--ds-font-mono`, `--ds-fs-label`, `--ds-lh-label`, `--ds-line-control`, `--ds-rating-fill`, `--ds-rating-gap`, `--ds-rating-star-gap`, `--ds-text-2`, `--ds-warning`, `--ds-weight-medium`

## When to use

- Show a score someone else gave (a review, a quality grade).
- Next to the review text in lists and cards, optionally with the numeric value.

## When not to use

- To collect a rating: it takes no input. An interactive rating needs radio-group semantics (one tab stop, arrows, `Space`) and is out of scope for now; use `SegmentedControl` or `RadioGroup` with labelled options meanwhile.
- For an average with a distribution or a trend: use `Chart` or `ProportionBar`.

## Anatomy

```
span[role=img][aria-label="3.5 out of 5 stars"]
  stars (aria-hidden)
    star x max      empty glyph + clipped filled glyph (0, 50 or 100 %)
  value             optional "3.5/5" (aria-hidden)
```

## Accessibility

- `role="img"` with an `aria-label` from messages; the glyphs and the visible value are `aria-hidden`, so the rating is announced once.
- The label is pluralized by the scale (`1 out of 1 star`, `3.5 out of 5 stars`) and numbers follow the locale (`3,5 de 5 estrelas` in pt-BR).
- The value is not carried by color alone: the label and the optional value text state the number. The empty star uses `--ds-line-control` (3:1 against the surfaces); filled uses `--ds-warning`.
- Forced colors: filled stars use `CanvasText`, empty ones `GrayText`.

## Content rules

- Show the number next to the stars when the exact value matters; stars alone are fine in dense lists.
- Pair a rating with the review it belongs to; do not leave it alone in a row of badges.

## Examples

```tsx
<Rating value={4} />
<Rating value={3.5} showValue size="lg" />
<Rating value={7} max={10} />
```

## Related components

- Instead, see SegmentedControl: To collect a rating: it takes no input. An interactive rating needs radio-group semantics (one tab stop, arrows, `Space`) and is out of scope for now; use `SegmentedControl` or `RadioGroup` with labelled options meanwhile.
- Instead, see RadioGroup: To collect a rating: it takes no input. An interactive rating needs radio-group semantics (one tab stop, arrows, `Space`) and is out of scope for now; use `SegmentedControl` or `RadioGroup` with labelled options meanwhile.
- Instead, see Chart: For an average with a distribution or a trend: use `Chart` or `ProportionBar`.
- Instead, see ProportionBar: For an average with a distribution or a trend: use `Chart` or `ProportionBar`.
- Renders: Icon
- Used by: ApprovalCard
