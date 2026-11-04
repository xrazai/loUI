# Developing the design system and an app together

Use this guide when you change `loui-ds` and a consuming app at the same time and cannot wait for an npm release after every fix. Everything here was run against a throwaway Vite app on 2026-11-03 (Vite 8, React 19.3, pnpm 12.16, Windows); the "Measured" notes are real numbers from that run.

There are three ways to get the design system into an app. Pick by what you need to learn:

| Route       | Use it for                                    | Speed                    | Matches production? |
| ----------- | --------------------------------------------- | ------------------------ | ------------------- |
| **Link**    | Editing the design system while the app runs  | About 1.5 s per change   | Mostly (see below)  |
| **Tarball** | Checking packaging before a release           | One build and one `pack` | Yes                 |
| **npm**     | The app's normal state; every finished change | One release (~5 min)     | Yes                 |

Rule of thumb: link while you iterate, release when a batch is done, and never leave a `link:` or `file:` dependency committed in the app.

## 1. Link (fast loop)

### In the design system repository

```sh
pnpm dev:lib
```

`pnpm dev:lib` runs `tsdown --watch`: it builds `dist/` once and rebuilds on every change in `src/`, including the CSS Modules, the tokens CSS and the `.d.ts` files the app type-checks against.

Measured: first build 4.4 s, rebuild after a CSS change 1.4 s.

What the watch build does not do:

- It wipes `dist/` when it starts (`clean: true`), so an app that is already running shows errors for about 5 seconds. Start the watcher first.
- It skips `pnpm manifest:build`, so `dist/manifest.json`, `tokens.json` and `llms*.txt` are missing until you run `pnpm build`. Apps almost never import them at runtime.
- It does not regenerate tokens. After editing `src/tokens/**`, run `pnpm tokens:build` once; the watcher then picks up the new `src/styles/tokens.css`.

Stop the watcher before running `pnpm build` or `pnpm check`.

### In the app

1. Point the dependency at the repository folder:

   ```json
   "dependencies": { "loui-ds": "link:../loui-ds" }
   ```

   Use the real relative path. Run `pnpm install`.

2. Vite needs two settings (`vite.config.ts`). Without them the app breaks in two different ways, both reproduced:

   ```ts
   import { defineConfig } from 'vite';

   export default defineConfig({
     // The design system resolves `react` from its own node_modules; without this the page
     // renders two copies of React and fails with "Invalid hook call" or
     // "Cannot read properties of null (reading 'useMemo')".
     resolve: { dedupe: ['react', 'react-dom'] },
     // Fonts live in ../loui-ds/dist/fonts, outside the app root: without this they return
     // 403 Forbidden and the UI falls back to a system font.
     server: { fs: { allow: ['.', '../loui-ds'] } },
   });
   ```

3. Keep `import 'loui-ds/styles.css'` as usual. Changes to a component's CSS reach the page after a rebuild plus a full page reload (Vite does a full reload for linked files, so component state is not preserved).

4. Run the app's dev server. Edit a file in `loui-ds/src`, wait for `✔ Rebuilt` in the watcher, and look at the app.

Measured: a `.root` rule added to `Button.module.css` showed up in the running app about 8 seconds after the edit, including the page reload, with no console errors. (The edit was reverted.)

### Differences from the published package

The link route serves `dist/` unbundled from the repository folder, the same files npm ships, so behavior is close to production. It differs in these ways:

- `dist/` comes from your working tree, including unfinished work. Do not judge a release by it.
- `node_modules` of the design system sits next to `dist/`, which is why the React duplicate appears.
- Packaging bugs (a wrong `exports` map, missing files) do not show up. Use the tarball route for those.

### Undo it

Before committing in the app, set the dependency back to the released version (`"loui-ds": "0.3.0"`), run `pnpm install`, and check that `git diff package.json pnpm-lock.yaml` shows only intended changes.

## 2. Tarball (before a release)

From the design system repository:

```sh
pnpm build
pnpm pack --pack-destination ../loui-ds-pack
```

In the app: `"loui-ds": "file:../loui-ds-pack/loui-ds-0.3.0.tgz"`, then `pnpm install`. This is exactly what an npm install delivers. `pnpm examples:verify` automates the same check for the two example apps in `examples/` (it passed for 0.3.0 before the release).

