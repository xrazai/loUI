# Versioning policy

`loui-ds` follows [Semantic Versioning 2.0](https://semver.org/). For a design system, "the API" is more than TypeScript signatures. The public surface is:

- the exports of `loui-ds` and `loui-ds/patterns` (names, props, prop types, defaults, events, and the `data-*` state attributes documented in component pages);
- the files `loui-ds/styles.css`, `tokens.json`, `manifest.json`, `llms.txt` and the `exports` map itself;
- **design tokens**: the CSS custom properties `--ds-*` of the primitive and semantic layers, and the `data-theme` scopes;
- documented behavior: keyboard contract, focus management, announced text (message catalogs) and accessibility conformance.

Component-level tokens (`--ds-<component>-*`) are public only when the component page documents them as a customization point. CSS Module class names are **never** public.

The public API report in `api/` (`pnpm api:check`) is the machine-checked part of this surface.

## What is a major (breaking) change

After `1.0.0`:

- Removing or renaming an export, a prop, a prop value (`variant="ghost"`), a slot or a documented `data-*` attribute.
- Narrowing a type (a prop becomes required, a union loses a member, a callback gets a new required argument) or changing a default in a way that changes rendering or behavior.
- Removing or renaming a token, or changing its **meaning** (a semantic token that was the page background now means a surface).
- Changing a token **value** or component styling so that a component looks different by more than the visual threshold: any change that moves layout (size, spacing, line breaks), changes a color's role, or fails the visual regression suite at its current tolerance. A value change that keeps the same role and stays within tolerance (for example a one or two step adjustment that fixes a contrast failure) is a **minor** and the changeset says so.
- Changing behavior or accessibility semantics consumers can rely on: role, accessible name pattern, keyboard contract, focus order or restoration, event timing, what `onChange` receives.
- Raising the support floor (ADR-0009): dropping a React or Node major, dropping a browser range.
- Changing `exports` so an import path stops resolving; changing the CSS layer order.

Fixing an accessibility defect is never "breaking" by itself, even if behavior changes; ship it as a minor or patch and describe the change. If the fix removes something consumers depend on, deprecate first when feasible.

## Minor

- New components, props, prop values, tokens, messages, locales, entry points.
- Visual refinements within the visual threshold.
- Promoting a component from `experimental` to `stable`.
- Deprecating anything (the notice itself is not breaking).

## Patch

- Bug fixes that make a component match its documented behavior.
- Accessibility fixes, internal refactors, performance, docs, and type corrections that do not reject previously valid code.

## Before 1.0.0

A `minor` may break; a `patch` never does. Breaking changes are still called out under a "Breaking" heading in the changeset so migration is possible. `experimental` components may change in any release (see the [lifecycle](./lifecycle.md)).

## Deprecation window

1. Mark the API `@deprecated` in TSDoc with the replacement (the manifest, the `loui/no-deprecated` lint rule and the MCP server read it; write the hint so [codemods can apply it](./codemods.md)), and set `Status: deprecated` for a whole component. Ship it in a **minor** with a changeset and a migration note.
2. Keep it working and unchanged for at least **two minor releases and 90 days**, whichever is longer. After `1.0.0`, removal happens only in the next major.
3. Remove it in a major (pre-1.0: in a minor announced under "Breaking"). Removal needs its own changeset and ships with a [codemod](./codemods.md).

Security and legal issues can shorten the window; the changeset must say why.

## Support

Only the **latest minor** of the **latest major** is supported with fixes. Security and accessibility fixes may be backported to the previous major for 6 months after a new major. The runtime matrix is ADR-0009 (React `^19`, evergreen browsers, Node 24 for tooling).
