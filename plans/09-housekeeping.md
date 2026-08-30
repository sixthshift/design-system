# 09 — Housekeeping: stale artefacts and dangling stashes

**Effort:** XS · **Risk:** none · **Do this first, it takes two minutes**

## Problem

Three bits of local debris, none of which affect the published package but all of
which cost attention.

### 1. Stale `coverage/` output is generating phantom editor diagnostics

`coverage/` is gitignored but still present on disk, and it contains reports for
components that **no longer exist** in the tree:

```
coverage/components/Avatar
coverage/components/Skeleton
coverage/components/NavSide
coverage/components/HeatMap
```

The language server is picking these up and reporting TypeScript errors for
`Avatar.stories.tsx`, `Skeleton.stories.tsx`, `NavSide.tsx`, `NavBottom.tsx`,
`HeatMapCalendar.tsx`, `HeatMapMatrix.tsx`, `Breadcrumb.stories.tsx`,
`EmptyState.stories.tsx`, `StatsCard.stories.tsx`, `MetricList.stories.tsx` and
`ColorDot.stories.tsx` — none of which are files in this repo. Every one of those
errors is noise, and noise that persistent trains you to ignore the diagnostics
panel, which is where the real errors also appear.

```bash
rm -rf coverage
```

Related: `.vitest-attachments/` is also gitignored, present, and holds visual
diff output from past failures. Safe to clear.

### 2. Two dangling stashes

```
stash@{0}: WIP on main: 5a67a4e feat!: author design tokens in CSS instead of JSON
stash@{1}: WIP on main: 5a67a4e feat!: author design tokens in CSS instead of JSON
```

Both sit on `5a67a4e`, which is now several commits behind `main`. Either they
contain something worth recovering — in which case look now, while the context is
still recoverable — or they don't, and they should go. A stash you're not sure
about is a stash you'll never apply.

```bash
git stash show -p stash@{0}    # inspect
git stash show -p stash@{1}
git stash drop stash@{1}       # once confirmed dead
```

### 3. Uncommitted work in progress

The working tree currently has a substantial in-flight change: a
`src/stories/theme/` → `src/stories/semantic-colors/` rename, a new
`src/stories/theming/` directory, new `Theme.mdx`, `read-theme-source.ts`,
`theme-reference.visual.test.tsx`, and a `overview-links.test.ts` →
`mdx-links.test.ts` rename. Land or park it before starting on anything in this
plans directory — the visual-regression work in `02` in particular will collide
with it.

## Acceptance criteria

- [ ] `coverage/` and `.vitest-attachments/` cleared; editor diagnostics quiet
- [ ] Both stashes inspected and either applied or dropped
- [ ] In-flight Storybook/theme work committed or explicitly parked
- [ ] Consider adding a `clean:artifacts` script alongside the existing `clean` / `clean:dist`

## Notes

- Nothing here ships, so nothing here releases. `chore:` if any of it produces a
  commit at all.
