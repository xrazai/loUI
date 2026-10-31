# ADR-0009: Support matrix

- Status: Accepted 2026-10-31
- Date: 2026-10-31

## Context

A narrow support matrix keeps the implementation simple and the tests meaningful.

## Decision

React `^19` only (ref as a prop, no `forwardRef`). Evergreen browsers, the last 2 versions. Node 24 LTS for tooling. All components are SSR-safe.

## Consequences

- Modern CSS and JS features can be used without fallbacks.
- Consumers on React 18 or older browsers are unsupported.
- SSR render tests are required.

## Alternatives considered

- Support React 18: requires `forwardRef` and a larger matrix.
- Broader browser support: needs fallbacks for modern CSS.
