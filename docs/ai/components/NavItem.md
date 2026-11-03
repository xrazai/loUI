# NavItem

> One entry of a navigation list. A real link when it has an `href`, a button when it only has
> `onPress`. The active item is marked with `aria-current="page"`, a raised background and a
> 2px ink bar at the start edge.

One entry of a navigation list: a real link (or a button) with an optional icon and count. Built on React Aria `Link` and `Button`.

- Handoff source: `components/navigation/NavItem.jsx` (TODO `CMP-NAV-03`).

- Import: `import { NavItem } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/NavItem/NavItem.tsx`
- Stories (Storybook title `Components/NavItem`): Default, Active, AsButton, WithoutIcon, WithCount, CountTones, ZeroCountHidden, Disabled, LongLabel, RouterNavigation, PortugueseCount, RightToLeft, Focused

## Props

| Prop         | Type                                                          | Required | Default     | Description                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children`   | `ReactNode`                                                   | yes      |             | Label: a noun in sentence case ("Orders"). Truncated with an ellipsis when it does not fit.                                                                                                                              |
| `href`       | `string`                                                      |          |             | Destination. With `href` the item is a real link (`<a>`) and navigates through the router set on `DSProvider`. Without it the item is a `<button>` that runs `onPress`.                                                  |
| `icon`       | `LucideIcon`                                                  |          |             | Icon from the curated set, drawn at 18px before the label. Decorative.                                                                                                                                                   |
| `isActive`   | `boolean`                                                     |          | `false`     | Marks the item for the page or view being shown: sets `aria-current="page"`, the raised background and the 2px ink bar. Exactly one item of a navigation should be active.                                               |
| `count`      | `string \| number`                                            |          |             | A count shown in a pill at the end of the item. `0` shows no pill. Numbers are formatted for the active locale.                                                                                                          |
| `countLabel` | `string`                                                      |          |             | The text a screen reader hears instead of the bare number, with what is being counted ("3 pending", "12 unread"). Always set it together with `count`; without it a generic "Count: 3" from the message catalog is used. |
| `countTone`  | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` |          | `'neutral'` | Tone of the count pill. Color never carries the meaning alone: `countLabel` does. Default `neutral`.                                                                                                                     |
| `messages`   | `Partial<{ count: (value: string) => string; }>`              |          |             | Per-instance overrides of the built-in messages.                                                                                                                                                                         |
| `className`  | `string`                                                      |          |             |                                                                                                                                                                                                                          |
| `ref`        | `Ref<HTMLElement>`                                            |          |             | Ref to the underlying `<a>` (with `href`) or `<button>` element.                                                                                                                                                         |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `AriaLinkOptions` (react-aria): `isDisabled`
- From `DOMProps` (@react-types/shared): `id`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `HoverEvents` (@react-types/shared): `onHoverChange`, `onHoverEnd`, `onHoverStart`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `LinkDOMProps` (@react-types/shared): `download`, `hrefLang`, `ping`, `referrerPolicy`, `rel`, `routerOptions`, `target`
- From `PossibleLinkDOMRenderProps` (react-aria-components): `render`
- From `PressEvents` (@react-types/shared): `onClick`, `onPress`, `onPressChange`, `onPressEnd`, `onPressStart`, `onPressUp`
- From `SlotProps` (react-aria-components): `slot`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ NavItem: { ... } }}>`.

| Key                    | English default  | Notes                                                            |
| ---------------------- | ---------------- | ---------------------------------------------------------------- |
| `count(value: string)` | `Count: {value}` | Spoken text for a count when the consumer gives no `countLabel`. |

## Design tokens used

`--ds-accent`, `--ds-accent-soft`, `--ds-danger`, `--ds-danger-soft`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-item-h`, `--ds-lh-small`, `--ds-nav-item-count-padding-inline`, `--ds-nav-item-count-size`, `--ds-nav-item-icon-opacity`, `--ds-nav-item-indicator-width`, `--ds-nav-item-padding-inline`, `--ds-opacity-disabled`, `--ds-radius-pill`, `--ds-radius-sm`, `--ds-space-3`, `--ds-success`, `--ds-success-soft`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-warning`, `--ds-warning-soft`, `--ds-weight-medium`, `--ds-weight-regular`

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

## Related components

- Instead, see Button: For actions inside a page: use `Button`.
- Instead, see Tabs: For switching panels on a page: use `Tabs`.
- Instead, see Link: For a link inside text: use `Link`.
- Renders: Icon, VisuallyHidden
- Used by: Sidebar
