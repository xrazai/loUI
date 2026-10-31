---
'@loui/ds': patch
---

Export `useUndoable` and its types from the package root. A `Kbd` inside a primary or danger-solid `Button` now reads `--ds-kbd-fg` and `--ds-kbd-border` (new tokens), so the hint keeps 4.5:1 contrast on the filled button. `FormErrorSummary` names a required `Select` by its label instead of its field name. The `ToastRegion` landmark is now named "Toast notifications" (pt-BR: "Notificações temporárias") so it no longer clashes with a Card titled "Notifications"; apps that look the region up by its old name need to update the query. The manifest gains a `recipes` list.
