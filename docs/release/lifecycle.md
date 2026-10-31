# Component lifecycle

Every component and pattern has one status, written as `Status: experimental | stable | deprecated` under the title of its `<Name>.md` page. The manifest (`docs/manifest.json`, `status` field), `llms.txt`, Storybook and the MCP server read it. Agents must not use `deprecated` components and should avoid `experimental` ones in recipes.

```
proposal --> experimental --> stable --> deprecated --> removed
```

| Status         | Meaning                                                                                | Change policy                                                                                        |
| -------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| proposal       | An issue or ADR describing the need, API sketch and a11y pattern. No code in `src/`.   | n/a                                                                                                  |
| `experimental` | Implemented and tested, but the API may still change. Default for every new component. | May change in any release; each change needs a changeset. Not allowed in `src/recipes/`.             |
| `stable`       | API, behavior and tokens are covered by the [versioning policy](./versioning.md).      | Breaking changes only in a major, after a deprecation window.                                        |
| `deprecated`   | Replaced or no longer recommended. Still works.                                        | Supported for the [deprecation window](./versioning.md#deprecation-window), then removed in a major. |
| removed        | Gone from the exports.                                                                 | The changeset documents the migration.                                                               |

## Owner

Every component has an owner (a person or team), recorded in the proposal issue and, once the project has CODEOWNERS, in `.github/CODEOWNERS`. The owner reviews changes to the component, decides on graduation and deprecation, and answers accessibility regressions. Until CODEOWNERS exists the project owner is the default owner.

## 1. Proposal checklist

- [ ] Problem and users: why no existing component solves it (check the "When not to use" lists).
- [ ] Built on React Aria Components wherever a behavior pattern exists (ADR-0001); the WAI-ARIA pattern is named.
- [ ] API sketch using the shared vocabulary (`variant`, `size`, `tone`, `isDisabled`, `onChange(value)`).
- [ ] Belongs to the core or the `patterns` entry point (ADR-0008); no domain vocabulary in core.
- [ ] Owner named.

## 2. Experimental: definition of done

The full Definition of Done in AGENTS.md section 8 and `docs/contributing/component-workflow.md`: tokens-only CSS module, stories for every state, unit tests, axe tests, keyboard-contract tests, visual baseline, `<Name>.md` with `Status: experimental`, SSR case in `src/ssr.test.tsx`, regenerated manifest, reviewed `pnpm api:update`, and a minor changeset.

## 3. Graduating to stable

All of the following must hold, and the pull request that changes the status links the evidence:

- [ ] **Time in use:** at least one minor release as `experimental`, used in at least one real screen or recipe (not only stories).
- [ ] **API settled:** no API-changing changeset for it in the last two releases; props documented in TSDoc; open API questions closed or recorded in an ADR.
- [ ] **Accessibility:** axe, keyboard-contract and forced-colors tests green; the WCAG 2.2 AA checks in `docs/a11y/` completed; a manual screen reader pass (NVDA or VoiceOver) recorded for composite widgets.
- [ ] **Visual:** baselines for every state on Linux (CI) committed and stable across consecutive runs.
- [ ] **Quality gates:** SSR render test; the `'use client'` boundary verified in `examples/next-app` when the component is meaningful on the server; tree-shaking check and size budgets unaffected.
- [ ] **Docs:** `<Name>.md` complete (when to use, when not to use, content rules, accessibility, messages in `en` and `pt-BR`), Storybook page with controls, entry in `llms.txt` through the manifest.
- [ ] **Compatibility:** `api/*.api.md` shows the shape the owner commits to.
- [ ] **Owner sign-off** and a minor changeset announcing the promotion.

## 4. Deprecating

- [ ] A replacement exists and is `stable` (or the removal is justified in the changeset).
- [ ] TSDoc `@deprecated` with the replacement and a migration example; `Status: deprecated` in the page.
- [ ] Minor changeset with the migration note; follow the [deprecation window](./versioning.md#deprecation-window).
- [ ] Removal in a major: delete code, stories, tests and baselines in the same pull request, update `api/`, and describe the migration in the changeset.
