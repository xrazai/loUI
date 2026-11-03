# Inline

Status: experimental

A horizontal row of children with one consistent gap. It wraps by default, so a row never overflows a narrow screen.

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

## Props

| Prop      | Type                                                                          | Default    | Notes                                                            |
| --------- | ----------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| `gap`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 12 \| 16` or the same as a string (`"4"`) | `2`        | Space token key (8px by default)                                 |
| `align`   | `'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch'`                     | `'center'` | Vertical alignment. Use `baseline` for a number beside its label |
| `justify` | `'start' \| 'center' \| 'end' \| 'between'`                                   | `'start'`  | `between` pushes the first and last child to the edges           |
| `wrap`    | `boolean`                                                                     | `true`     | Turn off only for short, fixed rows                              |
| `as`      | `'div' \| 'section' \| 'ul' \| 'ol' …`                                        | `'div'`    | Lists get the reset and `role="list"`                            |

Other `div` attributes and `ref` go to the root.

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

## Differences from the handoff

- Replaces ad hoc inline-flex styles with a typed component using space tokens.
