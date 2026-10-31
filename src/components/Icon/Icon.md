# Icon

An inline SVG icon from the curated Lucide set. It inherits the text color, draws a 1.5px stroke and is hidden from assistive technology unless you give it a `label`.

- Status: experimental
- Replaces: the runtime `unpkg.com/lucide-static` CSS-mask loading (ICON-001), text glyphs used as icons (ICON-002) and the ad hoc icon rules (ICON-003).
- Built on: `lucide-react`, bundled and tree-shakeable. No network access, no CDN.

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

## Props

| Prop          | Type                           | Default | Notes                                                                      |
| ------------- | ------------------------------ | ------- | -------------------------------------------------------------------------- |
| `icon`        | `IconComponent` (required)     | none    | One of the exports of the set, such as `SearchIcon`.                       |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'`  | 12, 14, 18, 20 px. Inside buttons use `sm`.                                |
| `label`       | `string`                       | none    | Makes the icon `role="img"` with this name. Without it the icon is hidden. |
| `directional` | `boolean`                      | `false` | Mirrors the icon in RTL. Set it for chevrons and arrows.                   |
| `className`   | `string`                       | none    | Merged with the component class.                                           |

Other SVG attributes and `ref` pass through to the `<svg>`.

## The curated set

Import icons from the package, not from `lucide-react`: `import { Icon, SearchIcon } from '@loui/ds'`.

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
import { Button, CircleCheckIcon, ChevronRightIcon, Icon, PlusIcon } from '@loui/ds';

<Button leading={<Icon icon={PlusIcon} size="sm" />}>Create order</Button>;

<Icon icon={CircleCheckIcon} label="Paid" />;

<Icon icon={ChevronRightIcon} directional />;
```

## Differences from the handoff

- Bundled SVG instead of `unpkg.com/lucide-static@0.400.0` loaded through CSS `mask` at runtime.
- Decorative by default; `label` is the only way to expose an icon.
- Sizes are the `--ds-icon-*` tokens; the stroke is a token (1.5px, non-scaling) instead of the Lucide default.
- A curated, documented set replaces free-form icon names.
