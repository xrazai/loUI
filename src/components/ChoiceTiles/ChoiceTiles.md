# ChoiceTiles

Status: experimental

Single-choice tiles: a labelled group where the options are drawn as large buttons with a label and an optional meta line. Built on React Aria `RadioGroup` with custom radio buttons, so it is a real `radiogroup` with roving focus.

- Handoff source: `components/erp/ChoiceTiles.jsx` (TODO `CMP-PAT-08`).

## When to use

- A choice with 2 to 8 short options where each option deserves weight: delivery method, plan, size, payment type.
- When a secondary fact helps decide (a price, a duration, a code): use `meta`.

## When not to use

- For a view mode or a small filter: use `SegmentedControl`.
- For a long list of options or long descriptions: use `RadioGroup` (with descriptions) or `Select`.
- For several selections at once: use `CheckboxGroup` or `TagGroup`.

## Anatomy

```
div[role=radiogroup] aria-labelledby=label
  label                      (group label, from `label`)
  div.grid                   (responsive grid, at most `columns` columns)
    div > label.tile         (one per option; hidden native radio inside)
      label text
      meta                   (optional, mono; text or a short inline node)
      detail                 (optional second line, body font; the radio's description)
  description / error
```

## Props

| Prop                                                          | Type                   | Default      | Notes                                                         |
| ------------------------------------------------------------- | ---------------------- | ------------ | ------------------------------------------------------------- |
| `options`                                                     | `ChoiceTilesOption[]`  | required     | `{ value, label, meta?, detail?, isDisabled? }`.              |
| `label` / `aria-label` / `aria-labelledby`                    | `ReactNode` / `string` | one required | Names the group. Enforced by the types.                       |
| `value` / `defaultValue` / `onChange(value)`                  | `string`               | none         | Controlled / uncontrolled selection (React Aria names).       |
| `columns`                                                     | `number`               | `2`          | Maximum columns. Fewer on narrow containers (min tile 120px). |
| `size`                                                        | `'md' \| 'lg'`         | `'lg'`       | Minimum tile height: 40px or 48px.                            |
| `description`, `errorMessage`                                 | `ReactNode`            | none         | Linked with `aria-describedby`.                               |
| `isDisabled`, `isRequired`, `isInvalid`, `isReadOnly`, `name` | -                      | -            | Group state, forwarded to React Aria.                         |

## Accessibility

- Semantics: `radiogroup` of native radio inputs; the tile is the radio's label.
- Keyboard: one tab stop; arrows (`←` `↑` previous, `→` `↓` next) move focus and select, wrapping at the ends; `Space` selects the focused tile. Disabled tiles are skipped.
- State is not color alone: the selected tile has a doubled (2px) accent border, a soft fill and ink text, and screen readers get "checked".
- Boundaries: unselected tiles use `--ds-line-control` (3:1) and hover brightens the border instead of changing the fill, so the 3:1 holds in every state. The meta line uses `--ds-text-2` (`--ds-text-3` fails 4.5:1 on the selected fill).
- Focus: accent border plus ring. Forced colors: the selected border uses `Highlight`.

- `detail` is linked with `aria-describedby`: the radio's name stays the label plus the meta, and the detail is read after it as the description. Use it for a short helpful sentence, not for essential text.

## Content rules

- Labels in sentence case, one to three words. Put the differentiating fact in `meta`, not in the label.
- Keep the same shape across tiles: avoid `meta` on some tiles only.

## Examples

```tsx
<ChoiceTiles
  label="Delivery"
  columns={2}
  options={[
    { value: 'standard', label: 'Standard', meta: '3-5 days' },
    { value: 'express', label: 'Express', meta: '1 day' },
  ]}
  value={method}
  onChange={setMethod}
/>
```

## Differences from the handoff

- A `div role="radiogroup"` of `button role="radio"` had no roving focus or arrow keys; it is now React Aria `RadioGroup` (one tab stop, arrows, `Space`).
- The group is named with `label` (rendered and wired with `aria-labelledby`), `aria-label` or `aria-labelledby`; the handoff had no name.
- Columns are responsive: `columns` is a maximum and the grid collapses by minimum tile width. `size` is `md`/`lg` (tokens).
- Strings of options are plain props; `onChange` receives the value.
- Unselected borders are `--ds-line-control` instead of `--ds-line` (3:1), and the selected state adds a thicker border.
