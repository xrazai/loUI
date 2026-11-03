---
name: loui-ds
description: Build product UI with Loui DS (loui-ds), the dark minimal React design system. Use when the user asks to build, change or review UI "with Loui DS", "with the design system", or any screen, form, table, dialog, dashboard or page that should use loui-ds components and tokens. Covers which sources to read, the design rules, content and accessibility must-haves, and validating generated code.
---

# Building UI with Loui DS

Loui DS is a React 19 design system (React Aria Components, CSS Modules, DTCG tokens) for internal tools, dashboards and apps. Use only what the package exports. Never invent component, prop or token names.

## 1. Get the facts first

Do not write from memory. Pick one:

- **MCP server `loui-ds`** (registered in this repo's `.mcp.json`; see `tools/mcp-server/README.md`):
  - `list_components` to find the right component (filter by query, group, status).
  - `get_component` for the import statement, props, variants, message keys, keyboard notes and examples.
  - `search_tokens` for CSS variables and allowed text/surface pairings.
  - `get_guidelines` (principles, content, accessibility, getting-started, using-with-ai).
  - `get_recipe` for a tested composition; `validate_snippet` to check your code.
- **No MCP?** Read `docs/llms.txt` (index and rules), then `docs/ai/components/<Name>.md`, `docs/manifest.json` and `docs/tokens.json`. `docs/llms-full.txt` has everything in one file. Published copies: `loui-ds/llms.txt`, `loui-ds/manifest.json`, `loui-ds/tokens.json`.
- Repo rules for contributors: `AGENTS.md`. For users of the package, the guides in `docs/guides/` are the source.

## 2. The three rules

1. **One accent.** Blue (`--ds-accent`) is only for focus, selection and links. Never for buttons or large fills.
2. **Ink for action.** One `Button variant="primary"` per screen, top right. Everything else is `secondary` or `ghost`.
3. **Borders first.** Hierarchy comes from surface plus border. Shadows only on overlays (menus, toasts, dialogs, sheets).

Also: no gradients, no emoji, no custom colors. Color never carries meaning alone: pair it with text or a named icon.

## 3. Workflow

1. Prefer a **recipe** (`get_recipe`, `docs/recipes/`) or a story/example from `get_component` over inventing markup. If there is no recipe, compose from component examples.
2. Choose components from `list_components`. Read `whenNotToUse` and `related.alternatives` before settling.
3. Skip `deprecated` components. Do not use `experimental` ones in generated code unless the user asks or no stable option exists; say so when you do.
4. Import from `loui-ds` (or `loui-ds/patterns`) exactly as `importStatement` shows. Load `loui-ds/styles.css` once.
5. Write the code, then run **`validate_snippet`** on it and fix every error. Treat warnings as defects unless you can justify them. In a project that has `eslint-plugin-loui`, also run ESLint (`pnpm lint`).
6. Run the project's typecheck and tests.

## 4. Tokens and layout

- Colors, spacing, radius, type and motion come from `--ds-*` variables only: `var(--ds-text)`, `var(--ds-space-4)`. Use semantic tokens; primitives (`--ds-gray-*`) are not for app code.
- No raw hex/rgb/hsl, no `px` for spacing, no z-index numbers, no visual inline styles.
- Check `search_tokens` pairings before putting text on a surface: only listed pairings meet WCAG contrast.
- Use layout components (such as `Stack` or `Container`, when `list_components` shows them) for spacing and structure instead of ad hoc wrappers; check `list_components` for what exists.

## 5. Content rules

Machine-readable in `docs/ai/content-rules.json`, prose in the content guideline (`get_guidelines` topic `content`).

- English, sentence case, direct and calm. Speak to "you", usually implied.
- Buttons are verb + object: "Create order", "Mark as shipped". Never a bare "OK", "Done" or "Send".
- Errors say how to fix: "Enter a complete email address."
- Empty states: what happened and what to do. Toasts: short, past tense ("Order #1051 created").
- Destructive actions ask in a dialog that names the object and the consequence; initial focus on Cancel. Reversible actions offer Undo instead.
- No exclamation marks, no emoji, no decorative ellipses ("…" only on menu items that open something).
- Numbers, codes and amounts use mono. Format dates, numbers and money with the exported utilities, never by hand. Money is integer minor units plus an ISO 4217 code.

## 6. Accessibility must-haves

- Every interactive element has an accessible name. Icon-only controls use `IconButton` with a required `label` (or `Icon` with `label`).
- Keyboard first: everything works with Tab, Enter, Space, Esc and arrows as the component documents. Give the primary action a shortcut when it fits.
- Visible focus is built in; never remove it. Do not reintroduce `outline: none`.
- Form fields have visible labels, and errors are text linked to the field, not color alone.
- Heading levels follow the page outline (`headingLevel` props exist where relevant).
- Minimum text size is the caption size; touch targets follow the component sizes.

## 7. Text and i18n

- No user-visible string literals inside reusable components. Wrap the app in `DSProvider` (`locale`, `messages` overrides, `navigate` for the router). Component strings have message keys (shown by `get_component`).
- Your own screens may contain copy, but it still follows section 5.
- Lists are alphabetical by default (`sortByText`/`compareText`), except tasks (by urgency) and dated records (newest first).

## 8. Before you hand back

- `validate_snippet` reports no errors; warnings are fixed or explained.
- One primary action, no raw colors/spacing, every control named, no deprecated components.
- You used only names that exist in the manifest, and state any gap (a missing component or token) instead of faking it with custom CSS.

Sources: `docs/llms.txt`, `docs/guides/principles.md`, `docs/guides/accessibility.md`, `docs/guides/content-guidelines.md`, `docs/ai/content-rules.json`, `tools/eslint-plugin/README.md`, `tools/mcp-server/README.md`.
