---
'loui-ds': patch
---

`Stack`, `Inline` and `Grid` `gap` now accept the space key as a number (`gap={4}`) or as its string form (`gap="4"`), matching the generated docs and the AI manifest. The manifest generator prints numeric literal types bare (`1 | 2 | 3`) instead of quoting them, and a new test type-checks every documented prop value (GAP-021). New exported type `SpaceValue`.
