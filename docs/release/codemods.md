# Codemods and migration hints

Policy for breaking changes and deprecations (AI-011). Companion to the [versioning policy](./versioning.md) and the [component lifecycle](./lifecycle.md). The tooling lives in [`scripts/codemods/`](../../scripts/codemods/README.md).

## Policy

1. **Every breaking change ships a codemod.** A change that the [versioning policy](./versioning.md) calls major (or, before 1.0.0, a "Breaking" minor) is not done until a transform in `scripts/codemods/transforms/` migrates consumer code, has a test with a fixture, and is named in the changeset (`pnpm codemod <name> src`). If a change cannot be automated (a behavior change, a removed concept), the changeset says so and gives the manual steps; the PR states why no codemod is possible. "It is only a small rename" is not an exemption: renames are exactly what codemods do well.
2. **Every deprecation carries a migration hint.** The TSDoc `@deprecated` tag must say what to use instead, in a form a machine can read:

   ```ts
   /**
    * Visual style of the badge.
    * @deprecated Use tone instead.
    */
   color?: 'neutral' | 'danger';
   ```

   Accepted forms for an automatic rename: `Use x.`, ``Use `x` instead.``, `Use x instead of y.`, `Renamed to x.` where `x` is a single identifier. Any other wording ("Use tone together with variant", "Removed in the next major") is treated as manual: tools show it but do not apply it.

3. **Deprecations are applied by tools, not memory.** The hint is copied into `docs/manifest.json` as the prop's `deprecated` field (a string; empty when the tag has no text). Three consumers read it:
   - `eslint-plugin-loui/no-deprecated` warns on the prop with the hint in the message;
   - the MCP server shows it in `get_component` (`DEPRECATED: Use tone instead.`) and `validate_snippet` reports the warning to the agent that wrote the code;
   - `pnpm codemod apply-deprecations <paths>` renames every deprecated prop whose hint is a plain rename.
4. **Deprecate first, remove later.** Follow the [deprecation window](./versioning.md#deprecation-window): the deprecation ships in a minor together with its hint; removal ships in a major (pre-1.0: a "Breaking" minor) together with a codemod. When removal needs more than a rename, write a dedicated transform and keep `apply-deprecations` for the plain renames.
5. **Codemods are idempotent and conservative.** Running twice changes nothing the second time. A transform edits only elements of components imported from `loui-ds` or `loui-ds/patterns`, leaves code it cannot prove safe (for example an element that already has the target prop) untouched and reports it for manual review. It never reformats unrelated code.
6. **Codemods stay for the life of the major.** A transform is kept until the next major after the one that required it, so consumers can skip a release.

## Checklist for a breaking change

- [ ] `@deprecated <hint>` was released in an earlier minor (or the changeset explains why not).
- [ ] Transform in `scripts/codemods/transforms/<name>.ts` with a fixture test in `scripts/codemods/`.
- [ ] `docs/manifest.json` regenerated (`pnpm manifest:build`) and the hint shows in `get_component`.
- [ ] Changeset with a "Breaking" heading, the codemod command and any manual steps.
- [ ] `pnpm test:unit` passes.

## Using codemods

```sh
pnpm codemod --list
pnpm codemod apply-deprecations src --dry --print
pnpm codemod rename-prop src --component=Button --from=legacyTone --to=variant
```

The transforms are not part of the published package yet (it is private, ADR-0004): consumers run them from a checkout of this repository, pointing the paths at their own project. Review the diff and run the tests: a codemod is a mechanical edit, not a proof.
