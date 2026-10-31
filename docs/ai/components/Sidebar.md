# Sidebar

> The app sidebar: a workspace block, navigation sections, an optional status card, a footer
> slot and the signed-in user. It is an `aside` landmark; each section is a separate `nav`
> landmark named by its caption. It is `--ds-sidebar-w` wide and scrolls on its own when it is
> taller than its container, so give the parent a fixed height.

Reading order and focus order follow the visual order: sections top to bottom, then the
footer. Collapsing or an off-canvas mobile variant is not part of this component.

The app sidebar: workspace block, navigation sections, optional status card, footer slot and the signed-in user. It is an `aside` landmark and each section is its own `nav`.

- Handoff source: `components/layout/Sidebar.jsx` (TODO `CMP-LAY-01`).

- Import: `import { Sidebar } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Sidebar/Sidebar.tsx`
- Stories (Storybook title `Components/Sidebar`): Default, Complete, StatusTones, WithoutCaptions, FocusOrder, Controlled, ManyItems, LongText, Portuguese, RightToLeft

## Props

| Prop         | Type                          | Required | Default | Description                                                                         |
| ------------ | ----------------------------- | -------- | ------- | ----------------------------------------------------------------------------------- |
| `workspace`  | `SidebarWorkspace`            | yes      |         | The workspace block at the top.                                                     |
| `sections`   | `readonly SidebarSection[]`   | yes      |         | Navigation groups. Each one is its own labelled `nav` landmark.                     |
| `value`      | `string`                      |          |         | `value` of the active item (gets `aria-current="page"`).                            |
| `onChange`   | `(value: string) => void`     |          |         | Called with the `value` of the item the user pressed.                               |
| `status`     | `SidebarStatus`               |          |         | Optional status card above the footer.                                              |
| `footer`     | `ReactNode`                   |          |         | Free slot above the user block, for example a help link or an upgrade note.         |
| `user`       | `SidebarUser`                 |          |         | The signed-in user, at the bottom.                                                  |
| `aria-label` | `string`                      |          |         | Overrides the accessible name of the landmark (default "Sidebar" from the catalog). |
| `messages`   | `Partial<{ label: string; }>` |          |         | Per-instance overrides of the built-in messages.                                    |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Sidebar: { ... } }}>`.

| Key     | English default | Notes                                    |
| ------- | --------------- | ---------------------------------------- |
| `label` | `Sidebar`       | Accessible name of the sidebar landmark. |

## Design tokens used

`--ds-bg`, `--ds-danger`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-line`, `--ds-line-subtle`, `--ds-nav-item-padding-inline`, `--ds-primary-bg`, `--ds-primary-fg`, `--ds-radius-lg`, `--ds-radius-md`, `--ds-radius-pill`, `--ds-sidebar-gap`, `--ds-sidebar-padding-block`, `--ds-sidebar-padding-inline`, `--ds-sidebar-status-dot-size`, `--ds-sidebar-w`, `--ds-sidebar-workspace-mark-size`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-success`, `--ds-surface`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-tracking-caption`, `--ds-warning`, `--ds-weight-medium`, `--ds-weight-semibold`

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

## Layout

- Width is `--ds-sidebar-w` (240px). The handoff's `width` prop and 248px default are dropped; there is one width in the system.
- The sidebar uses `max-block-size: 100%` and `overflow-y: auto`: give its parent a definite height (for example a full-height flex row) and it scrolls on its own while the content scrolls separately. The status, footer and user stay at the bottom when there is room.

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

## Related components

- Renders: Avatar, NavItem
