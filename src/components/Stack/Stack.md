# Stack

Status: experimental

A vertical column of children with one consistent gap. The gap is a key of the space scale, never a pixel value.

## When to use

- Stack blocks of content, fields or cards with the same rhythm.
- A list of items with a uniform gap (`as="ul"`).

## When not to use

- For a row of items: use `Inline`.
- For a grid of equal cells: use `Grid`.
- To space one pair of elements apart once: a margin from the parent is simpler. Use the layout components for repeated structure.

## Anatomy

```
div (flex column, gap)
  children
```

## Props

| Prop    | Type                                                | Default     | Notes                                                       |
| ------- | --------------------------------------------------- | ----------- | ----------------------------------------------------------- |
| `gap`   | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 12 \| 16`       | `4`         | Space token key: 4, 8, 12, 16, 20, 24, 32, 48, 64 px        |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'`         | `'stretch'` | Horizontal alignment of the children                        |
| `as`    | `'div' \| 'section' \| 'article' \| 'ul' \| 'ol' …` | `'div'`     | `ul` and `ol` get the list reset and `role="list"` (Safari) |

Other `div` attributes and `ref` go to the root. The gap travels as the custom property `--ds-stack-gap` (ADR-0002 amendment); a consumer `style` is kept.

## Accessibility

- A `div` Stack adds no semantics. Choose `as` for the meaning: `ul`/`ol` for lists, `section` with a label for a region.
- `list-style: none` removes list semantics in Safari/VoiceOver, so lists get an explicit `role="list"`.
- Children can shrink below their content width (`min-inline-size: 0`), so long text wraps instead of overflowing at 320px.
- Direction-neutral: `start` and `end` follow the writing direction.

## Content rules

- None. Stack holds whatever its children are.

## Examples

```tsx
<Stack gap={6}>
  <Heading level={2}>Account</Heading>
  <Stack gap={3}>
    <Input label="Name" />
    <Input label="Email" />
  </Stack>
</Stack>

<Stack as="ul" gap={2}>
  <li>Orders</li>
  <li>Customers</li>
</Stack>
```

## Differences from the handoff

- The handoff had no layout primitives; screens used inline `display: flex` styles with raw pixel gaps. Gaps are now token keys, typed, with no raw pixels.
