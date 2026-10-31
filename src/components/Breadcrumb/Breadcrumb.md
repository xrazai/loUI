# Breadcrumb

Status: experimental

The path from the root to the current page, as an ordered list of links inside a `nav` landmark. Built on React Aria `Breadcrumbs` and `Breadcrumb`.

- Handoff source: `components/layout/Breadcrumb.jsx` (TODO `CMP-LAY-03`).

## When to use

- Deep hierarchies (Orders > Northwind Traders > ORD-1048) where people need to go up a level.
- Inside the `TopBar` instead of a title.

## When not to use

- For the steps of a process: use a stepper (`StatusSteps`).
- For the main navigation: use `Sidebar` and `NavItem`.
- For a flat app with two levels: a page title and a "Back" link are enough.

## Props

| Prop         | Type                                 | Notes                                                                      |
| ------------ | ------------------------------------ | -------------------------------------------------------------------------- |
| `items`      | `{ label: string; href?: string }[]` | Root first. The last item is the current page: plain text, `href` ignored. |
| `aria-label` | `string`                             | Overrides the landmark name ("Breadcrumb" from the catalog).               |
| `messages`   | `{ label?: string }`                 | Per-instance message override (ADR-0005).                                  |

`ref` points to the `<nav>`; `className` and other `nav` attributes pass through. Links go through the router set on `DSProvider`.

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

## Differences from the handoff

- Ordered list inside a named `nav` (the handoff was a flex of loose links and `/` spans).
- Separators are icons, hidden from assistive technology; the current page uses `aria-current` and is not a link.
- Real routed links (`href` through `DSProvider`) instead of `href="#"` plus `onClick`. Hover color is CSS.
- The landmark name comes from the message catalog (English and pt-BR).
