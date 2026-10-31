# Divider

> A 1px line that separates groups of content, built on React Aria `Separator`
> (`<hr>`, or `role="separator"` with `aria-orientation` when vertical). Prefer spacing to
> separate related things; use a divider where the content changes topic.

A 1px line that separates groups of content. Built on React Aria `Separator`.

- Import: `import { Divider } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Divider/Divider.tsx`
- Stories (Storybook title `Layout/Divider`): Default, Subtle, Strong, Vertical, Weights

## Props

| Prop          | Type                                | Required | Default        | Description                                                                                                                                                                                                    |
| ------------- | ----------------------------------- | -------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'`        |          | `'horizontal'` | `horizontal` (default) separates stacked content; `vertical` separates items in a row and needs a parent with a height.                                                                                        |
| `variant`     | `'subtle' \| 'default' \| 'strong'` |          | `'default'`    | Line weight by token: `subtle` (`--ds-line-subtle`, internal dividers), `default` (`--ds-line`, between cards and sections) or `strong` (`--ds-line-strong`, around controls and overlays). Default `default`. |
| `className`   | `string`                            |          |                |                                                                                                                                                                                                                |
| `ref`         | `Ref<HTMLElement>`                  |          |                | Ref to the separator element.                                                                                                                                                                                  |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `DOMProps` (@react-types/shared): `id`
- From `SeparatorProps` (react-aria): `elementType`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `variant`: `subtle`, `default`, `strong`

## Design tokens used

`--ds-line`, `--ds-line-strong`, `--ds-line-subtle`

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
