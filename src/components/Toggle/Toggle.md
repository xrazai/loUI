# Toggle

Status: experimental

A button that stays pressed: it switches one setting on or off (bold text, a filter, "show archived") and applies it at once. A native `<button>` with `aria-pressed`, built on React Aria `ToggleButton`. Looks like `Button` (`secondary` and `ghost`), with a clear pressed state.

- TODO `GAP-005`.

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

## Props

| Prop                             | Type                                   | Default       | Notes                                                            |
| -------------------------------- | -------------------------------------- | ------------- | ---------------------------------------------------------------- |
| `children`                       | `ReactNode`                            | required\*    | Label in sentence case. \*Not used by an icon-only toggle.       |
| `icon` + `label`                 | `IconComponent` + `string`             | none          | Icon-only: `label` is required and becomes `aria-label`.         |
| `tooltip`                        | `boolean \| { shortcut?, placement? }` | off           | Icon-only only: shows `label` in a `Tooltip` on hover and focus. |
| `leading`                        | `ReactNode`                            | none          | Decorative node before the label.                                |
| `variant`                        | `'secondary' \| 'ghost'`               | `'secondary'` | As for `Button`. Inside a `ToggleGroup`: the group's `variant`.  |
| `size`                           | `'sm' \| 'md' \| 'lg'`                 | `'md'`        | 32 / 40 / 48px. Inside a `ToggleGroup`: the group's `size`.      |
| `isSelected` / `defaultSelected` | `boolean`                              | `false`       | Controlled / uncontrolled pressed state.                         |
| `onChange`                       | `(isSelected: boolean) => void`        | none          | Called with the new state.                                       |
| `id`                             | `string`                               | none          | Inside a `ToggleGroup`: the toggle's value (required there).     |
| `isDisabled`                     | `boolean`                              | `false`       | Reduced opacity, not focusable.                                  |

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
