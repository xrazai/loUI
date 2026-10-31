# Divider

Status: experimental

A 1px line that separates groups of content. Built on React Aria `Separator`.

## When to use

- Between sections of a panel or a menu-like list where the topic changes.
- Vertically, between inline groups in a toolbar.

## When not to use

- To separate closely related items: use spacing.
- Around every field or row: borders-first hierarchy comes from surfaces, not a line between everything.
- To wrap a Card in a Card: use a divider inside one card instead.

## Anatomy

```
hr (1px line)          horizontal
div[role=separator]    vertical, with aria-orientation
```

## Props

| Prop          | Type                                | Default        | Notes                                                                            |
| ------------- | ----------------------------------- | -------------- | -------------------------------------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'`        | `'horizontal'` | Vertical needs a parent with a height (it stretches in a flex row)               |
| `variant`     | `'subtle' \| 'default' \| 'strong'` | `'default'`    | `--ds-line-subtle` (internal), `--ds-line` (cards, sections), `--ds-line-strong` |

React Aria separator props (`aria-label`, …) and `ref` pass through.

## Accessibility

- Rendered by React Aria: a horizontal divider is an `<hr>`; a vertical one has `role="separator"` and `aria-orientation="vertical"`.
- It is a thematic break for assistive technology, so do not use it as a pure visual rule between unrelated things.
- Line colors are borders, not text; `forced-colors` paints them with `CanvasText`.

## Examples

```tsx
<Stack gap={4}>
  <Section />
  <Divider />
  <Section />
</Stack>

<Inline>
  <Button>Bold</Button>
  <Divider orientation="vertical" />
  <Button>Link</Button>
</Inline>
```

## Differences from the handoff

- The handoff drew dividers with `border-top` on a wrapper; this is a real separator with three line weights from tokens.
