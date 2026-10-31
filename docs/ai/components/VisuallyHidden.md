# VisuallyHidden

> Hides content visually while keeping it available to assistive technology.
> Use it for text alternatives that sighted users do not need.

- Import: `import { VisuallyHidden } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/VisuallyHidden/VisuallyHidden.tsx`
- Stories (Storybook title `Primitives/VisuallyHidden`): Default, AsHeading

## Props

| Prop | Type          | Required | Default | Description                            |
| ---- | ------------- | -------- | ------- | -------------------------------------- |
| `as` | `ElementType` |          | `span`  | Element to render. Defaults to `span`. |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Related components

- Used by: Alert, Kbd, Link, Textarea
