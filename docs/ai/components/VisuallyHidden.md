# VisuallyHidden

> Hides content visually while keeping it available to assistive technology.
> Use it for text alternatives that sighted users do not need.

Hides content visually while keeping it in the accessibility tree. It renders a `span` (or the element given by `as`) with the standard "screen reader only" clipping, so the text is read aloud and found by assistive technology but takes no space on screen.

- Import: `import { VisuallyHidden } from 'loui-ds';`
- Status: stable
- Source: `src/components/VisuallyHidden/VisuallyHidden.tsx`
- Stories (Storybook title `Primitives/VisuallyHidden`): Default, AsHeading

## Props

| Prop | Type          | Required | Default | Description                            |
| ---- | ------------- | -------- | ------- | -------------------------------------- |
| `as` | `ElementType` |          | `span`  | Element to render. Defaults to `span`. |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## When to use

- A text alternative for an icon-only control when a `label` prop is not available (for example the name of a custom control).
- A heading or landmark label that sighted users do not need because the layout already implies it.
- Extra context for a repeated link or button ("Edit" followed by a hidden "order ORD-1048").

## When not to use

- To hide content from everyone: use the `hidden` attribute or conditional rendering.
- To hide content from assistive technology only: use `aria-hidden="true"`.
- For a skip link that appears on focus: use `SkipLink`.
- For text that sighted keyboard users need to see: render it visibly.

## Anatomy

```
span.root   (or as="h2", "div", ...)
  clip: rect(0 0 0 0); position: absolute; 1px box; overflow: hidden
```

## Accessibility

- The content stays in the accessibility tree and in the reading order; place it where it should be read.
- Do not put interactive elements inside: a focusable element that cannot be seen is a focus-visibility failure (WCAG 2.4.7).
- Write the text as you would write visible copy: sentence case, no emoji, no decorative punctuation.

## Content rules

- Keep it short and specific ("Close dialog", not "Click here to close the dialog window").
- Do not repeat what the visible label already says.

## Examples

```tsx
<button type="button">
  <span aria-hidden="true">x</span>
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>

<VisuallyHidden as="h2">Order summary</VisuallyHidden>
```

## Related components

- Instead, see SkipLink: For a skip link that appears on focus: use `SkipLink`.
- Used by: ActionList, Alert, ApprovalCard, Banner, Chart, ChatPanel, CommandPalette, DataTable, FileUpload, Kbd, Legend, Link, MatrixGrid, NavItem, ResponseFeedback, SegmentedControl, ShortcutsHelp, StackedBar, StatusSteps, Stepper, Tab, TabList, TabPanel, Tabs, Textarea, Timeline, ToastRegion, ToolCallStep
