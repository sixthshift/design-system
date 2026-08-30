/**
 * Validate the package as npm will serve it: `publint` and `arethetypeswrong`
 * over the packed tarball, plus the one invariant those two cannot check on
 * their own.
 *
 * scripts/check-exports.ts asserts every `exports` target exists on disk. That
 * is a different question from whether a consumer can *resolve* it, which is
 * what this file is for — with 69 hand-maintained subpath entries, resolution is
 * the largest untested surface in the repo.
 */

/// <reference types="bun" />
// Scoped here rather than in tsconfig's deliberately empty `types`, same as
// scripts/fix-extensions.ts: this file needs `Bun` and `import.meta.dir`.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");

/**
 * attw is run with `--profile esm-only`, which drops the `node10` and
 * `node16 (from CJS)` columns.
 *
 * Without it the run is 70 red rows and permanently failing, because both
 * findings are the package's design rather than defects: `node10` predates
 * `exports` and cannot see the map at all, and a `require` of an ESM file is
 * what an ESM-only package is *supposed* to do. Both are documented in the
 * README under **Module resolution**, and scripts/check-consumer-resolution.ts
 * pins the node10 half by asserting it still fails with TS2307.
 *
 * Dropping two whole columns is safer than `--ignore-rules cjs-resolves-to-esm`
 * — every rule stays armed on the modes the package actually supports — but it
 * does have one blind spot: if someone adds a `require` condition, the CJS
 * column that would have complained is no longer being read. So the shape of
 * the map is asserted here instead. That is what makes the profile honest: the
 * columns are ignored *because* the map is provably ESM-only, not merely
 * assumed to be.
 */
const ALLOWED_CONDITIONS = ["types", "import"] as const;

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
  exports: Record<string, string | Record<string, string>>;
};

/** Not JS or TS entry points, so attw has nothing to resolve for them — every theme stylesheet. */
const NON_CODE_ENTRYPOINTS = Object.keys(pkg.exports).filter((subpath) => subpath.endsWith(".css"));

// ---------------------------------------------------------------------------
// 1. The ESM-only invariant
// ---------------------------------------------------------------------------

const shapeProblems: string[] = [];

for (const [subpath, target] of Object.entries(pkg.exports)) {
  if (NON_CODE_ENTRYPOINTS.includes(subpath)) {
    if (typeof target !== "string") shapeProblems.push(`${subpath}: expected a bare path, got a conditions object`);
    continue;
  }

  if (typeof target === "string") {
    shapeProblems.push(`${subpath}: a bare path has no "types" condition, so consumers get no declarations`);
    continue;
  }

  const conditions = Object.keys(target);
  const unexpected = conditions.filter((condition) => !ALLOWED_CONDITIONS.includes(condition as (typeof ALLOWED_CONDITIONS)[number]));
  const missing = ALLOWED_CONDITIONS.filter((condition) => !conditions.includes(condition));

  if (unexpected.length > 0) {
    shapeProblems.push(
      `${subpath}: unexpected condition(s) ${unexpected.map((c) => `"${c}"`).join(", ")}. The package is ESM-only, and attw is run with --profile esm-only on that basis — adding a "require" condition needs real CJS output and a different attw profile, not just a new line here.`
    );
  }
  if (missing.length > 0) {
    shapeProblems.push(`${subpath}: missing condition(s) ${missing.map((c) => `"${c}"`).join(", ")}`);
  }
}

if (shapeProblems.length > 0) {
  console.error(`check-published: ${shapeProblems.length} export entr(ies) are not the expected ESM-only shape:`);
  for (const problem of shapeProblems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`check-published: all ${Object.keys(pkg.exports).length} export entries are {${ALLOWED_CONDITIONS.join(", ")}}, so --profile esm-only is safe`);

// ---------------------------------------------------------------------------
// 2. publint and attw, over the packed tarball
// ---------------------------------------------------------------------------

async function run(label: string, command: string[]): Promise<boolean> {
  console.log(`\ncheck-published: ${label}`);
  const proc = Bun.spawn(command, { cwd: ROOT, stdout: "inherit", stderr: "inherit" });
  return (await proc.exited) === 0;
}

const checks: [string, string[]][] = [
  ["publint --strict", ["bunx", "publint", "--strict"]],
  [
    "attw --profile esm-only",
    [
      "bunx",
      "attw",
      "--pack",
      ".",
      "--profile",
      "esm-only",
      "--exclude-entrypoints",
      ...NON_CODE_ENTRYPOINTS.map((entry) => entry.replace(/^\.\//, "")),
      "--summary",
      "--format",
      "ascii",
    ],
  ],
];

const failed: string[] = [];
for (const [label, command] of checks) {
  if (!(await run(label, command))) failed.push(label);
}

if (failed.length > 0) {
  console.error(`\ncheck-published: ${failed.join(" and ")} reported problems`);
  process.exit(1);
}

console.log("\ncheck-published: the packed package lints clean and its types resolve");
