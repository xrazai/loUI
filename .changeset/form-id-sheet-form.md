---
'loui-ds': minor
---

`Form` now types and documents `id`, `onKeyDown`, `onKeyUp`, `onFocus` and `onBlur`, so a submit button elsewhere (such as a `Sheet` footer) can target it with `form="id"`. New `SheetForm` recipe: a form in a `Sheet` submitted natively from the footer. (GAP-023)
