# Stack

> Lays its children out in a vertical column with a consistent gap. The gap is a space token
> key, never a pixel value. Children can shrink below their content width (`min-inline-size: 0`).

A vertical column of children with one consistent gap. The gap is a key of the space scale, never a pixel value.

- Import: `import { Stack } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Stack/Stack.tsx`
- Stories (Storybook title `Layout/Stack`): Default, SmallGap, LargeGap, AlignStart, AlignCenter, AlignEnd, AsList, LongText, RightToLeft

## Props

| Prop    | Type                                                                                                                      | Required | Default     | Description                                                                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `gap`   | `'1' \| '2' \| '3' \| '4' \| '5' \| '6' \| '8' \| '12' \| '16'`                                                           |          | `'4'`       | Space between children, as a key of the space scale (`4` = `--ds-space-4` = 16px). Default `4`.                                                                    |
| `align` | `'center' \| 'start' \| 'end' \| 'stretch'`                                                                               |          | `'stretch'` | Cross-axis (horizontal) alignment of the children. Default `stretch`.                                                                                              |
| `as`    | `'div' \| 'article' \| 'aside' \| 'footer' \| 'form' \| 'header' \| 'li' \| 'main' \| 'nav' \| 'ol' \| 'section' \| 'ul'` |          | `'div'`     | Element to render, `div` by default. Use `ul` or `ol` for a list of `li` children: the list reset is applied and `role="list"` keeps the list semantics in Safari. |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-space-4`, `--ds-stack-gap`

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

## Related components

- Instead, see Inline: For a row of items: use `Inline`.
- Instead, see Grid: For a grid of equal cells: use `Grid`.
