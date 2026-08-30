# Plans

Units of work for taking the design system to the next level, each sized to be
picked up cold in a fresh session. Written 2026-08-28 against `56e9cf9`.

Each file states the problem with evidence from the repo, what's in and out of
scope, a concrete approach with real file paths, and acceptance criteria.

## The list

| # | Item | Effort | Why it's here |
| --- | --- | --- | --- |
| [09](09-housekeeping.md) | Housekeeping | XS | Stale `coverage/` is generating phantom editor errors. Two minutes, do it first. |
| [01](01-use-client-directives.md) | `"use client"` + SSR smoke test | M | **Hard blocker** for every Next.js App Router consumer. Zero directives exist today. |
| [02](02-visual-regression-coverage.md) | Visual regression: 2 → 42 components | L | Excellent infrastructure already built, then used by almost nothing. |
| [03](03-package-publishing-validation.md) | `publint` + `arethetypeswrong` | S | 80 hand-maintained export entries, no resolution check. Cheapest item here. |
| [04](04-public-api-surface-snapshot.md) | API-surface snapshot | M | The versioning policy is documented but unenforced; releases are unattended. |
| [05](05-coverage-thresholds.md) | Coverage thresholds | S | Coverage tooling installed, no gate. Cheap now, expensive after drift. |
| [06](06-changelog.md) | CHANGELOG (decision) | S | Currently a deliberate "no". Worth revisiting before 1.0. |
| [07](07-logical-properties-rtl.md) | Logical properties / RTL (decision) | M–L | Only if i18n is plausible — but cheap now, miserable later. |
| [08](08-bundle-size-budget.md) | Bundle size budget | S–M | The README's tree-shaking promise is unverified. |
| [10](10-default-palette-premise.md) | Default palette premise (decision) | S to decide, M–L to do | The ramps are sound now; the hues they're made of were never chosen against the goal. |

## Suggested order

**09** (clears the noise) → **01** (unblocks a whole consumer environment) →
**03** and **05** (short, high value, good filler sessions) → **02** (the big
one, land it in batches) → **04** → **08** → then decide **06**, **07** and
**10**.

**10 gets more expensive with every consumer**, so decide it early even if the
implementation waits. It is a re-skin, not a rename of anything public — but it
changes every colour on screen, and that is a different conversation once people
have shipped against it.

**07 depends on 02.** The logical-property sweep is exactly the change visual
baselines exist to police — a correct conversion should produce a zero-pixel diff
in LTR, and without baselines you have no way to know.

## What is *not* on this list

Tests and accessibility. Both are the strongest part of the repo and were checked
before this list was written:

- 77 unit test files; 41 of 42 components covered (`Code` is the exception)
- 44 story files with `play` functions; 33 files exercising keyboard interaction;
  54 `toHaveFocus` assertions
- axe at `test: "error"` in `.storybook/preview.tsx`, run across **both** themes
  as two separate vitest projects
- `scripts/check-contrast.ts` asserts every token pairing clears WCAG AA at the
  token level, which catches what axe structurally cannot (`:hover` fills, the
  dark palette)
- CI matrix across React 18 and 19, so the advertised peer range is verified
  rather than declared
- npm trusted publishing via OIDC with provenance; no secret to leak or rotate

Adding more of any of that is not where the next increment of value is.
