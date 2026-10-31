# ADR-0003: Tokens: W3C DTCG JSON built with Terrazzo

- Status: Accepted 2026-10-31
- Date: 2026-10-31

## Context

Tokens need one source of truth that tools and agents can read. Handoff variable names such as `--bg` and `--text` would collide with host applications.

## Decision

Author tokens as W3C Design Tokens Community Group (DTCG) 2025.10 JSON under `src/tokens`, built with Terrazzo (`@terrazzo/cli` and `@terrazzo/plugin-css` 2.10.x). Every emitted CSS variable is prefixed `--ds-`.

## Consequences

- Standards-based source that can be exported to other tools.
- The `--ds-` prefix prevents collisions; handoff names must be renamed during migration.
- Terrazzo is a younger tool than Style Dictionary; we depend on its roadmap.

## Alternatives considered

- Style Dictionary 5: mature, but only partial support for DTCG 2025.10.
