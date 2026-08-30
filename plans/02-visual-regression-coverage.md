# 02 — Extend visual regression from 2 components to 42

**Effort:** L (but highly parallel, and per-component cost is near zero) · **Risk:** low

## Problem

The visual regression infrastructure in this repo is genuinely good:

- bit-exact comparison (`allowedMismatchedPixelRatio: 0`, deliberately — see the
  reasoning comment in `vitest.config.ts`)
- baselines keyed by browser/platform/**architecture**, because
  `process.platform` is `"linux"` on both arm64 and x64 and the sets would
  otherwise collide
- CI runs inside the devcontainer image specifically so freetype/fontconfig
  glyph rendering matches the machine that recorded the baselines — after a Card
  baseline was found to differ by 523 pixels, all of it letter edges, between
  Ubuntu noble and Debian bookworm
- motion frozen twice over (Playwright `reducedMotion` + an injected stylesheet),
  fonts explicitly requested and awaited, fixed frame width so a metrics
  difference becomes a pixel diff rather than a dimension mismatch

And exactly **two components use it**: `Button` and `Card`.

```
src/components/Button/Button.visual.test.tsx
src/components/Card/Card.visual.test.tsx
```

Everything expensive has already been solved. The remaining 40 components are
each a ~15-line file.

## Scope

**In:** a `*.visual.test.tsx` for every component in `src/components/` that has
stories, plus committed baselines for both themes.

**Out:** visual coverage of `src/typography/` (low value — the token pages under
`src/stories/` already screenshot type scale), and of `Code` (Monaco renders
asynchronously and would be flaky; skip with a note).

## Approach

### The pattern to replicate

`src/components/Button/Button.visual.test.tsx` is the reference:

```tsx
import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Button.stories";

const { VariantIntentMatrix, AllSizes, States } = composeStories(stories);

describe("Button", () => {
  test.for(THEMES)("variant/intent matrix - %s", async (theme) => {
    await expectScreenshot(<VariantIntentMatrix />, "variant-intent-matrix", theme);
  });
  // ...
});
```

Stories are the fixtures; `src/testing/visual.tsx` is the camera. `expectScreenshot`
takes an optional `width` for content wider than the 720px default frame.

### Choosing what to shoot

**Do not screenshot every story.** Pick the two or three that are *matrices* —
the ones that put every variant/intent/size/state on one surface. A story that
shows a single default instance adds a baseline to maintain and catches nothing
the matrix doesn't.

Rule of thumb per component:
1. the variant × intent matrix (or the nearest equivalent)
2. all sizes
3. states (disabled / loading / error / focus) where they exist

Several components don't have a matrix story yet. Adding one is worth it anyway —
it improves the Storybook docs page as much as the baseline.

**Skip interactive/`Play` stories.** Their post-interaction state isn't a stable
frame, and the play functions already assert behaviour.

### Recording baselines

Baselines must be generated **in the devcontainer** (arm64), because that is what
CI checks against — CI never writes them:

```bash
bun run test:visual:update    # records
bun run test:visual           # verifies
```

Commit the resulting `src/components/*/__screenshots__/**/*-chromium-linux-arm64.png`.
`.gitignore` already excludes `.vitest-attachments/` (diff output) while keeping
baselines.

### Doing it in batches

40 components × ~3 shots × 2 themes ≈ 240 PNGs. Land these in themed batches
(forms, overlays, pickers, charts, primitives) rather than one commit — a single
enormous baseline commit is unreviewable, and if something is subtly wrong you
want a small blast radius.

Suggested batches:
1. **Primitives** — Badge, Separator, Spinner, Text, TextInline, ProgressBar, TagChip
2. **Forms** — Input, Textarea, Checkbox, CheckboxGroup, RadioButton, RadioButtonGroup, Switch, Toggle, ToggleGroup, Select, Field, FormField, SearchInput, TagInput
3. **Overlays** — Modal, Sheet, Toast, Tooltip, Popover, HoverCard, Message
4. **Pickers** — Calendar, DatePicker, TimePicker, DateTimePicker, DateRangePicker, DateTimeRangePicker
5. **Charts + remaining** — LineChart, BarChart, Sparkline, Tabs, Markdown

Overlays need care: a portalled overlay may render outside the frame
`expectScreenshot` shoots (`container.firstElementChild`). Either give those
stories an inline/`static` presentation for the baseline, or extend
`src/testing/visual.tsx` with a full-viewport shot mode. Decide this once, at the
start of batch 3, and write down which you chose.

Charts need care too: any story using random or date-derived data will not be
reproducible. Pin the data.

## Acceptance criteria

- [ ] Every component in `src/components/` except `Code` has a `*.visual.test.tsx`
- [ ] Each covers both themes via `test.for(THEMES)`
- [ ] Baselines committed, recorded in the devcontainer, `-chromium-linux-arm64` suffix
- [ ] `bun run test:visual` passes clean twice in a row from a cold start (catches non-determinism)
- [ ] The overlay-framing decision is documented in `src/testing/visual.tsx`
- [ ] `docs/component-authoring.md` states that a new component ships with a visual test

## Notes

- Commit type: `test:` — no release, correctly.
- Expect the first run of some components to be flaky and to expose real
  non-determinism (unpinned data, async images, animated indicators). That
  finding is the point; fix the source rather than raising the tolerance. The
  zero-tolerance reasoning in `vitest.config.ts` explains why loosening it turns
  the whole suite into a blind spot.
