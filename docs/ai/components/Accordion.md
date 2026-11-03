# Accordion

> A stack of sections that expand and collapse. Each header is a heading that wraps a real
> button (`aria-expanded`, `aria-controls`), so it appears in the page outline and works with
> `Enter` and `Space`. Built on React Aria `DisclosureGroup`.

Use it to shorten a long page of related, optional content (FAQs, settings groups). Do not
hide content people need to finish their task.

A stack of sections that expand and collapse. Each header is a heading that wraps a real button. Built on React Aria `DisclosureGroup`, `Disclosure` and `DisclosurePanel`.

- Handoff source: `components/layout/Accordion.jsx` (TODO `CMP-LAY-04`).

- Import: `import { Accordion } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Accordion/Accordion.tsx`
- Stories (Storybook title `Components/Accordion`): Default, Plain, InitiallyExpanded, KeyboardSingle, Multiple, DisabledItem, HeadingLevel2, Controlled, LongText, RightToLeft, Focused

## Props

| Prop           | Type                        | Required | Default      | Description                                                                                                                                   |
| -------------- | --------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`        | `readonly AccordionItem[]`  | yes      |              | The sections, in order.                                                                                                                       |
| `multiple`     | `boolean`                   |          | `false`      | Allow several sections open at once. By default opening one section closes the others (single expansion).                                     |
| `value`        | `readonly string[]`         |          |              | Values of the expanded items (controlled).                                                                                                    |
| `defaultValue` | `readonly string[]`         |          | `[]`         | Values of the items expanded at first (uncontrolled).                                                                                         |
| `onChange`     | `(value: string[]) => void` |          |              | Called with the values of all expanded items after the user toggles one.                                                                      |
| `variant`      | `'bordered' \| 'plain'`     |          | `'bordered'` | `bordered` (default) draws a card around the sections; `plain` only draws dividers.                                                           |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6`     |          | `3`          | Level of the heading that wraps each trigger, `3` by default. Use the level that follows the heading above the accordion in the page outline. |
| `isDisabled`   | `boolean`                   |          | `false`      | Disables every section.                                                                                                                       |
| `className`    | `string`                    |          |              |                                                                                                                                               |
| `ref`          | `Ref<HTMLDivElement>`       |          |              | Ref to the root element.                                                                                                                      |

### Inherited props

- From `DOMProps` (@react-types/shared): `id`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `variant`: `bordered`, `plain`

## Design tokens used

`--ds-accent`, `--ds-accordion-padding-inline`, `--ds-duration`, `--ds-ease`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-small`, `--ds-icon-sm`, `--ds-lh-caption`, `--ds-lh-small`, `--ds-line`, `--ds-line-subtle`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-row-h`, `--ds-space-3`, `--ds-space-4`, `--ds-surface`, `--ds-surface-row-hover`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`, `--ds-weight-regular`

## When to use

- FAQs, grouped settings, long optional detail on a record.
- To shorten a page whose sections people read one at a time.

## When not to use

- For content people must see to finish the task.
- For switching between views: use `Tabs`.
- For a single show/hide of one block: a plain disclosure is enough.

## Accessibility

- Each header is `h3` (configurable) containing a `button` with `aria-expanded` and `aria-controls`; the panel is a `group` labelled by the button. Headings appear in the page outline and in screen reader heading lists.
- Keys: `Tab` moves between triggers; `Enter` and `Space` toggle. Optional arrow-key movement between headers (APG) is not added: each trigger is a tab stop.
- Collapsed panels are hidden (`hidden="until-found"`), so find-in-page can open them, and they take no space.
- The chevron rotates 180 degrees to show the state; the state itself is `aria-expanded`, not the icon. Under `prefers-reduced-motion` the rotation is instant.
- The focus indicator is an inset accent outline because the group clips overflow. Forced colors use `Highlight`.
- Disabled items are not focusable.
- Meta text is read after the title; keep it short.

## Content rules

- Titles are short phrases or questions in sentence case, and say what is inside.
- Do not put the only copy of important information in a collapsed panel.

## Examples

```tsx
<Accordion
  headingLevel={2}
  items={[
    { value: 'shipping', title: 'How long does shipping take?', content: 'Two to five days.' },
    { value: 'returns', title: 'Can I return an order?', meta: '30 days', content: '…' },
  ]}
/>

<Accordion multiple variant="plain" value={open} onChange={setOpen} items={items} />
```

## Related components

- Instead, see Tabs: For switching between views: use `Tabs`.
- Renders: Icon
