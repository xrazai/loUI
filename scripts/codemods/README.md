# Codemods

jscodeshift transforms that migrate code that uses `loui-ds`. Policy (when a codemod is required, how deprecations are written): [docs/release/codemods.md](../../docs/release/codemods.md).

## Run

```sh
pnpm codemod --list
pnpm codemod <name> <path...> [--dry] [--print] [--option=value ...]
```

- `--dry` reports what would change without writing; `--print` also prints the result.
- Unknown `--key=value` flags are passed to the transform as `options`.
- Files are parsed as TSX; `.ts`, `.tsx`, `.js` and `.jsx` are handled. `node_modules` and `dist` are ignored.

## Transforms

| Name                 | What it does                                                                                                                   | Options                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `rename-prop`        | Renames a prop on one design system component. The sample transform, and the building block of the others.                     | `--component`, `--from`, `--to`                                      |
| `apply-deprecations` | Reads the `deprecated` hints of `manifest.json` and renames every prop whose hint is a plain rename. Other hints are reported. | `--manifest` (default: installed package, then `docs/manifest.json`) |

Both only touch components imported from `loui-ds` or `loui-ds/patterns` (aliases are followed) and leave an element alone, with a report, when it already has the target prop. Namespace imports (`DS.Button`) are not handled yet.

## Add a codemod

1. Create `transforms/<name>.ts` that default-exports `(file, api, options) => string | undefined` (return `undefined` when nothing changed) and exports `parser = 'tsx'`. Reuse `localNames` and `renameProp` from `rename-prop.ts` for the common cases and `parseMigrationHint` from `hint.ts` to read `@deprecated` text.
2. Test it in `codemods.test.ts` with `applyTransform` and an inline fixture: the migrated case, the case that must stay untouched, and a second run that changes nothing.
3. Document it in the table above and name it in the changeset of the breaking change that needs it.

Files in `transforms/` are run by name, so keep helpers outside that folder (`hint.ts`) or export them from a transform that is also a codemod.
