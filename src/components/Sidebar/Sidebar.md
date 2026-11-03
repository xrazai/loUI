# Sidebar

Status: experimental

The app sidebar: workspace block, navigation sections, optional status card, footer slot and the signed-in user. It is an `aside` landmark and each section is its own `nav`.

- Handoff source: `components/layout/Sidebar.jsx` (TODO `CMP-LAY-01`).

## When to use

- The persistent primary navigation of an app shell, next to the content and below a `SkipLink`.

## When not to use

- For in-page navigation or a table of contents.
- For mobile off-canvas navigation: collapsing and responsive behavior are not part of this component yet.

## Anatomy

```
aside[aria-label="Sidebar"]         (--ds-sidebar-w wide, scrolls on its own)
  workspace                         (initial tile, name, subtitle)
  nav[aria-labelledby=caption]      (one per section)
    caption                         (mono, uppercase by CSS)
    ul > li > NavItem
  bottom
    status                          (role=status: dot + title + meta/value)
    footer                          (slot)
    user                            (Avatar + name + role)
```

## Props

| Prop         | Type                              | Notes                                                                                       |
| ------------ | --------------------------------- | ------------------------------------------------------------------------------------------- |
| `workspace`  | `{ name, subtitle?, initial? }`   | `initial` defaults to the first letter of the name (locale upper-casing).                   |
| `sections`   | `SidebarSection[]`                | `{ id, title, items }` or `{ id, label, items }` (one of `title` / `label` is required).    |
| `value`      | `string`                          | `value` of the active item.                                                                 |
| `onChange`   | `(value: string) => void`         | Called with the item the user pressed (links and buttons).                                  |
| `status`     | `{ tone?, title, meta?, value? }` | `tone`: `neutral` (default), `success`, `warning`, `danger`. The title carries the meaning. |
| `footer`     | `ReactNode`                       | Free slot above the user block.                                                             |
| `user`       | `{ name, role?, avatarSrc? }`     | Rendered with a decorative `Avatar` (the name is next to it).                               |
| `aria-label` | `string`                          | Overrides the landmark name (default "Sidebar" from the catalog).                           |
| `messages`   | `{ label?: string }`              | Per-instance message override (ADR-0005).                                                   |

A `SidebarItem` is `{ value, label, href?, icon?, count?, countLabel?, countTone?, isDisabled? }`; it renders a `NavItem`. Always set `countLabel` with `count`.

## Layout

- Width is `--ds-sidebar-w` (240px). The handoff's `width` prop and 248px default are dropped; there is one width in the system.
- The sidebar uses `max-block-size: 100%` and `overflow-y: auto`: give its parent a definite height (for example a full-height flex row) and it scrolls on its own while the content scrolls separately. The status, footer and user stay at the bottom when there is room.

## Behavior change

The status dot is now grey (`neutral`) when `tone` is omitted; it used to default to green. Pass `tone: 'success'` to keep the green dot.

## Accessibility

- Landmarks: `aside` (complementary) named "Sidebar", and one `nav` per section named by its visible caption (or by `label` when there is no caption). Names are unique, so landmark lists are meaningful.
- Items are in a `ul`, so screen readers announce "list, 5 items".
- Focus order follows the visual order: sections top to bottom, then the footer, then nothing in the status or user blocks (they are text).
- The status block is `role="status"` (polite live region): a change from "Synced" to "Sync failed" is announced. The dot is `aria-hidden`; the title says the status in words.
- The workspace tile and the user avatar are decorative because the names are shown next to them.
- The active item has `aria-current="page"` (see `NavItem`).

## Content rules

- Section captions are written in sentence case ("Work"); the CSS makes them uppercase mono.
- Status titles say the state: "All systems operational", not "OK".

## Examples

```tsx
<Sidebar
  workspace={{ name: 'Northwind', subtitle: 'Production' }}
  value="orders"
  onChange={setView}
  sections={[
    {
      id: 'work',
      title: 'Work',
      items: [
        {
          value: 'orders',
          label: 'Orders',
          href: '/orders',
          icon: StarIcon,
          count: 3,
          countLabel: '3 pending',
          countTone: 'warning',
        },
        { value: 'customers', label: 'Customers', href: '/customers' },
      ],
    },
  ]}
  status={{ title: 'All systems operational', meta: 'Last sync', value: '2 min ago' }}
  user={{ name: 'Ana Souza', role: 'Owner' }}
/>
```

## Differences from the handoff

- Width is the token (240px) instead of a 248px default prop.
- `aside` + one labelled `nav` per section + lists, instead of anonymous `nav`s with `div` captions.
- Items are `NavItem`s (real links); the user avatar is the `Avatar` component; the status card is a `role="status"` region with a decorative dot.
- Not included yet: collapsed/icon-only mode and a responsive off-canvas variant (needs its own decision).
