---
'loui-ds': minor
---

`Combobox` gets `selectFirstOnEnter` (default `false`): `Enter` with no option highlighted selects the first enabled filtered option instead of dropping the typed text. The `filter` function now receives the whole option as a third argument, `(label, query, option)`, so options can be searched by a code or `meta`; two-argument filters and the accent-insensitive default keep working (GAP-033).
