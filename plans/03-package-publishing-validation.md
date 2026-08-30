# 03 — Validate the published package (`publint` + `arethetypeswrong`)

**Effort:** S · **Risk:** low · **High value per hour spent**

## Problem

This package has ~80 subpath exports, is ESM-only, and ships types that only
resolve under certain `moduleResolution` settings. Today, the only automated
check is `scripts/check-exports.ts`, which asserts each `exports` target
**exists on disk**. Nothing asserts that a consumer can actually *resolve* it.

The README already documents, in prose, two failure modes that were presumably
found the hard way:

> subpath types only resolve under `"moduleResolution": "bundler"`, `"node16"`,
> or `"nodenext"`. The older `"node"` setting ignores the `exports` map entirely
> and fails with `TS2307` on every subpath.

> The package is also ESM-only — `require(...)` fails with
> `ERR_PACKAGE_PATH_NOT_EXPORTED`.

Prose in a README is not a test. `publint` and `arethetypeswrong` (`attw`) are
the standard tools that check exactly this class of problem, and with 80 export
entries hand-maintained in `package.json`, the odds of one drifting are high.

## Scope

**In:** `publint` and `attw` running in CI over the actual built tarball, plus a
minimal consumer-resolution smoke test.

**Out:** changing the export strategy itself. The subpath-only, no-barrel design
is deliberate — see `docs/` and the README's **Surprise** note.

## Approach

### 1. `publint`

Catches malformed `exports` maps, missing `types` conditions, files referenced
but not included in `files`, ESM/CJS mismatches.

```bash
bun add -d publint
```

Add a script and run it against the packed tarball rather than the working tree,
so it sees exactly what npm will serve:

```json
"check:publish": "npm pack --dry-run && publint --strict"
```

### 2. `arethetypeswrong`

Catches the "types resolve under bundler but not node16" class of problem —
precisely the `TS2307` failure the README warns about.

```bash
bun add -d @arethetypeswrong/cli
```

```json
"check:types-published": "attw --pack ."
```

Expect it to flag `require` resolution failures. Those are **intentional** here
(ESM-only by design) — configure the ignore list explicitly rather than
suppressing the whole rule, so a genuine regression still surfaces:

```json
"attw": { "ignoreRules": ["cjs-resolves-to-esm"] }
```

Record *why* each ignored rule is ignored, in the same voice as the existing
config comments.

### 3. Consumer resolution smoke test

`publint`/`attw` are static. A tiny fixture that actually type-checks a consumer
under each documented `moduleResolution` closes the loop. Something like
`scripts/check-consumer-resolution.ts`, or a `fixtures/consumer-*/tsconfig.json`
set, that runs `tsc --noEmit` against a file importing a handful of subpaths
under `bundler`, `node16`, and (asserting failure) `node`.

Keep it to ~5 representative subpaths, not all 80 — the point is the resolution
mode, not the coverage.

### 4. Wire into CI

Add to the `check` job in `.github/workflows/ci.yml`, after the existing build
(which `bun install` triggers via `prepare`):

```yaml
- name: Validate published package
  run: bun run check:publish && bun run check:types-published
```

## Acceptance criteria

- [ ] `publint --strict` passes against the packed tarball
- [ ] `attw --pack .` passes, with any ignored rule justified in a comment
- [ ] Consumer resolution fixture type-checks under `bundler` and `node16`
- [ ] All of the above run in the `check` CI job
- [ ] The README's module-resolution section links to the check that now enforces it

## Notes

- Commit type: `ci:` / `build:` depending on where the config lands.
- This is the cheapest item on the list and protects the largest hand-maintained
  surface in the repo (the 80-entry `exports` map). Good candidate for a short
  session.
