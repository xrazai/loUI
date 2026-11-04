---
'loui-ds': patch
---

Fixes from the 0.7.1 review: `CurrencyInput` keeps one reading of the decimal mark per edit in amount mode (D-M2), ignores input above 15 digits instead of cutting it (D-B2) and no longer puts typed digits before the amount after a click (QA-005); toasts return to the centre as soon as a sheet starts closing (D-B4); `ColorOptionGroup` sets `aria-invalid` in single mode (D-B7); development warnings for `DataTable` percentage widths with `minWidth` (D-B6) and `ActionList` node titles without `textValue` (D-M3). `changes.json` entries now carry `breaking` (D-M1).
