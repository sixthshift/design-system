# 04 — Make the versioning policy enforceable with an API-surface snapshot

**Effort:** M · **Risk:** low

## Problem

The README states the policy plainly:

> Component props **and token names** are public API — renaming a token is a
> breaking change.

> A renamed or removed export needs `feat!:` or a `BREAKING CHANGE:` footer.
> Filed as `refactor:` it cuts a patch, which understates it.

Nothing enforces this. `scripts/next-version.ts` derives the bump from the commit
**subject line** — so the correctness of every published version number rests on
the author remembering, at commit time, that the change they just made was
breaking. Releases are fully automatic (CI green → tag → npm publish with
provenance), which means a mislabelled commit ships a wrong semver to consumers
with no human gate in between.

Recent history shows this is a live concern rather than a hypothetical:
`1be95c3 refactor(theme)!: rename the size and intent vocabularies` and
`1f4a2d0 fix(radio-button)!: a selected radio stays selected` — both correctly
marked, but both entirely dependent on the author catching it.

## Scope

**In:** a committed snapshot of the public API surface — exported names, prop
types, and token names — diffed on every run, so a breaking change is visible in
the pull request diff and can gate the release.

**Out:** changing the release mechanism itself. The tag-driven, OIDC-published
pipeline is well-designed and this should plug into it, not replace it.

## Approach

### 1. What goes in the snapshot

Three surfaces, all of which the README calls public API:

1. **Exported names per subpath** — every `export { … }` reachable from each of
   the ~80 `exports` entries, with its kind (value / type).
2. **Component prop types** — the resolved public shape of each `*Props` type.
   Renaming `intent` → `tone` on one component must show up as a diff.
3. **Token names** — the CSS custom properties declared in
   `src/theme/tokens.css`, plus the vocabularies exported from
   `src/theme/schema.ts` (`intents`, `semantics`, `states`, `weights`,
   `hierarchy`, `contexts`, `standaloneTokens`).

Token names matter as much as props here: the recipes layer
(`src/theme/recipes/*.css`) and the `@theme` block are what consumers override,
and the README explicitly makes them API.

### 2. Generating it

Two workable approaches — pick one:

**(a) TypeScript compiler API.** A `scripts/api-snapshot.ts` that loads
`tsconfig.build.json`, walks each `exports` entry point, and emits a normalised,
sorted text file. Full control, no new dependency, consistent with the existing
`scripts/` style (`check-exports.ts`, `check-contrast.ts`, `check-recipes.ts` are
all hand-rolled and well-commented). Most work up front.

**(b) `@microsoft/api-extractor`.** Purpose-built, produces a `.api.md` report
designed to be committed and diffed. Adds a heavy dependency and is awkward with
80 entry points — it expects one.

Given the repo's established habit of small purpose-built scripts, **(a) is the
better fit**. Emit to `api/public-api.txt` (or `docs/public-api.md`) and commit it.

Token half is easy and can land first as its own commit: parse
`src/theme/tokens.css` for `--*` declarations exactly as `check-contrast.ts`
already parses that file, and sort.

### 3. Enforcing it

```json
"check:api": "bun run scripts/api-snapshot.ts --check"
```

- `--check` regenerates in memory and diffs against the committed file; non-zero
  exit with a readable diff on mismatch.
- No flag: rewrites the file (what you run after an intentional change).

Add to the `check` CI job. The failure message should say what to do:

> Public API changed. Review the diff, run `bun run scripts/api-snapshot.ts` to
> accept it, and make sure the commit subject carries `!` or a
> `BREAKING CHANGE:` footer if anything was renamed or removed.

### 4. Optional: connect it to the version bump

Stronger version — have `scripts/next-version.ts` refuse to cut a
non-breaking release when the API snapshot shows a **removal or rename** since
the last tag. That turns the policy from documented to mechanical. Do this only
after the snapshot has been stable for a few releases; a false positive here
blocks publishing.

## Acceptance criteria

- [ ] `api/public-api.txt` (or equivalent) committed, covering exported names, prop shapes, and token names
- [ ] `bun run check:api` fails on any uncommitted API change with a readable diff
- [ ] Runs in the `check` CI job
- [ ] README's **Versioning** section links to the snapshot as the enforcement mechanism
- [ ] (Optional, later) `next-version.ts` refuses a patch/minor when the snapshot shows removals

## Notes

- The first generated snapshot will be large. Commit it on its own as
  `chore:` (no release) so the diff of the *next* change is meaningful.
- This also doubles as documentation: a single file showing the whole public
  surface is useful to a consumer and to future you.