## 3. npm (release)

Cut the version as described in [docs/release/README.md](../release/README.md): `pnpm changeset:version`, commit, push, then tag `v<version>`. For 0.3.0 the timeline was:

| Time (UTC) | Event                                                      |
| ---------- | ---------------------------------------------------------- |
| 16:51      | Tag pushed, Release workflow started                       |
| 16:52      | Build, `publint`, `attw`, `size` and `npm publish` ran     |
| 16:55      | `npm view loui-ds` listed `0.3.0` (the workflow was green) |

So plan on about five minutes between the tag and an installable version. npm prints "may take a few minutes to become available" and a `404` from `npm view loui-ds@x.y.z` in that window is normal.

### In the app, after the release

1. Change the version in `package.json` (and in `pnpm-workspace.yaml` if the app lists `loui-ds` under `minimumReleaseAgeExclude`), then run `pnpm install`.
2. Read the release notes on the GitHub Release (`gh release view v0.3.0 --repo xrazai/loUI`) or in `docs/release/CHANGELOG.md` of the repository. The npm package ships only `dist/`, so the notes are not inside `node_modules`.
3. Remove workarounds for the fixed items and run the app's type-check.

### Tracking what changed automatically (`changes.json`)

From the first release after 0.3.0 the package ships `loui-ds/changes.json` (schema `schemas/changes.schema.json`, generated from the task log and the backlog at build time). It lists, newest first, every release with its entries (`id` such as `GAP-014`, `kind`, `summary`, the `components` it names, `internal` for repository-only work, and `breaking`), the entries not yet released, and the gaps still `open`. An app that keeps its own notes with the same ids can compare them with the installed version without reading prose:

```js
import changes from 'loui-ds/changes.json' with { type: 'json' };

const resolved = changes.releases
  .filter((release) => release.version > lastSyncedVersion) // compare with a semver library
  .flatMap((release) => release.entries.filter((entry) => !entry.internal));
```

Check `breaking` before upgrading: an entry with `breaking: true` carries a `**Breaking:** <what to do>` sentence in its `summary` and flags a changed default, a layout or line-break change, or a widened output type (a union that gained a member, a field that became optional) that can break an exhaustive `switch` or a type check without any API removal. List them for the versions you are crossing:

```js
const breaking = changes.releases
  .filter((release) => release.version > installedVersion) // compare with a semver library
  .flatMap((release) => release.entries.filter((entry) => entry.breaking));
```

The flag exists from the first release after 0.7.1; entries of 0.6.0 and 0.7.0 were marked retroactively.

Verified on 2026-11-03 against a packed tarball in a clean project: both `require('loui-ds/changes.json')` and an ESM `import ... with { type: 'json' }` resolve, and the 0.3.0 entries list `GAP-014`, `021`, `023`, `032`, `033` and `035`. Version 0.3.0 itself was published before the file existed, so for it use the GitHub Release.

The ERP repository keeps this loop in `docs/ds-issues/` (an index with one row per gap, the state and the file holding the workaround) and a `/ds-sync` command that does the comparison, removes resolved workarounds one by one, and moves the rows to `resolvidos.md`. Any app can copy that setup: the contract is "notes carry the design system's task id".

`minimumReleaseAgeExclude`: in a clean project with the same exclusion list, `pnpm add loui-ds@0.3.0` and `pnpm install` with `"loui-ds": "0.3.0"` both worked about five minutes after publishing, with pnpm 12.16.1 defaults. The exclusion was therefore not needed there. If your pnpm version or an organisation-wide `minimumReleaseAge` rejects a fresh version, add a version-less `- loui-ds` entry once instead of editing the pinned version on every release.

## Checklist for an agent working in the app

- Do not edit `node_modules/loui-ds` or the design system from the app task unless the owner asked; record the gap with its evidence instead (component, what you tried, what happened, the workaround you used).
- Do not leave `link:` or `file:` in a commit.
- A gap that is product behavior (domain components, routes, vocabulary) stays in the app; only generic components, tokens, docs and bugs belong in the design system.
- When something fails only in the link route (hooks, fonts, 403), check the two Vite settings above before reporting a design system bug.
