# ADR-0007: Theming

- Status: Accepted 2026-10-31
- Date: 2026-10-31

## Context

The handoff is dark only, but print previews need a light surface and hosts may want other themes later.

## Decision

Dark is the only shipped theme. The semantic token layer must be theme-able through `[data-theme]`. A `paper` scope provides the light surface for print previews. Forced-colors mode is supported.

## Consequences

- Adding a theme later means supplying a semantic token set, not editing components.
- Components must reference semantic tokens only.
- Contrast must be verified per theme.

## Alternatives considered

- Ship a light theme now: out of scope.
- Dark only with no theme hook: costly to retrofit.
