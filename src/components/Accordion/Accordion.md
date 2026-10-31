# Accordion

Status: experimental

A stack of sections that expand and collapse. Each header is a heading that wraps a real button. Built on React Aria `DisclosureGroup`, `Disclosure` and `DisclosurePanel`.

- Handoff source: `components/layout/Accordion.jsx` (TODO `CMP-LAY-04`).

## When to use

- FAQs, grouped settings, long optional detail on a record.
- To shorten a page whose sections people read one at a time.

## When not to use

- For content people must see to finish the task.
- For switching between views: use `Tabs`.
- For a single show/hide of one block: a plain disclosure is enough.

## Props

| Prop                     | Type                        | Default      | Notes                                                                   |
| ------------------------ | --------------------------- | ------------ | ----------------------------------------------------------------------- |
| `items`                  | `AccordionItem[]`           | required     | `{ value, title, meta?, content, isDisabled? }`.                        |
| `multiple`               | `boolean`                   | `false`      | Several sections open at once. Otherwise opening one closes the others. |
| `value` / `defaultValue` | `string[]`                  | `[]`         | Expanded values, controlled / uncontrolled.                             |
| `onChange`               | `(value: string[]) => void` | none         | All expanded values after a toggle.                                     |
| `variant`                | `'bordered' \| 'plain'`     | `'bordered'` | `bordered`: card border and surface. `plain`: dividers only.            |
| `headingLevel`           | `2`-`6`                     | `3`          | Level of the heading around each trigger; follow the page outline.      |
| `isDisabled`             | `boolean`                   | `false`      | Disables every section.                                                 |

`ref` points to the root; `className` and other attributes pass through.

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

## Differences from the handoff

- The trigger is wrapped in a heading and linked to its panel (`aria-controls`, labelled panel); the handoff had a bare `button` and no panel relationship.
- `multiple` and controlled `value` / `onChange` replace the internal-only `defaultValue` array.
- `variant="plain"` replaces `bordered={false}`. The chevron is the shared `ChevronDownIcon` that rotates (down collapsed, up expanded), instead of a custom right-pointing SVG.
- Not included yet: height animation of the panel (the chevron animates; the panel appears instantly) and arrow-key movement between headers.
