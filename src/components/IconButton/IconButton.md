# IconButton

A square button that holds one icon and has a required accessible name. Built on React Aria's `Button`.

- Status: experimental
- Handoff source: `components/forms/IconButton` (CMP-FRM-02).

## When to use

- A compact action whose meaning is clear from context and icon: close, add, more actions, search.
- Toolbars and card headers where a text button would not fit.

## When not to use

- When there is room for a text label: use `Button` with a `leading` icon. A visible word is clearer than any icon.
- For navigation: use `Link`.
- For an action whose icon is ambiguous: write the label out in a `Button`.

## Anatomy

One native `<button>` containing a decorative `Icon`. No visible text, no `title`.

## Props

| Prop         | Type                       | Default       | Notes                                                              |
| ------------ | -------------------------- | ------------- | ------------------------------------------------------------------ |
| `label`      | `string` (required)        | none          | Accessible name, set as `aria-label`. Omitting it is a type error. |
| `icon`       | `IconComponent` (required) | none          | One of the curated set, such as `PlusIcon`.                        |
| `variant`    | `'secondary' \| 'ghost'`   | `'secondary'` | Bordered, or borderless at rest.                                   |
| `size`       | `'sm' \| 'md' \| 'lg'`     | `'md'`        | 32, 40, 48 px square (`--ds-control-h-*`); icon 14, 18, 20 px.     |
| `isDisabled` | `boolean`                  | `false`       | Native `disabled`, 35% opacity.                                    |
| `onPress`    | `(e: PressEvent) => void`  | none          | React Aria press event.                                            |
| `className`  | `string`                   | none          | Merged with the component class.                                   |

Other React Aria `Button` props and `ref` pass through. `children`, `style`, `isPending`, `aria-label` and `aria-labelledby` are not accepted: the label is the single source of the name.

## Accessibility

- `label` is required by the type (`label: string`), which enforces AGENTS.md section 8.
- The name is `aria-label` only. The handoff set `title` too, which duplicated the name and was not available to keyboard or touch users. A tooltip (shown on hover **and** focus, dismissible with `Esc`) will be added with the `Tooltip` component; until then use a clear `label`.
- The icon is `aria-hidden` and `focusable="false"`; the button is never named by its glyph.
- Target size: 32 / 40 / 48 px, above the 24px minimum of WCAG 2.5.8 (`--ds-target-min` is also enforced as `min-inline-size` and `min-block-size`).
- Keys: `Tab` focuses, `Enter` and `Space` press.
- Focus: accent border plus 3px ring on keyboard focus; forced-colors mode repaints the transparent outline.
- Contrast: the icon uses `--ds-text` (secondary) or `--ds-text-2` (ghost) on the surface, both above 4.5:1 and well above the 3:1 needed for graphics.
- Reduced motion: only a 150ms background transition, neutralized by the global rule.

## Content rules

- `label`: verb plus object in sentence case, without the word "button" or "icon": "Add order", "Close dialog", "More actions".
- Translate it like any other text; `IconButton` has no built-in strings.

## Examples

```tsx
<IconButton label="Add order" icon={PlusIcon} onPress={addOrder} />

<IconButton variant="ghost" size="sm" label="More actions" icon={EllipsisIcon} />

<div role="toolbar" aria-label="Order actions">
  <IconButton variant="ghost" label="Search orders" icon={SearchIcon} />
  <IconButton variant="ghost" label="Close panel" icon={XIcon} />
</div>
```

## Differences from the handoff

- `label` is enforced by types; `title` is removed.
- Children are no longer text glyphs (`+`, `...`): pass an `icon` from the set.
- Hover is CSS, not JS state; sizes use control tokens; `style` is gone.
- `disabled` is `isDisabled`, and `onPress` replaces `onClick`.
- Tooltip support is deferred to the `Tooltip` component.
