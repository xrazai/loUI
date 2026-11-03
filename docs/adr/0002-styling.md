# ADR-0002: Styling: CSS Modules with cascade layers

- Status: Accepted 2026-10-31
- Date: 2026-10-31

## Context

The handoff uses inline styles and JS hover state, which cannot express pseudo-classes, forced-colors or media queries and are hard to override.

## Decision

Use CSS Modules, one per component, inside `@layer reset, tokens, base, components, utilities;`. State is styled through RAC `data-*` attributes and native pseudo-classes. No inline styles and no JS hover state.

### Amendment 2026-10-31: dynamic values

Runtime-computed values (a skeleton's width, a progress fill percentage, a swatch hex, a chart bar height) may be passed **only as CSS custom properties** on the element's `style` (e.g. `style={{ '--ds-progress-value': '42%' }}`), consumed by the CSS Module. Never set visual properties directly in `style`. Custom-property names follow `--ds-<component>-<name>`.

### Amendment 2026-10-31: forced colors

Inside `@media (forced-colors: active)` blocks, CSS system colors (`CanvasText`, `ButtonText`, `Highlight`, `GrayText`, …) and `currentcolor` are allowed; Stylelint's strict-value rule exempts them.

### Amendment 2026-11-03: logical properties (ARCH-011)

Component CSS uses logical properties only (`margin-inline-start`, `padding-block`, `inset-inline-end`, `inline-size`, `border-start-start-radius`, …) so a right-to-left layout needs no extra CSS. Direction-dependent transforms (slide-in panels, mirrored icons) flip with `:dir(rtl)`. Stylelint's `property-disallowed-list` rejects physical properties in `src/components` and `src/patterns`. The one exception is the Chart tooltip, which uses `left` because SVG coordinates are physical and the chart is not mirrored in RTL; it carries a scoped disable comment. Shipping an RTL locale is not planned yet: this keeps the option open.

## Consequences

- Consumers can override styles predictably through layer order.
- No runtime styling cost; SSR-safe.
- The build must extract CSS Modules into plain CSS files.
- Stylelint enforces tokens-only values.

## Alternatives considered

- CSS-in-JS: runtime cost and SSR complexity.
- Tailwind: utility classes conflict with a token-first, component-scoped approach.
- Vanilla Extract: extra build coupling.
