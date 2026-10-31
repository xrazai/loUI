# Toggle

> A button that stays pressed: it switches one setting on or off (bold text, a filter, "show
> archived"). Built on React Aria `ToggleButton`: a native `<button>` with `aria-pressed`,
> toggled by `Enter` and `Space`.

Use it for an independent on/off choice that applies at once. For a setting inside a form
use `Switch` or `Checkbox`; for several related toggles use `ToggleGroup`; for one value out
of a few use `SegmentedControl`.

A button that stays pressed: it switches one setting on or off (bold text, a filter, "show archived") and applies it at once. A native `<button>` with `aria-pressed`, built on React Aria `ToggleButton`. Looks like `Button` (`secondary` and `ghost`), with a clear pressed state.

- TODO `GAP-005`.

- Import: `import { Toggle } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Toggle/Toggle.tsx`
- Stories (Storybook title `Components/Toggle`): Default, Pressed, Ghost, GhostPressed, Small, Large, WithLeadingIcon, IconOnly, IconOnlyWithTooltip, Disabled, DisabledPressed, KeyboardToggle, Controlled, LongLabel, RightToLeft, Focused

## Props

| Prop              | Type                              | Required | Default | Description                                                                                                                                                                                     |
| ----------------- | --------------------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`        | `ReactNode`                       |          |         | Label: a short noun or verb in sentence case ("Bold", "Show archived").                                                                                                                         |
| `leading`         | `ReactNode`                       |          |         | Node before the label, usually `<Icon size="sm" />`. Decorative; the label names the toggle.                                                                                                    |
| `aria-label`      | `string`                          |          |         | Replaces the accessible name when the visible label is not enough. Rarely needed.                                                                                                               |
| `aria-labelledby` | `string`                          |          |         | Id of the element that names the toggle.                                                                                                                                                        |
| `icon`            | `LucideIcon`                      |          |         | The icon to draw: one of the curated set (for example `StarIcon`). Decorative inside the button.                                                                                                |
| `label`           | `string`                          |          |         | Accessible name of an icon-only toggle, required. Name what the toggle controls, not what it looks like and not its state ("Bold", "Show archived"): the pressed state is announced separately. |
| `tooltip`         | `boolean \| ToggleTooltipOptions` |          |         | Shows `label` in a `Tooltip` on hover and keyboard focus. Pass `true`, or an object to add a shortcut or change the side. The `label` stays the accessible name.                                |
| `id`              | `string`                          |          |         | Inside a `ToggleGroup`: the value of this toggle in the group's `value` (required there, unique in the group). Standalone: the DOM id.                                                          |
| `variant`         | `'secondary' \| 'ghost'`          |          |         | Visual style, as for `Button`. `secondary` (default) has a border; `ghost` has none at rest. Inside a `ToggleGroup` it defaults to the group's `variant`.                                       |
| `size`            | `'sm' \| 'md' \| 'lg'`            |          |         | Height token: `sm` 32px, `md` 40px (default), `lg` 48px. Inside a `ToggleGroup` it defaults to the group's `size`.                                                                              |
| `className`       | `string`                          |          |         |                                                                                                                                                                                                 |
| `ref`             | `Ref<HTMLButtonElement>`          |          |         | Ref to the underlying `<button>` element.                                                                                                                                                       |

### Inherited props

- From `AriaBaseButtonProps` (react-aria): `aria-controls`, `aria-disabled`, `aria-expanded`, `aria-haspopup`, `aria-pressed`, `preventFocusOnPress`
- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `ButtonProps` (react-aria): `isDisabled`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `HoverEvents` (@react-types/shared): `onHoverChange`, `onHoverEnd`, `onHoverStart`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `PressEvents` (@react-types/shared): `onClick`, `onPress`, `onPressChange`, `onPressEnd`, `onPressStart`, `onPressUp`
- From `SlotProps` (react-aria-components): `slot`
- From `ToggleButtonProps` (react-aria): `defaultSelected`, `isSelected`, `onChange`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `variant`: `secondary`, `ghost`
- `size`: `sm`, `md`, `lg`

## Design tokens used

`--ds-accent`, `--ds-control-h-lg`, `--ds-control-h-md`, `--ds-control-h-sm`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-sans`, `--ds-fs-body`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-body`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-md`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-space-5`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-weight-medium`

## When to use

- One independent on/off choice in a toolbar or filter bar: Bold, Show archived, Only mine.
- An icon-only on/off control (Favorite, Pin) with a required `label`.

## When not to use

- A setting that is saved with a form: use `Switch` or `Checkbox`.
- Several related toggles that share a value: use `ToggleGroup`.
- One value out of a few options (View: List, Board): use `SegmentedControl`.
- An action that does something once: use `Button`.

## Anatomy

```
button[aria-pressed]
  leading   (optional, decorative)
  label     (or a single icon when icon-only)
```

## Accessibility

- Semantics: `<button aria-pressed="true|false">`. Inside a single-selection `ToggleGroup` it is a `radio` with `aria-checked`.
- Keyboard: `Tab` focuses; `Space` and `Enter` toggle.
- The pressed state is shown by a brighter border, a raised fill and ink text, never by color alone. Focus is the accent border and ring.
- Icon-only toggles need a `label` that names what the toggle controls, not its state: the pressed state is announced by the browser. The icon is decorative.
- Targets are at least 32px (`sm`). Forced colors: the pressed toggle gets a `Highlight` border and an underline.

## Content rules

- Label with a short noun or verb phrase in sentence case: "Bold", "Show archived". Do not change the label when the state changes ("Hide archived" would be read as the opposite of the state).

## Examples

```tsx
<Toggle isSelected={showArchived} onChange={setShowArchived}>
  Show archived
</Toggle>

<Toggle icon={StarIcon} label="Favorite" tooltip variant="ghost" />
```

## Related components

- Instead, see Switch: A setting that is saved with a form: use `Switch` or `Checkbox`.
- Instead, see Checkbox: A setting that is saved with a form: use `Switch` or `Checkbox`.
- Instead, see ToggleGroup: Several related toggles that share a value: use `ToggleGroup`.
- Instead, see SegmentedControl: One value out of a few options (View: List, Board): use `SegmentedControl`.
- Instead, see Button: An action that does something once: use `Button`.
- Renders: Icon, Tooltip
