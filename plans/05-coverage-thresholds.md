# 05 — Turn on coverage thresholds

**Effort:** S · **Risk:** low

## Problem

`@vitest/coverage-v8` is installed and a `coverage/` directory exists, but
`vitest.config.ts` configures **no** `coverage` block and no thresholds, and no
CI job produces a report. Coverage is currently high — 41 of 42 components have
a unit test file, 77 test files in total — which makes this the cheap moment to
lock it in. Adding thresholds after coverage has drifted down means either
ratcheting them below where you actually want them, or a large catch-up task.

Secondary evidence that the untracked `coverage/` output is stale and misleading:
it still contains reports for components that no longer exist in the tree
(`Avatar`, `Skeleton`, `NavSide`, `HeatMap`, …) and is feeding phantom
TypeScript diagnostics into the editor. See `09` in the index.

## Scope

**In:** a coverage config, thresholds set just under current measured values, and
a CI job that enforces them.

**Out:** chasing 100%. The goal is a ratchet against regression, not a number.

## Approach

### 1. Measure first

```bash
bunx vitest run --project unit --project date-time --coverage
```

Record the actual line/branch/function/statement numbers before choosing
thresholds. Set each threshold a couple of points *below* the measured value —
tight enough to catch a real drop, loose enough that a legitimate refactor
doesn't fail CI on noise.

### 2. Configure

In `vitest.config.ts`, at the top-level `test` block:

```ts
coverage: {
  provider: "v8",
  reporter: ["text-summary", "html", "lcov"],
  include: ["src/**/*.{ts,tsx}"],
  exclude: [
    "src/**/*.test.{ts,tsx}",
    "src/**/*.stories.tsx",
    "src/stories/**",      // Storybook-only docs surface
    "src/testing/**",      // test helpers
    "src/**/index.ts",     // re-export barrels carry no logic
  ],
  thresholds: { lines: 0, branches: 0, functions: 0, statements: 0 }, // ← fill from step 1
},
```

Decide deliberately whether `src/date-time/` is in scope — it is pure logic with
its own project and should score high.

Note that the `unit` project runs happy-dom while behaviour is also exercised by
the browser-mode `storybook` and `visual` projects. Coverage from the unit
project alone will *understate* how well-tested a component is. Either accept
that (simplest — set thresholds accordingly) or merge coverage across projects
(more accurate, more config). Write down which you chose and why.

### 3. Enforce in CI

Add to the `check` job in `.github/workflows/ci.yml`:

```yaml
- name: Coverage
  run: bunx vitest run --project unit --project date-time --coverage
```

Keep it separate from the plain `Tests` step, or replace that step — running the
suite twice doubles the job time for no benefit.

### 4. Ratchet

When coverage rises meaningfully, raise the thresholds in the same commit. A
threshold that never moves stops being a signal.

## Acceptance criteria

- [ ] `coverage` block in `vitest.config.ts` with explicit `include`/`exclude`
- [ ] Thresholds set from measured values, not guessed
- [ ] CI fails when coverage drops below them
- [ ] The single uncovered component (`Code`) is either covered or has a recorded reason for exemption
- [ ] Stale `coverage/` output cleared (see `09`)

## Notes

- Commit type: `test:` or `ci:` — no release either way.
- `Code` (Monaco-backed) is the one component with no test file. It may be
  genuinely impractical to unit test; if so, exclude it explicitly with a
  comment rather than letting it quietly drag the average.
