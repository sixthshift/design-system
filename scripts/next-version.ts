/**
 * Derives the next semver from Conventional Commit messages since the last v* tag.
 *
 * Prints the bare version (`0.2.0`) to stdout, or nothing at all when the range
 * holds no releasable commit — version.yml reads silence as "skip".
 *
 * The last tag, not package.json, is the reference point for what is already
 * released: a hand-edited manifest then cannot skip or replay a version. The
 * exception is the first release, which has no tag to count from and so ships
 * the version package.json declares.
 *
 *   bun run scripts/next-version.ts
 *   bun run scripts/next-version.ts --explain
 */

/// <reference types="bun" />
// Bun's ambient types are referenced here rather than in tsconfig's `types`,
// which is deliberately empty: this file needs `Bun` and `import.meta.dir`, and
// scoping the reference to the scripts that use them keeps those globals out of
// the library's own compilation (tsconfig.build.json compiles src/ only).

type Bump = "major" | "minor" | "patch";

const RANK: Record<Bump, number> = { patch: 0, minor: 1, major: 2 };

const CONVENTIONAL = /^(\w+)(?:\([^)]*\))?(!)?:/;

/**
 * A BREAKING CHANGE footer opens a paragraph; matching it anywhere a line begins
 * is not enough. Commit 5a61bc8's body wraps the prose "a renamed export needs
 * feat!: or a / BREAKING CHANGE: footer" across two lines, which a plain `^`
 * with the `m` flag reads as a footer and promotes a `ci:` commit to breaking.
 */
const BREAKING_FOOTER = /(?:^|\n[ \t]*\n)BREAKING[ -]CHANGE:/;

/**
 * Types that describe work on the repository rather than a change that can reach
 * the published tarball. The line is reachability, not importance: this package
 * ships raw `src/`, so `refactor:` alters the bytes a consumer receives and
 * `build:` alters what the bundler emits into `dist/`. Tests, workflows,
 * formatting and prose do not ship, so they earn no version of their own — they
 * ride the next real one.
 */
const UNRELEASABLE = new Set(["docs", "test", "chore", "style", "ci"]);

const run = (cmd: string[]): string => {
  const { stdout, exitCode, stderr } = Bun.spawnSync(cmd);
  if (exitCode !== 0) throw new Error(`${cmd.join(" ")} failed: ${new TextDecoder().decode(stderr)}`);
  return new TextDecoder().decode(stdout).trim();
};

/** Newest v* tag by semver order, or null on a repository that has never released. */
function lastTag(): string | null {
  const tags = run(["git", "tag", "--list", "v*", "--sort=-v:refname"]).split("\n").filter(Boolean);
  return tags[0] ?? null;
}

function commitsSince(tag: string | null): string[] {
  // %s\x1f%b\x1e keeps subject and body together and survives multi-line bodies.
  const range = tag ? `${tag}..HEAD` : "HEAD";
  const raw = run(["git", "log", range, "--format=%s%x1f%b%x1e"]);
  return raw
    .split("\x1e")
    .map((c) => c.trim())
    .filter(Boolean);
}

/** One commit (`subject\x1fbody`) → the bump it earns, or null for no release. */
export function bumpFor(commit: string): Bump | null {
  const [subject = "", body = ""] = commit.split("\x1f");

  // `feat!:` / `fix(scope)!:` and a BREAKING CHANGE footer both mean breaking.
  const parsed = CONVENTIONAL.exec(subject);
  if (parsed?.[2] || BREAKING_FOOTER.test(body)) return "major";

  // An unconventional subject still changed the package. Shipping a change
  // unversioned is worse than shipping it undersized, so it counts as a patch
  // rather than disappearing.
  if (!parsed) return "patch";

  const type = parsed[1]?.toLowerCase() ?? "";
  if (UNRELEASABLE.has(type)) return null;
  return type === "feat" ? "minor" : "patch";
}

export function strongestBump(commits: string[]): Bump | null {
  let strongest: Bump | null = null;
  for (const commit of commits) {
    const bump = bumpFor(commit);
    if (bump && (!strongest || RANK[bump] > RANK[strongest])) strongest = bump;
  }
  return strongest;
}

export function nextVersion(current: string, bump: Bump): string {
  const [major = 0, minor = 0, patch = 0] = current.split(".").map(Number);

  // Below 1.0.0 the public API is not yet stable, so a breaking change moves the
  // minor rather than declaring 1.0.0 on the library's behalf. Going 1.0.0 stays
  // a deliberate, manual act.
  if (major === 0) {
    if (bump === "major" || bump === "minor") return `0.${minor + 1}.0`;
    return `0.${minor}.${patch + 1}`;
  }

  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

if (import.meta.main) {
  const explain = Bun.argv.includes("--explain");
  const tag = lastTag();
  const commits = commitsSince(tag);

  if (explain) {
    for (const commit of commits) {
      console.error(`  ${(bumpFor(commit) ?? "none").padEnd(5)}  ${commit.split("\x1f")[0]}`);
    }
  }

  const bump = strongestBump(commits);
  const declared = (await Bun.file("package.json").json()).version as string;
  const next = bump === null ? null : tag ? nextVersion(tag.replace(/^v/, ""), bump) : declared;

  if (explain) {
    console.error(`\n  since:   ${tag ?? "(no tag yet — all history)"}`);
    console.error(`  commits: ${commits.length}`);
    console.error(`  bump:    ${bump ?? "none"}`);
    console.error(`  current: ${tag ? tag.replace(/^v/, "") : `${declared} (declared — first release)`}`);
    console.error(`  next:    ${next ?? "(no release)"}`);
  }

  if (next) console.log(next);
}
