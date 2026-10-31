# Button

> An action button built on React Aria's `Button`.

Use one `primary` button per screen. While `isPending` the button keeps its width, shows a
spinner, stays focusable, sets `aria-disabled` and ignores presses, so it can be explained
by a tooltip and focus is never lost.

The control for an action. Built on React Aria's `Button`, styled with tokens and `data-*` state attributes.

- Handoff source: `components/forms/Button` (CMP-FRM-01).

- Import: `import { Button } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Button/Button.tsx`
- Stories (Storybook title `Components/Button`): Default, Primary, Secondary, Ghost, Danger, DangerSolid, Variants, Sizes, WithLeadingIcon, WithTrailingShortcut, FullWidth, Disabled, Pending, PendingVariants, LongText, Rtl, KeyboardActivation, Focused, Hovered

## Props

| Prop        | Type                                                                | Required | Default       | Description                                                                                                                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------- | -------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`   | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'danger-solid'` |          | `'secondary'` | Visual style. - `primary`: the single main action of the screen (light ink on dark). One per screen. - `secondary`: default for other actions. - `ghost`: tertiary, low emphasis actions. - `danger`: destructive action that is not yet confirmed. - `danger-solid`: the confirm button of a destructive dialog. |
| `size`      | `'sm' \| 'md' \| 'lg'`                                              |          | `'md'`        | Height token: `sm` 32px, `md` 40px (default), `lg` 48px.                                                                                                                                                                                                                                                          |
| `fullWidth` | `boolean`                                                           |          | `false`       | Stretch to the width of the container.                                                                                                                                                                                                                                                                            |
| `leading`   | `ReactNode`                                                         |          |               | Node before the label, usually `<Icon size="sm" />`. Decorative; the label names the button.                                                                                                                                                                                                                      |
| `trailing`  | `ReactNode`                                                         |          |               | Node after the label, for example a `Kbd` shortcut hint.                                                                                                                                                                                                                                                          |
| `children`  | `ReactNode`                                                         |          |               | Label: a short verb plus object in sentence case ("Create order").                                                                                                                                                                                                                                                |
| `className` | `string`                                                            |          |               |                                                                                                                                                                                                                                                                                                                   |
| `ref`       | `Ref<HTMLButtonElement>`                                            |          |               | Ref to the underlying `<button>` element.                                                                                                                                                                                                                                                                         |

### Inherited props

- From `AriaBaseButtonProps` (react-aria): `aria-controls`, `aria-current`, `aria-disabled`, `aria-expanded`, `aria-haspopup`, `aria-pressed`, `form`, `formAction`, `formEncType`, `formMethod`, `formNoValidate`, `formTarget`, `name`, `preventFocusOnPress`, `type`, `value`
- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `ButtonProps` (react-aria): `isDisabled`
- From `ButtonProps` (react-aria-components): `isPending`
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

- `variant`: `primary`, `secondary`, `ghost`, `danger`, `danger-solid`
- `size`: `sm`, `md`, `lg`

## Design tokens used

`--ds-accent`, `--ds-button-danger-solid-hover-brightness`, `--ds-button-hover-brightness`, `--ds-control-h-lg`, `--ds-control-h-md`, `--ds-control-h-sm`, `--ds-danger`, `--ds-danger-line`, `--ds-danger-soft`, `--ds-danger-soft-hover`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-sans`, `--ds-fs-body`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-body`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-primary-bg`, `--ds-primary-fg`, `--ds-primary-fg-muted`, `--ds-radius-md`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-space-5`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-text-inverse`, `--ds-weight-medium`

## One primary per screen

Use **one `primary` button per screen**, at the top right of the view, ideally with a keyboard shortcut. Primary is "ink for action": light on dark, never the accent color. Every other action is `secondary` or `ghost`. A second primary button means the screen has two main jobs: split the screen or demote one action.

## When to use

- To run an action in place: "Create order", "Mark as shipped".
- `danger` for a destructive action that opens a confirmation, `danger-solid` for the confirm button inside that dialog (initial focus stays on Cancel).
- `ghost` for low-emphasis actions such as "View all" in a card header.

## When not to use

- To navigate to another page: use `Link` (styled as text) so the browser keeps link semantics.
- For an icon-only action: use `IconButton`, which requires an accessible name.
- For a two-state toggle: use a toggle component.

## Anatomy

`[leading] label [trailing]` inside one native `<button>`. When pending, the content keeps its box (invisible) and a `Spinner` is centered on top, so the width never changes.

## Accessibility

- A real `<button>`; the name is its visible label.
- Keys: `Tab` focuses, `Enter` and `Space` press (RAC). One tab stop.
- Focus: accent border plus a 3px ring through `data-focus-visible`, a transparent outline that forced-colors mode repaints as `Highlight`. Mouse clicks do not show the ring.
- Pending: the button stays in the tab order (focus is not lost while waiting) with `aria-disabled="true"` (React Aria does not set `aria-busy`). React Aria announces the busy state when the focused button becomes pending and again when it finishes. The spinner is named "Loading" (pt-BR "Carregando", from the `Spinner` messages) and sits inside the button so it is part of the button's content.
- Disabled: removed from the tab order. Explain _why_ in nearby text rather than relying on a disabled button alone.
- Targets: at least 32px high, above the 24px minimum of WCAG 2.5.8.
- Contrast: label colors meet 4.5:1 on their backgrounds in every variant; disabled controls are exempt.
- Reduced motion: the only transition is a 150ms background color change, which the global reduced-motion rule neutralizes. The pending spinner turns into a static ring.

## Content rules

- Verb plus object, sentence case: "Create order", "Retry charge". Never a bare "OK" or "Send".
- Destructive buttons name the action: "Delete order".
- No exclamation marks, no emoji, no decorative ellipsis. Use "..." only when the action opens something that needs more input ("Move to...").

## States

Hover (one surface step lighter; primary dims with `--ds-button-hover-brightness`), focus-visible, disabled, pending. Hover, focus and pending are CSS (`data-hovered`, `data-focus-visible`, `data-pending`), never React state. There is no press animation.

## Examples

```tsx
<Button variant="primary" onPress={save}>Save changes</Button>

<Button leading={<Icon icon={PlusIcon} size="sm" />}>Create order</Button>

<Button variant="primary" isPending={isSaving} onPress={save}>
  Save changes
</Button>

<Button trailing={<span className="ds-mono">⌘K</span>}>Search</Button>
```

## Related components

- Instead, see Link: To navigate to another page: use `Link` (styled as text) so the browser keeps link semantics.
- Instead, see IconButton: For an icon-only action: use `IconButton`, which requires an accessible name.
- Renders: Spinner
- Used by: ApprovalCard, ChatPanel, ConfirmDialog, DataTable, DatePicker, FileUpload, InlineConfirm, ShortcutsHelp, ToastRegion
