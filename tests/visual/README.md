# Visual regression (TEST-005)

One test file, `stories.visual.test.tsx`, screenshots **every story** and compares it with a committed baseline using Vitest 5 browser mode `toMatchScreenshot` (ADR-0010).

## How it works

1. `import.meta.glob('../../src/**/*.stories.tsx')` finds every story file. Stories added later by anyone are picked up automatically; nothing here needs editing.
2. `composeStories` (from `@storybook/react-vite`) turns each story into a component, with the project annotations of `.storybook/preview.ts` applied.
3. Each story renders inside `DSProvider`, in a fixed-width frame (default 384 px) on the `--ds-bg` surface.
4. The toast queue is cleared before and after every test (composed stories do not run `beforeEach`, and the queue is a singleton), so a toast never leaks into the next capture.
5. `Date` is frozen to 2026-10-15 12:00 local time (TEST-023) so the calendar's "today" marker and the DatePicker "Today" button never depend on the real date. Only `Date` is faked; timers and animation frames stay real. Stories needing another "today" should take it as a prop.
6. The test waits for `document.fonts.ready`, plus one animation frame, so Geist is loaded before capture.
7. A stylesheet disables animations and transitions and hides the caret, so spinners and transitions are static and deterministic.
8. The frame is captured with `toMatchScreenshot(storyId)` (pixelmatch, threshold 0.2, at most 0.2% of pixels may differ) and the pointer is moved away so hover never leaks into the next story.

Baselines live next to the test: `tests/visual/__screenshots__/stories.visual.test.tsx/<story-id>-chromium-<platform>.png`.

## Commands

| Command                   | What it does                                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:visual`        | Compares every story with its baseline. A missing baseline is written and its test fails: review it, then run the update command. |
| `pnpm test:visual:update` | Rewrites baselines that changed or are missing (`vitest run --project visual --update`).                                          |

To run one story: `pnpm vitest run --project visual -t "components-button--primary"`.

## Update workflow (never skip the review)

1. Make the change, then run `pnpm test:visual`. A failure writes the actual and diff images under `.vitest/attachments/`; open them.
2. If the change is intended, run `pnpm test:visual:update`.
3. **Look at every changed PNG** (`git diff --stat tests/visual`, then open the files). A baseline must show what the story is supposed to show: correct state, no clipped content, no loading flash.
4. Commit the PNGs in the same commit as the code that changed them, and say in the commit or PR **why** they changed. Never update a baseline to make a red test green without understanding the diff (AGENTS.md section 10).
5. A new story gets its first baseline from `pnpm test:visual:update`; review it like any other.

## Per-story parameters

Set under `parameters.visual` in a story or in its `meta`:

| Parameter  | Type      | Effect                                                                                              |
| ---------- | --------- | --------------------------------------------------------------------------------------------------- |
| `disable`  | `boolean` | Skip the story: it is animated beyond what the freeze handles, random, or time dependent.           |
| `play`     | `boolean` | Run the story's `play` function before the capture, for focus, hover, open and pressed states.      |
| `width`    | `number`  | Frame width in CSS px (never wider than the test viewport). Default 384.                            |
| `selector` | `string`  | Capture this element instead of the frame, for overlays rendered through a portal (dialogs, menus). |
| `height`   | `number`  | Minimum frame height in CSS px, so a popover that opens below its trigger is not cut off.           |

`play` is off by default because most play functions only assert behavior. Turn it on for stories whose purpose is to show a state (`Focused`, `Hovered`).

```tsx
export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};

export const Ticking: Story = {
  parameters: { visual: { disable: true } }, // clock changes every second
};
```

## Platform baselines

Fonts and anti-aliasing differ between operating systems, so baselines carry the platform in their name (`-win32`, `-darwin`, `-linux`). Windows baselines are the local safety net. **Linux baselines are the ones CI compares against**, and they are generated only inside the pinned Playwright container (`mcr.microsoft.com/playwright:v1.64.1-noble`; the tag must match the `playwright` version in `package.json`). Never commit Linux PNGs rendered anywhere else.

## Platform focus: Windows first

For now visual regression is maintained on **Windows only**: `pnpm test:visual` (and `pnpm test:visual:update` after reviewing a change) on a Windows machine is the gate, run before every push. The `*-chromium-linux.png` files are **paused**: they are not regenerated and may be stale, and the CI `visual` job runs only when started by hand. Cross-platform baselines (Linux in CI, macOS) will be resumed as separate work; the procedure below stays documented for that moment.

## Linux baselines in CI (TEST-019, paused)

| Piece                                      | Role                                                                                                                                                                                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/visual-baselines.yml`   | Manual (`workflow_dispatch`). In the container: install, delete existing `*-linux.png`, `pnpm test:visual:update`, re-run `pnpm test:visual` to prove stability, upload the artifact `visual-baselines-linux`. win32 and darwin files are never touched. |
| `scripts/visual/pull-linux-baselines.mjs`  | `pnpm visual:pull-linux [run-id] [--no-prune]`: `gh run download` of that artifact (latest successful run by default) into `tests/visual/__screenshots__/stories.visual.test.tsx/`. Stale `-linux.png` files are removed unless `--no-prune`.            |
| `visual` job in `.github/workflows/ci.yml` | Runs `pnpm test:visual` in the same container on push and PR. It checks for `*-chromium-linux.png` first and does nothing while there are none. On failure it uploads the artifact `visual-diffs` (actual and diff images).                              |

### Regenerate and commit Linux baselines

1. Land the component changes first; baselines must be generated from the final code on `main` (or the branch you will merge).
2. Trigger and wait: `gh workflow run visual-baselines.yml --ref <branch>` then `gh run watch <run-id> --exit-status` (find the id with `gh run list --workflow visual-baselines.yml --limit 1`).
3. Pull: `pnpm visual:pull-linux` (or `pnpm visual:pull-linux <run-id>`).
4. Review: `git status --short tests/visual`, open the changed PNGs. Same rule as any baseline: look at the diff and say why it changed.
5. Commit the PNGs: `git add tests/visual && git commit -m "test(visual): regenerate linux baselines"`.

Regenerate from scratch (the workflow does) after component changes: the comparison tolerance is 0.2% of pixels, so partial updates drift.

### When the CI `visual` job fails

Download the `visual-diffs` artifact and compare. If the change is intended, regenerate the Linux baselines as above and commit them with the code. If not, fix the code. Do not update baselines on Windows to fix a Linux failure: they are separate files.

## Scope and gaps

- Dark theme at one width. Other themes (`paper`), widths (320, 768, 1280), `forced-colors` and `prefers-reduced-motion` runs are not captured yet.
- Stories that render through portals need `visual.selector`.
- Flaky captures: fix the cause (animation, async data, fonts) or use `disable`. Do not widen the tolerance in the test file.
