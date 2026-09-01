# 10 — The default palette's premise (decision)

> **Status (2026-08-30): done.** Consolidated to one theme, **Linen** — the
> hue-anchored take (02), promoted and renamed. (It shipped for a few days as
> *Gesso*; renamed 2026-08-31 because the name was jargon, and because a primer
> is a coat you paint over, while this theme's warmth is meant to be seen.) The six other explorations were
> deleted from the package and live at the `themes-exploration` git tag. All
> acceptance criteria below hold (theme-version went to 1.0.0 rather than
> 0.3.0, marking the new identity). The step-semantic rewrite (07) remains
> open as a separate, later change.

**Effort:** S to decide · M–L to implement · **Risk:** medium (touches every
surface in the library) · **Blocks:** nothing, but gets more expensive with every
consumer

## Problem

The default theme's colours were picked one hue at a time, by eye. The
construction defect that caused — families disagreeing about what a stop meant,
hue drifting down a ramp — is fixed as of `--theme-version: 0.2.0`: all seven
scales now run on one shared OKLCH spine, and `bun run check:contrast` holds 162
pairings at AA in both modes.

That was a geometry fix. It left the *premise* untouched, and the premise is
mostly inherited rather than chosen:

- **Brand is blue.** `ocean` at hue 250 — the hue every design system defaults
  to. A default theme asserting a brand hue at all is itself a decision.
- **Semantics map literally.** Green success, amber warning, red danger, one hue
  each, at full chroma. They read as three signal colours imported from
  elsewhere rather than as part of one palette.
- **The neutral is blue-grey.** Tailwind `slate`'s hue, which fights any warm
  brand a consumer brings.
- **Seven families, two wired to nothing.** `sky` and `earth` are referenced by
  no semantic token.
- **Names are decorative.** `emerald` is a gemstone on a token whose job is
  *success*.

The stated goal for this theme is to be a versatile starting point across many
kinds of project. None of the five points above were chosen against that goal.

## The takes

Seven premises, each shipping in something real. Rendered side by side —
ramps plus the same UI in each — at
<https://claude.ai/code/artifact/67e75e5c-120c-41ac-b498-e7a984d3d872>.

The useful axis is not warm-versus-cool. It is **how much identity the default
asserts**, and separately **whether the structure survives changing the hues** —
the second being what actually makes something a starting point.

| # | Take | Thesis | Ships in | Breaks when |
| --- | --- | --- | --- | --- |
| 01 | **Ink-led** | The brand is not a hue. Buttons near-black, colour rationed to state. | shadcn/ui, Vercel Geist, Linear | Reads premium B2B before it reads anything else — and collapses with any existing `strong` neutral rung, since both want the same near-black. |
| 02 | **Hue-anchored** | One temperature through everything, the grey included. | Radix (`sand`, `sage`, `olive`), IBM Carbon warm grey | The cast is a commitment; a consumer whose brand fights the temperature must replace the neutral, not just the accent. |
| 03 | **Contrast-locked** | Steps defined by guaranteed contrast ratios, not by eye. | U.S. Web Design System — a 50-grade gap guarantees 4.5:1 | Optimising for the audit flattens the middle of every ramp. Correct, and a little joyless. |
| 04 | **Seeded / generative** | One hex in, whole system out. | Material 3, Ant Design | Recognisably algorithmic output, and a large role vocabulary (`primary-container`, `on-primary-container`) to adopt wholesale. |
| 05 | **Muted workhorse** | Everything in one mid-chroma band; nothing shouts. | Atlassian, enterprise admin and BI | At that chroma, state needs weight and iconography too — colour alone stops being findable in a dense table. |
| 06 | **Expressive** | High chroma, colour as the point rather than the signal. | Duolingo, Basecamp, most consumer and education | A costume you cannot take off. Fine for one product, unusable as a default. |
| 07 | **Step-semantic** | Not a palette but a contract: twelve steps, each with a fixed job. | Radix Colors | Twelve steps is more than most components need, and the discipline only pays once several hues exist. Says nothing about what the thing looks like. |

### Why ink-led was investigated and dropped

It is the most-copied default right now, so it got tried first. It collides with
this library specifically: `bg-strong` is already wired to `slate-800/900/950`,
so pointing `bg-brand` at the neutral's dark end makes `brand` and `strong` the
same colour. Button's primary and strong variants would render identically and
the emphasis ladder — `subtle → normal → brand → strong` — loses a rung. shadcn
does not pay this cost because it has no `strong`.

Reachable if wanted, but it costs a tier-2 restructure, not a tier-1 edit.

## Recommendation

**Structure from 07, temperature from 02.**

The step-semantic contract is the only item on the list that is not a matter of
taste. Twelve steps with fixed jobs means a hue swap is a one-line change with
nothing downstream to re-tune, which is the working definition of a starting
point. Tier 2 already applies that thinking to *meanings*; extending it to
*steps* costs one rewrite and pays for every theme after it.

Then pick a temperature and hold it everywhere, the grey included. That part is
a taste, and it is the part that stops the system reading as generated.

Concretely, five families on a warm anchor, plain hue names:

| Family | Hue | Peak chroma | Replaces |
| --- | ---: | ---: | --- |
| `neutral` | 75 (warm) | 0.009 | `slate` — was hue 256, C 0.022 |
| `blue` | 258 | 0.110 | `ocean` — was 250, C 0.135 |
| `green` | 148 | 0.098 | `emerald` — was 156, C 0.120 |
| `amber` | 70 | 0.118 | `topaz` — was 65, C 0.145 |
| `red` | 30 | 0.142 | `ruby` — was 25, C 0.175 |

`amber` at 70 against a 75 anchor is the clearest expression of the idea:
warning becomes the neutral turned up, not a foreign yellow. `sky` and `earth`
are deleted — Bootstrap 4 shipped `$indigo`, `$purple` and `$pink` wired to
nothing and they were weight in every build, never optionality.

### The sleeper

**03 is worth revisiting if this is ever audited.** USWDS makes accessibility a
property of the construction rather than something verified afterwards — a
stronger version of what `check:contrast` does today, which checks an outcome
rather than guaranteeing it.

## Scope

**In:**

- Tier 1 rewritten: five families, new hues and chroma, plain names.
- Tier 2 reference renames, mechanical: `var(--color-emerald-600)` →
  `var(--color-green-600)` and so on. No re-wiring — the semantic token names,
  their meanings and their structure are unchanged.
- `sky` and `earth` deleted.
- The Palette page's `FAMILIES` list and the docs that name the old scales.
- Visual baselines regenerated.

**Out:**

- Tier 3. No recipe changes; components do not move.
- Any change to the semantic token vocabulary. `bg-brand-subtle-hovered` still
  exists and still means what it meant.
- The step-semantic restructure itself. That is a separate, larger decision —
  taking the *temperature* half of this recommendation does not require it, and
  the two should not land together.

## Approach

1. Regenerate all five scales from the spine documented on the Palette page,
   changing only hue and peak chroma per family. Do not hand-tune stops.
2. `sed` the tier-2 references across both mode blocks; delete the `sky` and
   `earth` blocks.
3. `bun run check:contrast` — expect failures around 500 and 600, which carry
   white text. Fix by moving the spine constant, never one value.
4. Update `FAMILIES` in `src/stories/colors/palette/components/PaletteScales.tsx`
   and the per-family story exports.
5. Update the Palette MDX's families table, and the scale table in
   `docs/design-tokens.md`.
6. `bun run test:visual:update`, then `bun run test:stories`.
7. Bump `--theme-version` to `0.3.0`.

## Acceptance criteria

- `bun run check:contrast` passes with no pairing exempted or threshold moved.
- `bun run test:stories` green in both light and dark.
- No `emerald|topaz|ruby|ocean|sky|earth` remains anywhere in `src/` or `docs/`.
- Every scale still sits on the spine: lightness monotonic per family, and equal
  across families at every stop. The Palette page's spine chart is the check —
  seven lines, one curve, neutrals diverging only below 700.
- `--theme-version` bumped in the same commit.
