# ADR-0004: Name, package and license

- Status: Accepted 2026-10-31
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
