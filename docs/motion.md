# Motion

Builder reference for animation and motion in PA. Minimal by principle; when motion appears, it has a job.

PA isn't an animation-heavy product. The goal isn't to add motion — it's to use motion *only* where it conveys causality. Animation that doesn't explain something is decoration, and decoration belongs elsewhere.

## When motion applies

Motion has a job in three places:

1. **State transitions** — hover, focus, open/close, expand/collapse. The animation conveys *something just changed*.
2. **Causality** — a click produces a visible effect; the animation links cause to effect (the toast that slides in *because* you triggered an action).
3. **Layout continuity** — the same element moves to a new position; the animation preserves identity (rare in PA today).

If a proposed animation doesn't fit one of those, it's decoration. Don't add it.

## Default vocabulary

PA uses a small set of motion primitives via Tailwind utilities and the `transition` family.

### Duration

| Tailwind | ms | Use |
|---|---|---|
| `duration-75` | 75ms | Tiny adjustments — hover state on text |
| `duration-150` | 150ms | **Default for most transitions** — hover, focus, color changes |
| `duration-200` | 200ms | Opacity changes, subtle shifts |
| `duration-300` | 300ms | Layout changes, modal in/out, sheet slide |

Avoid durations over 300ms — they feel sluggish. Avoid under 75ms — they feel like a flicker.

### Easing

PA uses the default `transition` easing (`ease`) for most animations. When something needs deliberate easing:

- `ease-in-out` — modal/sheet open + close
- `ease-out` — toast slide-in (decelerates as it arrives)
- `ease-in` — element fading out

Don't use `ease-linear` for UI; linear is a robotic feel reserved for spinners.

### Common transitions

| Pattern | Class |
|---|---|
| Hover/focus on most interactive elements | `transition-colors` (with `duration-150` default) |
| Modal/sheet open | `transition-opacity transition-transform duration-300 ease-in-out` |
| Toast slide-in | `transition-transform duration-200 ease-out` |
| Disclosure (accordion, expand) | `transition-[height] duration-200 ease-in-out` |

These are starting points; primitives that need their own easing handle it internally.

### Keyframe animations

Beyond `transition`, the design system defines a small named-animation vocabulary in [`tailwind.config.ts`](../tailwind.config.ts) (`keyframes` + `animation`, lines 197–242). These are the enter/exit pairs that overlays play on mount and unmount — applied via `animate-*` utilities and gated by `data-state`. See [Overlay Primitives](overlay-primitives.md) for how `data-state="open|closed"` selects the in vs out half of each pair.

| Utility | Keyframe | Default |
|---|---|---|
| `animate-fade-in` | opacity 0 → 1 | 200ms ease-out forwards |
| `animate-fade-out` | opacity 1 → 0 | 200ms ease-out forwards |
| `animate-fade-in-slow` | opacity 0 → 1 | 300ms ease-out forwards |
| `animate-fade-out-slow` | opacity 1 → 0 | 300ms ease-out forwards |
| `animate-slide-up-in` | translateY 100% → 0 | 200ms ease-out forwards |
| `animate-slide-up-out` | translateY 0 → 100% | 200ms ease-out forwards |
| `animate-slide-right-in` | translateX 100% → 0 | 200ms ease-out forwards |
| `animate-slide-right-out` | translateX 0 → 100% | 200ms ease-out forwards |
| `animate-slide-left-in` | translateX −100% → 0 | 200ms ease-out forwards |
| `animate-slide-left-out` | translateX 0 → −100% | 200ms ease-out forwards |

Every animation uses `ease-out forwards`: the element decelerates as it arrives and holds its end state. The slide axes match where a surface lives — `slide-up` for bottom sheets, `slide-right`/`slide-left` for side panels. **There is no `slide-down`**: nothing in PA enters from the top edge, so the keyframe was never defined. Add it to the config first if a top-anchored surface ever needs it; don't fake it with negative `slide-up`. Only the fade pair has `-slow` variants (for backdrops that should lag slightly behind their panel); the slide pairs do not.

In practice the most-used animations are Tailwind's built-in `animate-spin` (spinners) and `animate-pulse` (skeletons); the fade/slide pairs above are PA's custom set and are consumed almost entirely by overlay primitives.

## Where motion is built in

These primitives handle their own motion — don't re-implement at the call site:

- `Modal` — open/close transitions
- `Sheet` — slide-in/slide-out
- `Toast` — slide-in, fade-out
- `Spinner` — continuous rotation
- `Skeleton` — shimmer animation
- `Tooltip` / `Popover` — open/close

Buttons, inputs, links handle hover/focus via `transition-colors` baked in.

## Motion anti-patterns

- **Decorative entrance animations.** Page elements fading in on load. Don't.
- **Bouncing or springy easing.** PA isn't playful. No spring physics, no overshoot.
- **Parallax, scroll-driven animation.** Not PA's voice.
- **Animations longer than 300ms.** Slow animations feel laggy, especially repeated ones.
- **Animations that block input.** A modal open animation shouldn't make the close button un-clickable during the transition.
- **Auto-playing carousels or rotating banners.** PA doesn't market to its user.
- **Hover states on touch devices.** Use `@media (hover: hover)` or the form-factor hook to gate hover-only affordances.

## Reduced motion

PA honors `prefers-reduced-motion` globally, not per component. A base-layer Tailwind plugin in [`tailwind.config.ts`](../tailwind.config.ts) (lines 245–258) emits a `@media (prefers-reduced-motion: reduce)` rule that pins `animation-duration` and `transition-duration` to `0.01ms !important` and `animation-iteration-count` to `1` for every element (`*, *::before, *::after`).

This means the named animations and `transition` utilities above effectively snap to their end state for users who ask for reduced motion — including continuous animations like `animate-spin` and `animate-pulse`, which stop after one iteration. Nothing per-component is required; don't re-implement the check at the call site.

## Open questions

- **List re-order animations.** When a row changes position (e.g., a task completes and moves to the completed band), should the move animate? Current behavior: instant. Probably should animate gently (150–200ms) for continuity.
- **Page transitions.** Currently none. If/when added (probably never), they'd need their own duration and easing.

## Related

- [Visual Hierarchy](visual-hierarchy.md) — motion as one of the hierarchy axes
- [Design Philosophy (Engineering)](design-philosophy.md) — minimal motion as practice
- [States](states.md) — loading state uses motion (shimmer, spinner) deliberately
