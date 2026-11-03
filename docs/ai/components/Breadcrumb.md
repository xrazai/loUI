# Breadcrumb

> The path to the current page as an ordered list of links inside a `nav` landmark. The
> separators are decorative (`aria-hidden`), so a screen reader hears a list of N items. Long
> labels are truncated with an ellipsis (the current page keeps the most room); collapsing the
> middle of a long trail into a menu is not supported yet.

The path from the root to the current page, as an ordered list of links inside a `nav` landmark. Built on React Aria `Breadcrumbs` and `Breadcrumb`.

- Handoff source: `components/layout/Breadcrumb.jsx` (TODO `CMP-LAY-03`).

- Import: `import { Breadcrumb } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Breadcrumb/Breadcrumb.tsx`
- Stories (Storybook title `Components/Breadcrumb`): Default, SingleItem, KeyboardNavigation, LongTrail, RouterNavigation, Portuguese, RightToLeft, Focused

## Props

| Prop       | Type                          | Required | Default | Description                                                                                                                      |
| ---------- | ----------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `items`    | `readonly BreadcrumbItem[]`   | yes      |         | The trail from the root to the current page. The last item is the current page: it gets `aria-current="page"` and is not a link. |
| `messages` | `Partial<{ label: string; }>` |          |         | Per-instance overrides of the built-in messages.                                                                                 |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Breadcrumb: { ... } }}>`.

| Key     | English default | Notes                                                  |
| ------- | --------------- | ------------------------------------------------------ |
| `label` | `Breadcrumb`    | Accessible name of the breadcrumb navigation landmark. |

## Design tokens used

`--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-sans`, `--ds-fs-small`, `--ds-lh-small`, `--ds-radius-sm`, `--ds-space-2`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`

## When to use

- Deep hierarchies (Orders > Northwind Traders > ORD-1048) where people need to go up a level.
- Inside the `TopBar` instead of a title.

## When not to use

- For the steps of a process: use a stepper (`StatusSteps`).
- For the main navigation: use `Sidebar` and `NavItem`.
- For a flat app with two levels: a page title and a "Back" link are enough.

## Accessibility

- `nav` named "Breadcrumb" containing an `ol`: a screen reader announces a list and its length.
- The current page is `aria-current="page"` and is not a link.
- Separators are decorative icons with `aria-hidden`, so they are never read. They mirror in right-to-left locales.
- Tab visits each ancestor link in order. Link text is `--ds-text-2` and turns ink with an underline on hover.
- Truncation: ancestors shrink first (three times faster than the current page) and show an ellipsis; labels are not wrapped. Give the full text to users some other way when it matters (the page title).
- Collapsing the middle of a long trail into a menu ("...") is not supported yet; it needs the `Menu` component (P3).

## Content rules

- Labels are the page titles, short, in sentence case. The last label matches the page `h1`.
- Do not include "Home" unless it is a real destination people use.

## Examples

```tsx
<Breadcrumb
  items={[
    { label: 'Orders', href: '/orders' },
    { label: 'Northwind Traders', href: '/customers/northwind' },
    { label: 'ORD-1048' },
  ]}
/>
```

## Related components

- Instead, see StatusSteps: For the steps of a process: use a stepper (`StatusSteps`).
- Instead, see Sidebar: For the main navigation: use `Sidebar` and `NavItem`.
- Instead, see NavItem: For the main navigation: use `Sidebar` and `NavItem`.
- Renders: Icon
- Used by: TopBar
