# NavItem

Status: experimental

One entry of a navigation list: a real link (or a button) with an optional icon and count. Built on React Aria `Link` and `Button`.

- Handoff source: `components/navigation/NavItem.jsx` (TODO `CMP-NAV-03`).

## When to use

- Inside the `Sidebar`, or any vertical navigation list.
- To go to a page or view (with `href`), or to run a navigation-like command such as "Log out" (with `onPress`).

## When not to use

- For actions inside a page: use `Button`.
- For switching panels on a page: use `Tabs`.
- For a link inside text: use `Link`.

## Anatomy

```
a | button .root           (36px high, --ds-item-h)
  Icon                     (18px, optional, 0.7 opacity when inactive)
  label                    (truncates with an ellipsis)
  count                    (optional pill with tone)
    "3"                    (aria-hidden)
    "3 pending"            (visually hidden text alternative)
```

## States

| State    | Look                                                                          | Semantics             |
| -------- | ----------------------------------------------------------------------------- | --------------------- |
| Rest     | transparent, `--ds-text-2`                                                    | link or button        |
| Hover    | raised background (`--ds-surface-raised`), ink text                           | none                  |
| Active   | raised background, ink text, 2px ink bar at the start edge, full-opacity icon | `aria-current="page"` |
| Focus    | accent ring                                                                   |                       |
| Disabled | `--ds-opacity-disabled`                                                       | `aria-disabled`       |

## Props

| Prop         | Type                                                          | Default     | Notes                                                                               |
| ------------ | ------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `children`   | `ReactNode`                                                   | required    | The label.                                                                          |
| `href`       | `string`                                                      | none        | With it: a real `<a>` routed through `DSProvider`. Without it: a `<button>`.        |
| `icon`       | `IconComponent`                                               | none        | From the curated set. Drawn at `--ds-icon-md` (18px), decorative.                   |
| `isActive`   | `boolean`                                                     | `false`     | Sets `aria-current="page"` and the active look. One per navigation.                 |
| `count`      | `number \| string`                                            | none        | Pill at the end. `0` shows nothing. Numbers are formatted for the locale.           |
| `countLabel` | `string`                                                      | catalog     | Spoken text for the count ("3 pending"). Always set it; the fallback is "Count: 3". |
| `countTone`  | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Tone of the pill.                                                                   |
| `onPress`    | `(e: PressEvent) => void`                                     | none        | Fired for both links and buttons.                                                   |
| `isDisabled` | `boolean`                                                     | `false`     |                                                                                     |
| `messages`   | `{ count?: (value: string) => string }`                       | catalog     | Per-instance override of the fallback count text (ADR-0005).                        |

`ref` points to the `<a>` or `<button>`. Other React Aria `Link` props (`target`, `routerOptions`, `aria-*`) pass through for links.

## Accessibility

- Real `<a href>` (or `<button>`), so opening in a new tab, copying the URL and screen reader link lists work. The handoff used `div role="link"` with no `href`.
- `aria-current="page"` on the active item, on links and on buttons.
- The count pill is not enough on its own: a screen reader hears the label then the text alternative ("Orders 3 pending"). Color (tone) is only reinforcement.
- Keys: `Tab` to focus; `Enter` follows a link; `Enter` and `Space` press a button.
- Contrast: label `--ds-text-2` on `--ds-bg`, ink on the raised surface. The pill text meets 4.5:1 on its soft background.
- Forced colors: the active bar and the pill border use system colors.

## Content rules

- Labels are nouns in sentence case: "Orders", "Customers". Long labels are truncated.
- `countLabel` states what is counted and its state: "3 pending", "12 unread".

## Examples

```tsx
<nav aria-label="Main">
  <NavItem
    href="/orders"
    icon={StarIcon}
    isActive
    count={3}
    countLabel="3 pending"
    countTone="warning"
  >
    Orders
  </NavItem>
  <NavItem href="/customers" icon={SearchIcon}>
    Customers
  </NavItem>
  <NavItem onPress={signOut}>Log out</NavItem>
</nav>
```

## Differences from the handoff

- `div role="link"` becomes a real `<a>` (router-aware through `DSProvider`) or a `<button>`; `label` became `children`, `active` became `isActive`, `onClick` became `onPress`.
- Icons are `Icon` components (the handoff fetched SVGs from unpkg); the inactive opacity (.7) is the token `--ds-nav-item-icon-opacity`.
- Hover is CSS. The active bar is a pseudo-element (logical, mirrors in RTL) instead of `box-shadow`, so it combines with the focus ring.
- Count pills have a text alternative and localized numbers.
