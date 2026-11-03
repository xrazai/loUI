---
'loui-ds': patch
---

A consumer `onKeyDown` on `Input`, `CurrencyInput`, `Textarea` and `SearchInput` no longer swallows every key: unless the handler calls `event.preventDefault()`, the key keeps bubbling so `useHotkeys(..., { allowInEditable: true })` shortcuts (F9, F2, N) still fire while the field has focus. `Combobox` follows the same rule. Documented in the field pages and `docs/architecture/hotkeys.md`, with a keyboard test (GAP-035).
