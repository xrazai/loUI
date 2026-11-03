# StatCard

Status: experimental

An indicator card for the top of a screen: a mono caption, a large mono number, an optional small visual and a short note or trend in words.

## When to use

- A handful of key numbers at the top of a page (Today, Purchases, Finance, Reports).
- A number with context: "3 sales · average ticket $120.00", or a change versus a previous period.

## When not to use

- Many numbers that need comparing or sorting: use `DataTable`.
- A value the user edits: use a field.
- A status without a number: use `Badge`.

## Anatomy

```
dl.root (surface, 1px line, radius lg, padding 20)
  dt   label        mono caption, uppercase by CSS
  dd   value        mono 24px (md) or 30px (lg); colored by tone
  dd   aside        short mono text at the end of the label row (optional)
  dd   children     small visual, e.g. a 4px ProportionBar (optional)
  dd   note         trend (arrow + "Up 12%" + comparison) and/or note text
```

## Props (key ones)

| Prop       | Type                                        | Default   | Notes                                                                                   |
| ---------- | ------------------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `label`    | `ReactNode`                                 | -         | A few words: "Sold", "Overdue"                                                          |
| `value`    | `ReactNode`                                 | -         | Format with `formatCurrency` / `formatNumber`                                           |
| `size`     | `md \| lg`                                  | `md`      | `--ds-fs-num` / `--ds-fs-num-lg`                                                        |
| `tone`     | `neutral \| success \| warning \| danger`   | `neutral` | Color of the value. Any other tone requires `note` or `trend` (type error, dev warning) |
| `note`     | `ReactNode`                                 |           | Context in words                                                                        |
| `noteTone` | `neutral \| success \| warning \| danger`   | `neutral` | Color of the note text                                                                  |
| `trend`    | `{ direction, value?, tone?, comparedTo? }` |           | Change as text: "Up 12%", "Down 4.5%", "No change". `value` is a ratio (`0.12`)         |
| `aside`    | `ReactNode`                                 |           | "42%"                                                                                   |
| `children` | `ReactNode`                                 |           | Between the value and the note                                                          |
| `messages` | `Partial<messages>`                         |           | `trendUp(percent)`, `trendDown(percent)`, `trendFlat`                                   |

## Accessibility

- It is a description list: the label is the term (`dt`), the value and the note are its descriptions (`dd`). A screen reader announces "Sold, $37,655.30, Up 12% vs previous 30 days".
- Color is never the only signal. A non-neutral `tone` must come with a `note` or a `trend` (enforced by types, with a one-time development warning for untyped callers). The trend direction is written as text and the arrow icon is decorative.
- Contrast: the signal colors on `surface` pass 4.5:1; notes use `text-2`; the caption uses `text-3` (do not put the card on a raised or hover surface).
- No interaction. If the card should open something, wrap the label in a link or add a button in the note area.

## Content rules

- Tone only changes when there is something to do: `danger`/`warning` for numbers that ask for action, `success` for "all done". Do not decorate.
- At most four cards per row; use a grid with `repeat(auto-fit, minmax(240px, 1fr))` so large numbers are not cut.
- Trends say what changed and compared to what ("Up 12% vs previous 30 days"). When up is bad (costs, returns) set `trend.tone: 'danger'`.

## Example

```tsx
<StatCard
  label="Sold"
  value={formatCurrency(3765530, 'USD', locale)}
  trend={{ direction: 'up', value: 0.12, comparedTo: 'vs previous 30 days' }}
/>
<StatCard label="Overdue" value="$96.40" tone="danger" note="Water bill since Oct 28" />
```

A computed tone type-checks as long as `note` or `trend` is passed; a literal non-neutral tone without either is still a type error:

```tsx
<StatCard
  label="Overdue"
  value={total}
  tone={overdue ? 'warning' : 'neutral'}
  note={`${count} bills`}
/>
```

## Differences from the handoff

- Semantics: `dl`/`dt`/`dd` instead of anonymous `span`s.
- `tone` needs text: `note` or the new `trend` prop, which renders "Up 12%" through messages with an arrow, so a change is never only a colored number.
- `noteTone` is `neutral | success | warning | danger` (was `muted | ...`); notes use `text-2` instead of `text-3`.
- Sizes use the `num` / `num-lg` type tokens; padding and gap are component tokens (`--ds-stat-card-*`). No `style` prop.
