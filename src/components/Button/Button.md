# Button

The control for an action. Built on React Aria's `Button`, styled with tokens and `data-*` state attributes.

- Status: experimental
- Handoff source: `components/forms/Button` (CMP-FRM-01).

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

`[leading] label [trailing]` inside one native `<button>`. When pending, the label stays visible, dimmed with `--ds-button-pending-label-opacity` (0.65), and a `Spinner` takes the leading position: it sits over the `leading` icon when there is one, otherwise before the label, using the button padding (the content is pulled outward by half of spinner plus gap on each side), so the width never changes. The dimmed label is a busy state, not a disabled one; the label keeps meaning, so users still see what the action is doing (for example "Connecting").

## Props

| Prop         | Type                                                                | Default       | Notes                                                                                                   |
| ------------ | ------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------- |
| `variant`    | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'danger-solid'` | `'secondary'` | See above.                                                                                              |
| `size`       | `'sm' \| 'md' \| 'lg'`                                              | `'md'`        | 32, 40, 48 px (`--ds-control-h-*`). Taller if the label wraps.                                          |
| `fullWidth`  | `boolean`                                                           | `false`       | Fills the container.                                                                                    |
| `leading`    | `ReactNode`                                                         | none          | Usually `<Icon size="sm" />`. Decorative.                                                               |
| `trailing`   | `ReactNode`                                                         | none          | For example a shortcut hint in mono.                                                                    |
| `isPending`  | `boolean`                                                           | `false`       | Busy: dimmed label plus spinner, `aria-disabled`, presses and form submission ignored, stays focusable. |
| `isDisabled` | `boolean`                                                           | `false`       | Native `disabled`: not focusable, 35% opacity.                                                          |
| `onPress`    | `(e: PressEvent) => void`                                           | none          | React Aria press event (mouse, touch, keyboard, screen reader). Prefer it over `onClick`.               |
| `type`       | `'button' \| 'submit' \| 'reset'`                                   | `'button'`    | Stays `button` so a button never submits a form by accident.                                            |
| `className`  | `string`                                                            | none          | Merged with the component class.                                                                        |

Other React Aria `Button` props (`form*`, `autoFocus`, `aria-*`, `onHoverStart`, ...) and `ref` pass through. `style` and render-prop children are not accepted.

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

## Differences from the handoff

- Hover is CSS, not JS state.
- `isPending` replaces the "disabled plus spinner in leading" recipe: width-stable, focusable, announced, and it ignores presses.
- Sizes are 32 / 40 / 48 px. The handoff `Button.prompt.md` said 28 / 32 / 40; the code and the tokens win.
- `onPress` (React Aria) is the primary event; `disabled` is now `isDisabled`.
- `style` was removed; the primary hover brightness (0.88) and the danger-solid one (0.9) are component tokens.
- Wrapping instead of `white-space: nowrap`, so long labels never overflow.
