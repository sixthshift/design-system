# 08 — Verify the tree-shaking claim with a size budget

**Effort:** S–M · **Risk:** low

## Problem

The README makes a specific performance promise:

> The module tree is preserved rather than bundled, so subpath imports still
> tree-shake.

Nothing verifies it. The claim rests on `"sideEffects": ["**/*.css"]`, on `tsc`
preserving the module tree, and on no module accidentally importing something
heavy at the top level. All three are true today by construction and by
inspection, but none is asserted.

The repo already learned this lesson once, expensively:

> Keeping Monaco out of the default install matters: it is ~74 MB on disk, and
> until now every consumer of `/button` paid for it.

That was fixed by moving Monaco to an optional peer dependency. But the same
class of regression — one component importing another module that drags in a
subtree — is invisible until a consumer notices their bundle grew. A single
stray `import { something } from "../../index"` or a barrel import inside a
component would silently undo it.

## Scope

**In:** a measured, committed size budget per representative subpath entry,
checked in CI.

**Out:** optimising bundle size. Current numbers are presumably fine; this is a
regression guard, not a diet.

## Approach

### 1. Pick the entries worth measuring

Not all 80. Choose ~8 that represent the shape of the library:

- `/button` — the canary. It is the smallest useful import and the one most
  likely to accidentally pull in the world
- `/utils` — should be nearly nothing
- `/input`, `/card` — typical primitives
- `/modal` — pulls in Floating UI and the overlay context
- `/date-picker` — pulls in the Temporal polyfill via `/date-time`
- `/line-chart` — the heaviest non-optional component
- `/markdown` or `/code-editor` — should be excluded or measured *without* their
  optional peers, to confirm the peer split is actually holding

The critical assertion is that `/button` does **not** contain Floating UI,
Temporal, or Monaco.

### 2. Measure

Bundle each entry in isolation with a real bundler and record min+gzip. Options:

- **`size-limit`** — purpose-built, has a `--why` mode that shows what pulled a
  module in, integrates with CI. Best fit.
- **A hand-rolled `scripts/check-size.ts`** — consistent with the repo's habit
  of small purpose-built scripts (`check-exports.ts`, `check-contrast.ts`,
  `check-recipes.ts`), using esbuild or Rollup directly. More control, more code.

Given there is already a `scripts/` convention and the existing scripts are
well-commented and deliberate, either is defensible. `size-limit` gets you the
`--why` output for free, which is the part you actually want when a budget
fails.

Measure against `dist/`, after `bun run build` — not against `src/`.

### 3. Set budgets

Set each budget slightly above the measured value. Include, alongside the number,
an assertion about **contents** — a size budget catches growth, but a content
assertion catches the specific failure mode you care about:

```
/button must not include: @floating-ui, @js-temporal, monaco-editor
```

That check is cheap (scan the bundle output for the module ids) and is the real
guarantee. The byte budget is the backstop.

### 4. Wire into CI

Add to the `check` job in `.github/workflows/ci.yml`, after the build. On
failure, the message should point at `--why` output so the cause is one command
away.

## Acceptance criteria

- [ ] ~8 representative subpaths have a measured, committed budget
- [ ] `/button` is asserted to contain no Floating UI, no Temporal, no Monaco
- [ ] Budgets are checked against `dist/` in CI
- [ ] A failure message explains how to see *why* a bundle grew
- [ ] The README's tree-shaking claim links to the check that backs it

## Notes

- Commit type: `ci:` / `test:` — no release.
- Expect the first run to be informative regardless of outcome. If something
  unexpected is already in `/button`, that is a real finding and worth its own
  fix commit before the budget lands.
