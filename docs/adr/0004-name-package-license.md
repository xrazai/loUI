# ADR-0004: Name, package and license

- Status: Accepted 2026-10-31, amended 2026-11-03 (MIT, public `loui-ds`)
- Date: 2026-10-31

## Context

The project needs a stable name, package name and license posture before any release.

## Decision

The name is "Loui DS". The package is `@loui/ds` with `"private": true` and license `UNLICENSED` until the owner decides on publication and licensing.

## Consequences

- Nothing can be published to a registry by accident.
- Renaming later requires a package rename and a major version.
- The owner must decide the license before the first public release.

## Alternatives considered

- Publishing under an open-source license now: premature without an owner decision.

## Amendment 2026-11-03: MIT and public npm package `loui-ds`

The owner decided to open the project:

- **License:** MIT (`LICENSE` at the repository root). The bundled Geist fonts keep their own SIL Open Font License (`src/styles/fonts/LICENSE.txt`).
- **Package name:** `loui-ds` (unscoped). The `@loui` scope on npm belongs to someone else, so `@loui/ds` cannot be published. Entry points become `loui-ds`, `loui-ds/patterns` and `loui-ds/styles.css`; the MCP server workspace package is `loui-ds-mcp`.
- **Publication:** public on npm (`publishConfig.access: public`, with provenance). `.github/workflows/release.yml` publishes when a `v<version>` tag is pushed, authenticated with npm Trusted Publishing (OIDC; the first publish, 0.2.0, used a short-lived token), and still attaches the tarball to the GitHub Release.
- The rename is a breaking change for anyone who installed the 0.1.0 tarball, so it ships as 0.2.0 (pre-1.0: a minor version may break). Run a search-and-replace of `@loui/ds` with `loui-ds` in imports.
- The companion packages in `tools/` stay private.
