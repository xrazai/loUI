# Changesets

Run `pnpm changeset` to record a release note for your change. See https://github.com/changesets/changesets.

## Breaking changes

If the change alters a default, a layout (size, spacing, line breaks, a breakpoint) or widens an output type (a union gains a member, a field becomes optional, a `string` becomes `ReactNode`), add a paragraph to the changeset that starts with `Breaking:` and says what a consumer does. Pick at least `minor`; while the major is `0` a breaking change is a minor bump, and a `patch` never breaks. Also end the task log entry in `CHANGELOG.md` with `**Breaking:** <what to do>` so `changes.json` flags it. Details: `docs/release/versioning.md`.
