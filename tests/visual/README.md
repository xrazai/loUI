# Visual regression (TEST-005)

One test file, `stories.visual.test.tsx`, screenshots **every story** and compares it with a committed baseline using Vitest 5 browser mode `toMatchScreenshot` (ADR-0010).

## How it works

1. `import.meta.glob('../../src/**/*.stories.tsx')` finds every story file. Stories added later by anyone are picked up automatically; nothing here needs editing.
2. `composeStories` (from `@storybook/react-vite`) turns each story into a component, with the project annotations of `.storybook/preview.ts` applied.
3. Each story renders inside `DSProvider`, in a fixed-width frame (default 384 px) on the `--ds-bg` surface.
4. The test waits for `document.fonts.ready`, plus one animation frame, so Geist is loaded before capture.
5. A stylesheet disables animations and transitions and hides the caret, so spinners and transitions are static and deterministic.
6. The frame is captured with `toMatchScreenshot(storyId)` (pixelmatch, threshold 0.2, at most 0.2% of pixels may differ) and the pointer is moved away so hover never leaks into the next story.

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

Fonts and anti-aliasing differ between operating systems, so baselines carry the platform in their name (`-win32`, `-darwin`, `-linux`). There is no Docker here: the committed set is for the machine that produced it, and other platforms generate their own on first run. A pinned CI container (Linux) is still needed before baselines can gate pull requests (TEST-005 remainder); until then these are a local safety net and a review aid.

## Scope and gaps

- Dark theme at one width. Other themes (`paper`), widths (320, 768, 1280), `forced-colors` and `prefers-reduced-motion` runs are not captured yet.
- Stories that render through portals need `visual.selector`.
- Flaky captures: fix the cause (animation, async data, fonts) or use `disable`. Do not widen the tolerance in the test file.
