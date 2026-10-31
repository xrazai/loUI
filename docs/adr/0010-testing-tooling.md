# ADR-0010: Testing and tooling

- Status: Accepted 2026-10-31
- Date: 2026-10-31

## Context

Behavior, accessibility and appearance must be caught automatically. jsdom cannot compute layout or contrast.

## Decision

Vitest 5 browser mode with `@vitest/browser-playwright` (chromium) for component tests; node environment for pure utilities and tokens. axe-core is used directly. Storybook 10 with `@storybook/addon-vitest` and `@storybook/addon-a11y`. Visual regression uses Vitest `toMatchScreenshot`. There is no Docker on the owner's machine, so local baselines are platform-suffixed; CI baselines will be produced later in the `mcr.microsoft.com/playwright:v1.64.1-noble` container.

## Consequences

- Real-browser tests for focus, layout and contrast.
- Local and CI screenshot baselines differ; CI baselines are authoritative once set up.
- Playwright browsers must be installed on every machine and CI runner.

## Alternatives considered

- jsdom with Testing Library: no layout or contrast.
- Playwright Test for components: a second runner and duplicate setup.
- Cypress component testing: heavier and less aligned with Vitest.
