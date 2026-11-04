---
'loui-ds': patch
---

`Chart` reference line texts no longer print over the highlight text ("Today"), the bars, the line or each other (GAP-057). The text stays at the end of the line when that place is clear; otherwise it moves to the start, below the line, or outside the plot on the end side (the plot gets narrower by the width of the text). New optional `labelPosition` (`'auto' | 'end' | 'start'`, default `'auto'`) on each reference line pins the side. The accessible name, description and hidden table are unchanged. In a right-to-left page the reference texts are no longer pushed off the end of the chart. Charts whose reference text covered marks look different; charts where it was clear are unchanged.
