# TopBar

Status: experimental

The page header: a title with an optional subtitle, or a breadcrumb trail, and a slot for actions. A `header` element, 64px high (`--ds-topbar-h`), with a bottom divider.

- Handoff source: `components/layout/TopBar.jsx` (TODO `CMP-LAY-02`).

## When to use

- At the top of the content area of an app shell, next to the `Sidebar`.
- To hold the single primary action of the screen, at the top right, with its keyboard shortcut.

## When not to use

- For the heading of a card or section: use `Card` or a heading.
- For a floating or sticky toolbar: position this component in your layout instead.

## Props

| Prop           | Type               | Default | Notes                                                                    |
| -------------- | ------------------ | ------- | ------------------------------------------------------------------------ |
| `title`        | `ReactNode`        | none    | Rendered as a heading. Ignored when `breadcrumb` is set.                 |
| `subtitle`     | `ReactNode`        | none    | One short line under the title.                                          |
| `headingLevel` | `1`-`6`            | `1`     | One `h1` per page; use another level when the bar sits inside a section. |
| `breadcrumb`   | `BreadcrumbItem[]` | none    | Shown instead of the title. The page then supplies its own `h1`.         |
| `children`     | `ReactNode`        | none    | Free content next to the title: a `Badge`, a `SegmentedControl`.         |
| `actions`      | `ReactNode`        | none    | End of the bar. Put the primary action last.                             |

`ref` points to the `<header>`; `className` and other `header` attributes pass through.

## Accessibility

- A `header` that is not inside `main`, `section` or `article` is the page's banner landmark. Use at most one banner per page; inside a section it is a plain group.
- The title is a real heading. A breadcrumb replaces it, so keep a page-level `h1` elsewhere in that case.
- The title wins the space: content next to it (`children`, such as badges) wraps to a second line before the title truncates, and the bar grows taller. A title truncates with an ellipsis only when it alone is wider than the bar. The actions never shrink or move out of the bar; on narrow screens keep the primary action and put the others in a `Menu`.
- The primary action is a `Button variant="primary"` with its shortcut as a `Kbd` in `trailing`. Register the shortcut with `useHotkey`; `Kbd` only displays it.
- Height is a minimum, so a 200% text zoom grows the bar instead of clipping it.

## Content rules

- Titles are nouns in sentence case ("Orders"). Subtitles give context: a count, a date, an environment.
- One primary action per screen, a verb plus object: "Create order".

## Examples

```tsx
<TopBar
  title="Orders"
  subtitle="1,248 orders"
  actions={
    <Button variant="primary" trailing={<Kbd keys={['N']} />}>
      Create order
    </Button>
  }
/>

<TopBar breadcrumb={[{ label: 'Orders', href: '/orders' }, { label: 'ORD-1048' }]} />
```

## Differences from the handoff

- Height is `--ds-topbar-h` (64px) as a minimum; the handoff code used 56px while the tokens and the ERP spec said 64px.
- The title is a heading with a level; `subtitle` is new; `breadcrumb` takes `Breadcrumb` items.
- No `sticky` prop (the handoff hard-coded `z-index: 20`, which is not a layer token). Make it sticky in your layout with a token layer.
