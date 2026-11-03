# ADR-0006: Money and quantity representation

- Status: Accepted 2026-10-31
- Date: 2026-10-31

## Context

Floating-point amounts cause rounding errors, and the handoff is inconsistent about money units (TODO Appendix B).

## Decision

Money is an integer in minor units plus an ISO 4217 currency code. Quantities follow the same integer-based rule where applicable. Display formatting uses `Intl.NumberFormat`.

## Consequences

- No rounding drift; correct for currencies with different minor-unit exponents.
- Consumers convert at the boundary.
- Components never build currency strings by hand.

## Alternatives considered

- Decimal strings: need parsing everywhere.
- Floats: unsafe for money.

## Amendment 2026-11-03

`CurrencyInput` gained an opt-in `entryMode="amount"` (whole-unit typing: `200` is 200.00, the decimal mark starts the fraction). The state is still an **integer in minor units** plus an ISO 4217 code: the text is parsed with string manipulation (`parseCurrencyAmount`), never through a float. `onChange`, `name` submission and the stored value are unchanged; the default `cents` mode is unchanged.
