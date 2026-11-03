# Icon

> An inline SVG icon (Lucide, bundled) that inherits the text color and draws a 1.5px stroke.
> Decorative by default; pass `label` to make it a meaningful image.

An inline SVG icon from the curated Lucide set. It inherits the text color, draws a 1.5px stroke and is hidden from assistive technology unless you give it a `label`.

- Replaces: the runtime `unpkg.com/lucide-static` CSS-mask loading (ICON-001), text glyphs used as icons (ICON-002) and the ad hoc icon rules (ICON-003).
- Built on: `lucide-react`, bundled and tree-shakeable. No network access, no CDN.

- Import: `import { Icon } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Icon/Icon.tsx`
- Stories (Storybook title `Components/Icon`): Default, Sizes, WithLabel, InheritsColor, DirectionalRtl, Gallery

## Props

| Prop          | Type                           | Required | Default | Description                                                                                                                                                                                                                                   |
| ------------- | ------------------------------ | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon`        | `LucideIcon`                   | yes      |         | The icon to draw, one of the curated set exported from this package (for example `SearchIcon`).                                                                                                                                               |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg'` |          | `'md'`  | Size token: `xs` 12px, `sm` 14px, `md` 18px (default), `lg` 20px.                                                                                                                                                                             |
| `label`       | `string`                       |          |         | Accessible name. Omit it when the icon only decorates text that already names the control (the icon is then hidden from assistive technology). Set it only when the icon carries meaning on its own, outside a control that has its own name. |
| `directional` | `boolean`                      |          | `false` | Mirror the icon horizontally in right-to-left languages. Set it for icons that point in a reading direction (chevrons, arrows); leave it off for symmetric or universal icons.                                                                |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `xs`, `sm`, `md`, `lg`

## Design tokens used

`--ds-icon-lg`, `--ds-icon-md`, `--ds-icon-sm`, `--ds-icon-stroke-width`, `--ds-icon-xs`

## When to use

- Next to a text label to reinforce it (button leading slot, menu item, alert, input affordance).
- Inside `IconButton`, which supplies the accessible name.
- On its own only when it carries meaning that no nearby text states. Then set `label`.

## When not to use

- As the only carrier of meaning or status. Color and shape never replace text.
- For filled, colored or multi-color icons, emoji or Unicode glyphs. Use the set below.
- For a loading indicator that moves: use `Spinner`.
- For an icon that is not in the set. Add it to `icons.ts` with a documented use first.

## Anatomy

A single `<svg>` (24x24 viewBox) with a `currentColor` stroke and no fill. Size and stroke come from tokens: `--ds-icon-xs|sm|md|lg` and `--ds-icon-stroke-width`.

## The curated set

Import icons from the package, not from `lucide-react`: `import { Icon, SearchIcon } from 'loui-ds'`.

`iconSet` maps the kebab-case names below to the components and `iconNames` documents the use of each. Both are the source of the allow-list in the manifest (AI-002).

arrow-down, arrow-left, arrow-right, arrow-up, calendar, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-up-down, circle-alert, circle-check, circle-x, ellipsis, external-link, info, loader, minus, plus, search, star, triangle-alert, x.

## Accessibility

- Decorative by default: `aria-hidden="true"` and `focusable="false"`.
- With `label`: `role="img"` and `aria-label`. Use short, specific names ("Saved", not "check icon").
- An icon inside a control never names the control. Put the name on the control (`IconButton label`).
- Forced colors: the stroke is `currentColor`, so it follows the system text color.
- Contrast: icons that convey meaning need 3:1 against their background (WCAG 1.4.11).
- Reduced motion: icons do not animate.

## Content rules

- Labels are sentence case and describe the meaning ("Saved"), never the picture ("Green check").
- No emoji or text glyphs as icons (AGENTS.md section 7).

## Examples

```tsx
import { Button, CircleCheckIcon, ChevronRightIcon, Icon, PlusIcon } from 'loui-ds';

<Button leading={<Icon icon={PlusIcon} size="sm" />}>Create order</Button>;

<Icon icon={CircleCheckIcon} label="Paid" />;

<Icon icon={ChevronRightIcon} directional />;
```

## Related components

- Instead, see Spinner: For a loading indicator that moves: use `Spinner`.
- Used by: Accordion, AgentCard, Alert, ApprovalCard, Banner, Breadcrumb, Checkbox, ColorOption, Combobox, CommandPalette, DataTable, DatePicker, IconButton, Link, MatrixGrid, Menu, MenuItem, MenuSection, MenuSeparator, MoreActionsMenu, NavItem, Rating, ResponseFeedback, SearchInput, Select, StatCard, StatusSteps, Stepper, SubMenu, SuggestionChip, Tag, TagGroup, Timeline, Toggle, ToolCallStep
