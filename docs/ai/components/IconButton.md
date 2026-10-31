# IconButton

> A square button with a single icon and a required accessible name.

The `label` becomes `aria-label`; there is no `title` (it would duplicate the name and is
not keyboard accessible). Set `tooltip` to show the label in a `Tooltip` on hover and focus.

A square button that holds one icon and has a required accessible name. Built on React Aria's `Button`.

- Handoff source: `components/forms/IconButton` (CMP-FRM-02).

- Import: `import { IconButton } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/IconButton/IconButton.tsx`
- Stories (Storybook title `Components/IconButton`): Default, Ghost, Variants, Sizes, Disabled, Toolbar, AccessibleName, KeyboardActivation, Focused, Hovered

## Props

| Prop        | Type                                  | Required | Default       | Description                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------- | -------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`     | `string`                              | yes      |               | Accessible name, required. Say what the button does, as a verb plus object when there is one ("Add order", "Close dialog"), not what it looks like ("Plus").                                                                                   |
| `icon`      | `LucideIcon`                          | yes      |               | The icon to draw: one of the curated set (for example `PlusIcon`). Decorative inside the button.                                                                                                                                               |
| `variant`   | `'secondary' \| 'ghost'`              |          | `'secondary'` | Visual style: `secondary` (default, bordered) or `ghost` (no border at rest).                                                                                                                                                                  |
| `size`      | `'sm' \| 'md' \| 'lg'`                |          | `'md'`        | Square size token: `sm` 32px, `md` 40px (default), `lg` 48px.                                                                                                                                                                                  |
| `tooltip`   | `boolean \| IconButtonTooltipOptions` |          |               | Shows `label` in a `Tooltip` on hover and keyboard focus. Pass `true`, or an object to add a shortcut or change the side. Off by default. The `label` stays the accessible name; the tooltip only repeats it visually for sighted mouse users. |
| `className` | `string`                              |          |               |                                                                                                                                                                                                                                                |
| `ref`       | `Ref<HTMLButtonElement>`              |          |               | Ref to the underlying `<button>` element.                                                                                                                                                                                                      |

### Inherited props

- From `AriaBaseButtonProps` (react-aria): `aria-controls`, `aria-current`, `aria-disabled`, `aria-expanded`, `aria-haspopup`, `aria-pressed`, `form`, `formAction`, `formEncType`, `formMethod`, `formNoValidate`, `formTarget`, `name`, `preventFocusOnPress`, `type`, `value`
- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `ButtonProps` (react-aria): `isDisabled`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `HoverEvents` (@react-types/shared): `onHoverChange`, `onHoverEnd`, `onHoverStart`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `PressEvents` (@react-types/shared): `onClick`, `onPress`, `onPressChange`, `onPressEnd`, `onPressStart`, `onPressUp`
- From `SlotProps` (react-aria-components): `slot`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `variant`: `secondary`, `ghost`
- `size`: `sm`, `md`, `lg`

## Design tokens used

`--ds-accent`, `--ds-control-h-lg`, `--ds-control-h-md`, `--ds-control-h-sm`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-md`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-target-min`, `--ds-text`, `--ds-text-2`

## When to use

- A compact action whose meaning is clear from context and icon: close, add, more actions, search.
- Toolbars and card headers where a text button would not fit.

## When not to use

- When there is room for a text label: use `Button` with a `leading` icon. A visible word is clearer than any icon.
- For navigation: use `Link`.
- For an action whose icon is ambiguous: write the label out in a `Button`.

## Anatomy

One native `<button>` containing a decorative `Icon`. No visible text, no `title`.

## Accessibility

- `label` is required by the type (`label: string`), which enforces AGENTS.md section 8.
- The name is `aria-label` only. The handoff set `title` too, which duplicated the name and was not available to keyboard or touch users. Set `tooltip` to show the label (and an optional shortcut) in a `Tooltip` on hover **and** focus, dismissible with `Esc`.
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

## Related components

- Instead, see Button: When there is room for a text label: use `Button` with a `leading` icon. A visible word is clearer than any icon.
- Instead, see Link: For navigation: use `Link`.
- Renders: Icon, Tooltip
- Used by: Alert, AppShell, AppShellNavToggle, Calendar, FileUpload, LedgerList, Menu, MenuItem, MenuSection, MenuSeparator, MoreActionsMenu, NumberField, Pagination, Sheet, SubMenu, ToastRegion
