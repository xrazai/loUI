# ADR-0001: Behavior layer: React Aria Components

- Status: Accepted 2026-10-31
- Date: 2026-10-31

## Context

Accessible keyboard, focus and ARIA behavior for menus, dialogs, comboboxes, calendars and tables is expensive to build and verify. The design system targets WCAG 2.2 AA (AGENTS.md section 8).

## Decision

Use `react-aria-components` (RAC) 1.22.1 as the behavior layer. Components are styled with our own CSS and RAC `data-*` state attributes. RAC's `UNSTABLE_Toast*` primitives are wrapped behind our own Toast API so that a future RAC change does not leak into consumers.

## Consequences

- Behavior is covered by a large, maintained, tested implementation, including i18n and RTL.
- RAC becomes a runtime dependency and its release cadence affects us.
- The wrapped Toast API must be kept stable independently of RAC's unstable exports.

## Alternatives considered

- Radix Primitives: fewer components (no calendar, date field, table) and weaker i18n.
- Custom implementation: highest cost and risk of accessibility regressions.
