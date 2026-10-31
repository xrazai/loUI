# Typography

Two typefaces, ten roles, one rule: nothing is smaller than 11.5px. Geist carries the interface; Geist Mono carries data. Both are self-hosted (no runtime fetch), with metric-matched fallback faces so text does not jump while fonts load.

## Typefaces

| Variable         | Face       | Weights       | Use                                                            |
| ---------------- | ---------- | ------------- | -------------------------------------------------------------- |
| `--ds-font-sans` | Geist      | 400, 500, 600 | Interface text: titles, body, labels, buttons.                 |
| `--ds-font-mono` | Geist Mono | 400, 500      | Data: numbers, codes, identifiers, dates, shortcuts, captions. |

Weight roles: **400** for body text, **500** for labels and mono captions (not for body paragraphs), **600** for display, title and heading. Do not add a heavier weight.

<!-- demo:families -->

## The scale

Use a role, never a free size. The roles are the tokens `--ds-fs-*` (size), `--ds-lh-*` (line height) and `--ds-weight-*`. Sizes in px, line heights in px.

<!-- demo:scale -->

| Role    | Face     | Use it for                                                              |
| ------- | -------- | ----------------------------------------------------------------------- |
| display | sans 600 | One hero statement per view, at most.                                   |
| title   | sans 600 | Page and section titles.                                                |
| heading | sans 600 | Dialog titles, card headings.                                           |
| body    | sans 400 | Running text; the base size of the app.                                 |
| small   | sans 400 | Descriptions, helper text, table cells.                                 |
| label   | sans 500 | Field labels, chips, compact buttons.                                   |
| meta    | mono 400 | Dates, phone numbers, counts beside titles.                             |
| caption | mono 500 | Group captions. Uppercase by CSS, +8% tracking. The floor of the scale. |
| num     | mono 500 | Indicator figures (24px).                                               |
| num-lg  | mono 500 | Highlighted totals such as a balance (30px).                            |

## Tracking and case

- **Display** has -2% tracking (-0.68px) and **title** -1% (-0.22px). Tight tracking only works at large sizes: never apply it to body text.
- **Caption** has +8% tracking (0.92px) and is the only role set in uppercase. Uppercase is applied with CSS (`text-transform`), so write the source text in sentence case ("Order details", not "ORDER DETAILS"). Everywhere else, use sentence case too.
- Tracking tokens are in px because DTCG dimensions have no `em`. They are exact for the fixed size of each role.

## The 11.5px floor

`--ds-fs-caption` (11.5px) is the smallest font size in the system and it is enforced by a test. Do not use a smaller size, in CSS or in a chart, and do not scale text down with transforms. Use `meta` (12px) or `caption` for the smallest text; never invent an in-between.

## When to use mono

Use Geist Mono for anything that is data rather than prose, and turn on tabular figures so columns align.

- Numbers and amounts: `$1,240.00`, `3 / 12`.
- Codes and identifiers: `ORD-1048`, `SKU-0032`.
- Dates and phone numbers beside a title.
- Keyboard shortcuts: `Ctrl K`.
- Group captions.

Do not set sentences, labels or buttons in mono. Format amounts and dates with `Intl` (the `formatCurrency` helper), never by hand.

<!-- demo:mono -->

## Tabular numerals

`font-variant-numeric: tabular-nums` gives every digit the same width, so figures in a column line up and live counters do not jitter. The `mono` prop of `Text` turns it on; for custom elements use the `.ds-tabular-nums` utility class. Mono roles (`meta`, `num`, `num-lg`) should always have it on.

<!-- demo:tabular -->

## Heading and Text

`Heading` separates the semantic level (`h1` to `h6`, the page outline) from the visual size (`display`, `title`, `heading`). Choose the level for structure and the size for design; keep levels sequential with one `h1` per page. `Text` sets size, line height, tone and an optional mono face, and the `as` prop picks the element.

<!-- demo:components -->

Use `Heading` and `Text` instead of setting font properties by hand. Do not use a heading element only for its size.
