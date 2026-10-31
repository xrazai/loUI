# Rating

Status: experimental

A read-only star rating, such as a review score. One image with a text alternative ("3.5 out of 5 stars"); half stars are supported.

- Handoff source: `components/display/Rating` (TODO `CMP-DSP-06`).

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

## Props

| Prop        | Type                   | Default  | Notes                                                         |
| ----------- | ---------------------- | -------- | ------------------------------------------------------------- |
| `value`     | `number`               | required | Clamped to `0..max`, rounded to the nearest half star.        |
| `max`       | `number`               | `5`      | Number of stars (whole number, at least 1).                   |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'`   | Star size: 12, 14 and 18 px (icon tokens).                    |
| `showValue` | `boolean`              | `false`  | Adds "3.5/5" in mono text after the stars.                    |
| `messages`  | `{ label }`            |          | Override the accessible name (`label(value, max, maxCount)`). |

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

## Differences from the handoff

- Half stars are displayed (the handoff rounded to whole stars).
- The label comes from messages, is pluralized and localized (it was hard-coded pt-BR).
- Stars are the bundled Lucide `Star` icon drawn with a CSS fill, not the text glyph; sizes are icon tokens.
- Documented decision: read-only. Interactive rating is a separate future component.
- Filled icons are normally avoided (AGENTS.md section 7); the star is the one exception because filled versus empty is the meaning.
