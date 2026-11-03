# TopBar

> The page header: a title with an optional subtitle, or a breadcrumb trail, and an actions
> slot. It is a `header` element, `--ds-topbar-h` (64px) high, with a bottom divider. It does
> not stick by itself; position it in your layout.

The page header: a title with an optional subtitle, or a breadcrumb trail, and a slot for actions. A `header` element, 64px high (`--ds-topbar-h`), with a bottom divider.

- Handoff source: `components/layout/TopBar.jsx` (TODO `CMP-LAY-02`).

- Import: `import { TopBar } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/TopBar/TopBar.tsx`
- Stories (Storybook title `Components/TopBar`): Default, WithSubtitle, WithPrimaryAction, WithContent, WithBreadcrumb, HeadingLevel2, LongTitle, RightToLeft

## Props

| Prop           | Type                                     | Required | Default | Description                                                                                                                                                                       |
| -------------- | ---------------------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | `ReactNode`                              |          |         | The title of the page or section. Rendered as a heading (see `headingLevel`). Ignored when `breadcrumb` is set: the trail then names the page and the page supplies its own `h1`. |
| `subtitle`     | `ReactNode`                              |          |         | One short line under the title (a count, a date, an environment). Not used with `breadcrumb`.                                                                                     |
| `headingLevel` | `'1' \| '2' \| '3' \| '4' \| '5' \| '6'` |          | `'1'`   | Heading level of the title, `1` by default (one `h1` per page).                                                                                                                   |
| `breadcrumb`   | `readonly BreadcrumbItem[]`              |          |         | A breadcrumb trail shown instead of the title.                                                                                                                                    |
| `children`     | `ReactNode`                              |          |         | Free content next to the title, for example a `Badge` or a `SegmentedControl`.                                                                                                    |
| `actions`      | `ReactNode`                              |          |         | Actions at the end of the bar. Put the single primary action of the screen last, as a `Button variant="primary"` with its shortcut as a `Kbd` in `trailing`.                      |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-bg`, `--ds-font-sans`, `--ds-fs-heading`, `--ds-fs-meta`, `--ds-lh-heading`, `--ds-lh-meta`, `--ds-line-subtle`, `--ds-space-1`, `--ds-space-2`, `--ds-space-4`, `--ds-text`, `--ds-text-2`, `--ds-top-bar-padding-inline`, `--ds-topbar-h`, `--ds-weight-semibold`

## When to use

- At the top of the content area of an app shell, next to the `Sidebar`.
- To hold the single primary action of the screen, at the top right, with its keyboard shortcut.

## When not to use

- For the heading of a card or section: use `Card` or a heading.
- For a floating or sticky toolbar: position this component in your layout instead.

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

## Related components

- Instead, see Card: For the heading of a card or section: use `Card` or a heading.
- Renders: Breadcrumb
