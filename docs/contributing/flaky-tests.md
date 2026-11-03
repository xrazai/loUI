# Flaky tests

A test that sometimes passes and sometimes fails is a bug, either in the test or in the component. This policy keeps such tests from eroding trust in the gate (TEST-015).

## Rules

1. **No retries, except visual regression in CI.** The `visual` Vitest project retries twice when `CI` is set (font rasterization on a cold container can differ by a pixel). Unit, browser and Storybook tests never retry: a retry hides real timing bugs such as focus restoration races.
2. **Reproduce before you touch it.** Run the single file in isolation (`pnpm vitest run --project browser <file>`). If it passes alone and fails only in a full parallel run, it is a timing dependency in the test: wait for the state you need (`expect.poll`, `vi.waitFor`, `settleAnimations()` in `src/test/axe.ts`) instead of fixed sleeps or larger timeouts.
3. **Quarantine is the last resort, and temporary.** Skip the test and put the marker on the line above it:

   ```ts
   // quarantine: TEST-022 since 2026-11-03
   it.skip('restores focus after a pointer-opened dialog inside a sheet', async () => {
   ```

   The ID is a TODO.md task describing the investigation. `scripts/quality/quarantine.test.ts` (unit project, part of `pnpm check`) fails for a skip without the marker and for a quarantine older than **14 days**: fix the test or delete it with a reason in the commit.

4. **Weekly review.** Once a week the PM (or whoever owns the release) lists open quarantines (`git grep -n "quarantine:"`) and the CI runs that needed a visual retry, and either schedules the fix or deletes the test.
5. **Coverage is reported, not a gate.** Accessibility (axe, WCAG suites), keyboard-contract and visual tests are the quality gate. A line-coverage number says nothing about whether a focus trap works, so it never blocks a merge.

## Known local behavior

On Windows, a full `pnpm check` runs four Vitest projects with real browsers at once; under that load a few interaction tests can time out. If a file fails in the full run but passes alone, the Linux CI run is the arbiter. Report repeat offenders as a TODO task.
