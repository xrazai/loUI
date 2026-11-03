---
'loui-ds': patch
---

`StatCard` accepts a computed `StatCardTone` (for example `tone={flag ? 'warning' : 'neutral'}`) together with `note` or `trend`. A literal non-neutral tone without `note` or `trend` is still a type error. (GAP-032)
