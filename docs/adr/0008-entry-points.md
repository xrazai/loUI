# ADR-0008: Package entry points

- Status: Accepted 2026-10-31
- Date: 2026-10-31

## Context

Domain-specific compositions from the handoff `erp/` and `agents/` groups should not bloat or couple the core.

## Decision

Expose two entry points: `@loui/ds` (core components) and `@loui/ds/patterns` (domain patterns from those groups, renamed generically). `@loui/ds/styles.css` ships the CSS.

## Consequences

- Core stays domain-neutral and small; consumers import patterns on demand.
- Package `exports`, types and size budgets must be checked for both entries.
- Patterns may depend on core, never the reverse.

## Alternatives considered

- Single entry point: couples domain concepts to the core.
- Separate package: heavier release process for now.
