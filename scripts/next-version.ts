/**
 * Derives the next semver from Conventional Commit subjects since the last v* tag.
 *
 * Prints the next version to stdout, or nothing when no release is warranted.
 * Used by .github/workflows/version.yml; runnable locally to preview a release:
 *
 *   bun run scripts/next-version.ts
 *   bun run scripts/next-version.ts --explain
 */

type Bump = "major" | "minor" | "patch" | "none";

const RANK: Record<Bump, number> = { none: 0, patch: 1, minor: 2, major: 3 };

/** Types that produce a release. Everything else (chore, ci, docs, test, refactor, style, build) does not. */
const TYPE_BUMP: Record<string, Bump> = { feat: "minor", fix: "patch", perf: "patch" };

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

export function bumpFor(commit: string): Bump {
  const [subject = "", body = ""] = commit.split("\x1f");

  // `feat!:` / `fix(scope)!:` and a BREAKING CHANGE footer both mean breaking.
  if (/^[a-z]+(\([^)]*\))?!:/.test(subject) || /^BREAKING[ -]CHANGE:/m.test(body)) return "major";

  const type = subject.match(/^([a-z]+)(\([^)]*\))?:/)?.[1];
  return (type && TYPE_BUMP[type]) || "none";
}

export function nextVersion(current: string, bump: Bump): string | null {
  if (bump === "none") return null;
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

  let highest: Bump = "none";
  for (const c of commits) {
    const b = bumpFor(c);
    if (RANK[b] > RANK[highest]) highest = b;
    if (explain) console.error(`  ${b.padEnd(5)}  ${c.split("\x1f")[0]}`);
  }

  const current = (await Bun.file("package.json").json()).version as string;
  const next = nextVersion(current, highest);

  if (explain) {
    console.error(`\n  since:   ${tag ?? "(no tag yet — all history)"}`);
    console.error(`  commits: ${commits.length}`);
    console.error(`  bump:    ${highest}`);
    console.error(`  current: ${current}`);
    console.error(`  next:    ${next ?? "(no release)"}`);
  }

  if (next) console.log(next);
}
