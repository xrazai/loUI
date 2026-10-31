# Content guidelines

How the interface talks. These rules apply to every string in the UI: labels, buttons, titles, toasts, errors, empty states and confirmations. They are also available as data in `docs/ai/content-rules.json`.

## Tone

- **Direct, calm, technical without jargon.**
- Speak to "you", usually implied: "Select an order", not "Please select an order".
- State what happened and what to do. Do not blame the user and do not dramatize.

## Casing

- **Sentence case everywhere:** titles, buttons, tabs, menu items. "New order", not "New Order" or "NEW ORDER".
- Uppercase appears only in mono group captions, and it is applied with CSS, never typed.

## Buttons

- **A verb plus an object:** "Create order", "Mark as shipped", "Retry charge".
- Never a bare "OK", "Send" or "Submit".
- Destructive buttons name the action: "Delete order".

## Confirmations

Deleting always asks. The dialog names the object and the consequence in one sentence, the red button names the action, and initial focus is on Cancel.

> **Delete "Northwind Web"?**
> "Northwind Web" and its 14 environments will be removed. This can't be undone.
> [Cancel] [Delete project]

Reversible actions (mark, link, change status) do not ask. They happen and offer "Undo" in a toast.

## Toasts

Short and in the past tense: what just happened.

- "Order #1051 created"
- "3 items archived"

Not "Creating order", not "Success!", not "Order was successfully created".

## Empty states

Say what happened, then what to do.

- "No orders found. Try another filter or search term."

## Errors

Say how to fix the problem.

- "Enter a complete email address."

Not "Invalid email!". Link the message to its field (`aria-describedby`); the `Field` components do this for you.

## Punctuation and symbols

- **No emoji, no exclamation marks, no decorative ellipses.**
- The ellipsis character appears only on menu items that open something that needs more input: "Move to…".
- No "Loading..." or "Saving...". Use a spinner or skeleton, and state the result when it is done.

## Numbers, codes and shortcuts

- Numbers, codes, amounts and shortcuts are set in the mono font (Geist Mono): `ORD-1048`, `$1,240.00`, `⌘K`.
- **Never build currency, dates or numbers by hand.** Format them with `Intl` for the active locale through the provided utilities: `formatCurrency`, `formatDate`, `formatNumber`, `formatPercent`, `formatRelativeDays`.
- Money is an integer in minor units plus an ISO 4217 currency code (ADR-0006). `formatCurrency(124000, 'USD', locale)` renders `$1,240.00`.

## Lists

Alphabetical by default (locale-aware, accent-insensitive), including groups, columns and select options. Use `sortByText`. Exceptions: tasks (by urgency) and dated records (newest first).

## What belongs to the product, not to the design system

Domain vocabulary (for example, an ERP rule that sold units are always called "Quantity") belongs to the product's own guidelines. The design system's built-in strings stay generic.

## Built-in strings and translation

Components contain no user-visible string literals. Every built-in label and ARIA string lives in the component's message catalog (`<Name>.messages.ts`), is written in English following the rules above, and can be overridden per instance or through `DSProvider`. `pt-BR` ships with the library and follows the same tone.
