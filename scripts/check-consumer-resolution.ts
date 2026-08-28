/**
 * Type-check a consumer of the built package under every `moduleResolution`
 * setting the README makes a promise about.
 *
 * `publint` and `attw` read the `exports` map and the emitted files. This runs
 * the compiler a consumer would actually run, against
 * fixtures/consumer-resolution/consumer.tsx, which imports the package *by name*
 * so resolution has to go through `exports` and land on `dist/**\/*.d.ts`.
 *
 * The failing case is asserted as deliberately as the passing ones. `node10`
 * ignores `exports` entirely, so every subpath comes back `TS2307` — the README
 * documents that under **Module resolution**, and a check that only proved the
 * good paths would let that promise go stale in either direction. If node10
 * starts resolving, the export strategy changed and the docs need to change with
 * it; that is a failure here, not a quiet improvement.
 */

/// <reference types="bun" />
// Scoped here rather than in tsconfig's deliberately empty `types`, same as
// scripts/fix-extensions.ts: this file needs `Bun` and `import.meta.dir`.

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const FIXTURES = resolve(ROOT, "fixtures", "consumer-resolution");

type Expectation = { mode: string; resolves: true } | { mode: string; resolves: false; because: string };

/**
 * Every mode the README names as supported, plus the one it names as broken.
 * `bundler` is what Vite/webpack/Next use, `node16`/`nodenext` are what a plain
 * Node ESM consumer sets, and `node10` is the pre-`exports` algorithm that
 * TypeScript still ships as a default in older configs.
 */
const EXPECTATIONS: Expectation[] = [
  { mode: "bundler", resolves: true },
  { mode: "node16", resolves: true },
  { mode: "nodenext", resolves: true },
  { mode: "node10", resolves: false, because: "ignores the exports map, so every subpath is TS2307 — documented in the README" },
];

/** The five subpaths consumer.tsx imports, as they appear in a TS2307 message. */
const SUBPATHS = ["/button", "/date-time", "/heading", "/hooks", "/utils"];

if (!existsSync(resolve(ROOT, "dist"))) {
  console.error("check-consumer-resolution: dist/ does not exist — run the build first");
  process.exit(1);
}

async function typeCheck(mode: string): Promise<{ code: number; output: string }> {
  const proc = Bun.spawn(["bunx", "tsc", "--noEmit", "-p", resolve(FIXTURES, `tsconfig.${mode}.json`)], {
    cwd: ROOT,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { code: await proc.exited, output: `${stdout}${stderr}`.trim() };
}

const failures: string[] = [];

for (const expectation of EXPECTATIONS) {
  const { mode } = expectation;
  const { code, output } = await typeCheck(mode);

  if (expectation.resolves) {
    if (code === 0) {
      console.log(`check-consumer-resolution: ${mode} resolves`);
    } else {
      failures.push(`${mode}: expected a clean type-check, got exit ${code}\n${output}`);
    }
    continue;
  }

  // The negative case. An exit code alone is not enough — any compiler error
  // would satisfy it — so the message has to name every subpath.
  const unreported = SUBPATHS.filter((subpath) => !output.includes(`'@sixthshift/design-system${subpath}'`));

  if (code === 0) {
    failures.push(`${mode}: resolved, but it ${expectation.because}. The export strategy changed — update the README's Module resolution section.`);
  } else if (!output.includes("TS2307")) {
    failures.push(`${mode}: failed, but not with TS2307. Something other than module resolution is broken:\n${output}`);
  } else if (unreported.length > 0) {
    failures.push(`${mode}: TS2307 did not name ${unreported.join(", ")} — the fixture may have stopped importing them`);
  } else {
    console.log(`check-consumer-resolution: ${mode} fails with TS2307 on all ${SUBPATHS.length} subpaths, as documented`);
  }
}

if (failures.length > 0) {
  console.error(`check-consumer-resolution: ${failures.length} mode(s) did not behave as documented:`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(`check-consumer-resolution: all ${EXPECTATIONS.length} resolution mode(s) behave as the README says`);
