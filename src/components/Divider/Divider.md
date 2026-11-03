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

| Prop          | Type                                            | Default        | Notes                                                                                                                                                       |
| ------------- | ----------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'`                    | `'horizontal'` | Vertical needs a parent with a height (it stretches in a flex row)                                                                                          |
| `variant`     | `'subtle' \| 'default' \| 'strong' \| 'dashed'` | `'default'`    | `--ds-line-subtle` (internal), `--ds-line` (cards, sections), `--ds-line-strong`; `dashed` is a dashed `--ds-line-strong` rule for a total row or tear line |

React Aria separator props (`aria-label`, …) and `ref` pass through.

## Accessibility

- Rendered by React Aria: a horizontal divider is an `<hr>`; a vertical one has `role="separator"` and `aria-orientation="vertical"`.
- It is a thematic break for assistive technology, so do not use it as a pure visual rule between unrelated things.
- Line colors are borders, not text; `forced-colors` paints them with `CanvasText`.

## Dashed rule

`variant="dashed"` is the "total row" rule of AGENTS.md section 7: a 1px dashed line in `--ds-line-strong`, for the line above a total or a tear line on a receipt preview. It works on the dark surfaces and inside the paper scope (`data-theme="paper"`, where the line becomes the paper rule). In `forced-colors` it is drawn with `CanvasText`. Like the other variants it is a decorative border, not a text or control boundary.

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

- The handoff drew dividers with `border-top` on a wrapper; this is a real separator with three line weights from tokens plus a dashed rule.
