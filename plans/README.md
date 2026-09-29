# Plans

Units of work for taking the design system to the next level, each sized to be
picked up cold in a fresh session. Written 2026-08-28 against `56e9cf9`; status
below is current.

Each file states the problem with evidence from the repo, what's in and out of
scope, a concrete approach with real file paths, and acceptance criteria.

## Status

Updated 2026-09-29. Eight of the ten have landed; two decisions remain open.

| # | Item | Status |
| --- | --- | --- |
| [09](09-housekeeping.md) | Housekeeping | **Done.** `clean:artifacts` added and the stale `coverage/` cleared (`0d73b47`); the two dangling stashes dropped 2026-09-29. |
| [01](01-use-client-directives.md) | `"use client"` + SSR smoke test | **Done** (`552964d`). `check:use-client` guards the boundaries. |
| [02](02-visual-regression-coverage.md) | Visual regression: 2 → 42 components | **Done** — every component has baselines, in both themes. |
| [03](03-package-publishing-validation.md) | `publint` + `arethetypeswrong` | **Done** (`b9d4b6e`), as `check:published` and `check:consumer-resolution` in CI. |
| [04](04-public-api-surface-snapshot.md) | API-surface snapshot | **Done** (`1f14ba6`). `check:api` in CI. |
| [05](05-coverage-thresholds.md) | Coverage thresholds | **Done** (`599499d`). |
| [08](08-bundle-size-budget.md) | Bundle size budget | **Done** (`23408e3`). `check:size` in CI. |
| [10](10-default-palette-premise.md) | Default palette premise | **Done** — consolidated to one theme, Linen (`63a3199`). |
| [06](06-changelog.md) | CHANGELOG (decision) | **Open.** Still a deliberate "no". Two breaking releases have gone out since, each explained only in its commit's `BREAKING CHANGE:` footer. Decide before 1.0. |
| [07](07-logical-properties-rtl.md) | Logical properties / RTL (decision) | **Open.** 17 component files still use physical `ml-`/`pr-`/`left-` classes; none use logical ones. The visual baselines it depended on (02) now exist. Decide before the next batch of components, which would add to the sweep. |

## Landed outside this list

- **Component axes** (`fb64d8e`) — `intent` / `variant` / `size` settled and recorded in [docs/component-axes.md](../docs/component-axes.md); intents defined once as slots (`src/theming/intents.css`); `link` → `inline`, `muted` removed, Badge defaults to `neutral`, group `appearance` collapsed.
- **Radius scale** (`dd8b4c6`) — the theme owns `--border-radius-{xs..xl}`; `check:radius` keeps source on it.
- **Components independent** (`104c8b0`) — a component that only resembles another (Toggle, ToggleGroup, TagChip, SearchInput, Sparkline) carries its own duplicated styling, tokens and types; composition and specialisation (pickers with Buttons, DateRangePicker on DatePicker) stay. The `*Recipe()` helpers are gone.
- **CI gaps closed** — `check:recipes` and `check:contrast` existed but were never run in CI; they are now, with `check:radius`.
- **Colour snapshot** — `component-colours.visual.test.tsx` holds every component token's computed colour, per cell, intent and mode, against a committed text file, closing the screenshot suite's blind spot for same-lightness hue changes.

## Known limits, recorded rather than planned

In [docs/component-axes.md](../docs/component-axes.md#structure-radius-shadow-border): per-component radius, shadows, border widths, and what a treatment draws are not themeable. Worth building only when a second theme needs to change shape, not just colour and corners. The screenshot suite's blind spot for same-lightness hue changes is now covered by the colour snapshot above.

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
