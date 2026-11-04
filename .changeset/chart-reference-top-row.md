---
'loui-ds': patch
---

`Chart` reference line texts with `labelPosition: 'auto'` no longer cover the highlight text ("Hoje"), bars or the line in narrow charts (GAP-057, reopened). When no place along the line is clear and the end margin would be too wide, the text goes to a row above the plot after a short sample of its line, like a legend; the plot gets shorter by that row. The accessible name, description and hidden table are unchanged. Charts whose text was already clear look the same.
