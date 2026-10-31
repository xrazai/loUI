# Consumer examples (REL-001)

Two minimal apps that consume `@loui/ds` **from a packed tarball** (`pnpm pack`), exactly as an
external project would. They exist to catch packaging bugs the workspace cannot: a wrong
`exports` map, missing files, CSS or fonts that do not resolve, missing `'use client'`
directives, broken types.

| App        | What it proves                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `vite-app` | Vite 8 + React 19 client app: `tsc` type-checks against the shipped `.d.ts`, `vite build` bundles JS, `styles.css` and fonts. |
| `next-app` | Next.js 16 App Router: a **Server Component** imports `@loui/ds` directly; `next build` must succeed.                         |

Run both from the repository root:

```sh
pnpm build            # if dist/ is stale
pnpm examples:verify  # pack, install each example in isolation, build, assert the output
pnpm examples:verify --only vite   # or: --only next
```

The examples are intentionally **not** part of the root workspace (`pnpm-workspace.yaml` only
lists `tools/*`) and are installed with `--ignore-workspace`, so they resolve dependencies the
way a real consumer does. Their lockfiles are not committed because the tarball hash changes on
every build.
