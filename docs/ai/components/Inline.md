# Inline

> Lays its children out in a horizontal row with a consistent gap. It wraps by default.
> Direction follows the writing mode, so it mirrors in right-to-left languages.

A horizontal row of children with one consistent gap. It wraps by default, so a row never overflows a narrow screen.

- Import: `import { Inline } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Inline/Inline.tsx`
- Stories (Storybook title `Layout/Inline`): Default, LargeGap, JustifyBetween, JustifyEnd, AlignBaseline, Wrapping, NoWrap, AsList, RightToLeft

## Props

| Prop      | Type                                                                                                                      | Required | Default    | Description                                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `gap`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 12 \| 16 \| '1' \| '2' \| '3' \| '4' \| '5' \| '6' \| '8' \| '12' \| '16'`            |          | `2`        | Space between children, as a key of the space scale, a number or its string form (`2` = `--ds-space-2` = 8px). Default `2`.                                        |
| `align`   | `'center' \| 'start' \| 'end' \| 'baseline' \| 'stretch'`                                                                 |          | `'center'` | Cross-axis (vertical) alignment. Default `center`.                                                                                                                 |
| `justify` | `'center' \| 'start' \| 'end' \| 'between'`                                                                               |          | `'start'`  | Main-axis (horizontal) distribution. `between` pushes the first and last child to the edges. Default `start`.                                                      |
| `wrap`    | `boolean`                                                                                                                 |          | `true`     | Whether children wrap onto the next line when they do not fit. Default `true`, so a row never overflows a narrow screen.                                           |
| `as`      | `'div' \| 'article' \| 'aside' \| 'footer' \| 'form' \| 'header' \| 'li' \| 'main' \| 'nav' \| 'ol' \| 'section' \| 'ul'` |          | `'div'`    | Element to render, `div` by default. Use `ul` or `ol` for a list of `li` children: the list reset is applied and `role="list"` keeps the list semantics in Safari. |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-inline-gap`, `--ds-space-2`

## When to use

- Buttons in a footer, chips, a number and its caption, a toolbar of controls.
- Anything that should flow left to right (right to left in RTL) and wrap when out of room.

## When not to use

- For a column: use `Stack`.
- For equal columns that must line up across rows: use `Grid`.
- For a form row where fields share the width: use `Grid` with `columns`.

## Anatomy

```
div (flex row, wrap, gap)
  children
```

## Accessibility

- No semantics of its own: choose `as` for meaning.
- Source order is visual order, so keyboard and reading order match. Do not reorder children with CSS.
- Wrapping keeps content reachable at 320px and 200% zoom (WCAG 1.4.10 reflow).
- Direction follows the writing mode, so the row mirrors in RTL.

## Content rules

- Put the primary action last in a footer row (`justify="end"`), after the secondary action.

## Examples

```tsx
<Inline justify="end">
  <Button>Cancel</Button>
  <Button variant="primary">Save changes</Button>
</Inline>

<Inline gap={3} align="baseline">
  <Text size="body" mono>1,240</Text>
  <Text tone="secondary">orders this month</Text>
</Inline>
```

## Related components

- Instead, see Stack: For a column: use `Stack`.
- Instead, see Grid: For equal columns that must line up across rows: use `Grid`.
