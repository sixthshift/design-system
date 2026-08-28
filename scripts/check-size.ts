/**
 * Hold each representative subpath to a measured byte budget, and assert what it
 * is allowed to contain.
 *
 * The README makes a promise:
 *
 *   > The module tree is preserved rather than bundled, so subpath imports still
 *   > tree-shake.
 *
 * It rests on three things being true — `sideEffects` naming only CSS, tsc
 * preserving the module tree, and no module importing something heavy at the top
 * level — and none of them was asserted. The repo already paid for this once:
 * Monaco is ~74 MB on disk, and until it moved to an optional peer, every
 * consumer of `/button` installed it.
 *
 * The byte budget is the backstop. The real guarantee is `mustNotContain`: a
 * single stray `import { x } from "../../index"` inside a primitive would drag a
 * subtree in, and that is invisible in a byte count until it is already large.
 *
 *   bun run scripts/check-size.ts              check every entry
 *   bun run scripts/check-size.ts --why ./button   what is in one, by input size
 *
 * Measured against `dist/`, after a build. Each entry is bundled *in isolation*,
 * so a dependency shared by several entries is counted once per entry — these
 * are the cost of importing that subpath alone, not a sum of what an app pays.
 */

/// <reference types="bun" />
// Scoped here rather than in tsconfig's deliberately empty `types`, same as
// scripts/fix-extensions.ts: this file needs `Bun` and `import.meta.dir`.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import esbuild from "esbuild";

const ROOT = resolve(import.meta.dir, "..");

/**
 * Left external because a consumer already has them: the required peers, and
 * the optional ones that are only installed by consumers who import the entry
 * point needing them (see the peer dependency table in the README).
 *
 * Everything else — clsx, tailwind-merge, cva, Floating UI, lucide, the Temporal
 * polyfill — is a real `dependencies` entry that lands in a consumer's bundle,
 * so it is measured rather than excused.
 */
const EXTERNAL = [
  "react",
  "react-dom",
  "react/*",
  "react-dom/*",
  "@monaco-editor/react",
  "monaco-editor",
  "react-markdown",
  "remark-gfm",
  "@fontsource-variable/*",
];

type Budget = {
  subpath: string;
  /** gzipped bytes, measured then given a little headroom. */
  gzip: number;
  /** Package names that must not appear in the bundle, whether inlined or imported. */
  mustNotContain: string[];
  note?: string;
};

/** The three that cost the most, and the ones a primitive must never reach for. */
const HEAVY = ["@floating-ui/react", "@js-temporal/polyfill", "monaco-editor", "lucide-react"];

/**
 * Nine entries, chosen for shape rather than coverage: the floor, the canary,
 * two typical primitives, the two that legitimately pull something large, and
 * the two whose whole point is that an optional peer stays out.
 *
 * Budgets measured on 2026-08-28 against dist/ and rounded up by roughly a
 * tenth. Tight enough that a stray barrel import fails; loose enough that
 * adding a prop does not.
 */
const BUDGETS: Budget[] = [
  { subpath: "./utils", gzip: 9500, mustNotContain: HEAVY, note: "the floor — almost entirely tailwind-merge, which every other entry also pays" },
  { subpath: "./button", gzip: 11000, mustNotContain: HEAVY, note: "the canary: smallest useful import, most likely to accidentally pull in the world" },
  { subpath: "./input", gzip: 10000, mustNotContain: HEAVY },
  { subpath: "./card", gzip: 10000, mustNotContain: HEAVY },
  { subpath: "./badge", gzip: 10200, mustNotContain: HEAVY },
  {
    subpath: "./modal",
    gzip: 28000,
    mustNotContain: ["@js-temporal/polyfill", "monaco-editor"],
    note: "Floating UI and the overlay context are the point of it",
  },
  {
    subpath: "./line-chart",
    gzip: 29500,
    mustNotContain: ["@js-temporal/polyfill", "monaco-editor"],
    note: "heaviest non-optional component; Floating UI arrives via Tooltip",
  },
  { subpath: "./date-picker", gzip: 85000, mustNotContain: ["monaco-editor"], note: "the Temporal polyfill and its jsbi dependency are most of this" },
  { subpath: "./markdown", gzip: 10500, mustNotContain: HEAVY, note: "react-markdown is an optional peer — if this grows, the split broke" },
  {
    subpath: "./code-editor",
    gzip: 3200,
    mustNotContain: ["@floating-ui/react", "@js-temporal/polyfill", "monaco-editor"],
    note: "Monaco is an optional peer — if this grows, the split broke",
  },
];

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
  exports: Record<string, string | Record<string, string>>;
};

function importTarget(subpath: string): string {
  const entry = pkg.exports[subpath];
  if (!entry || typeof entry === "string" || !entry.import) {
    console.error(`check-size: package.json has no "import" condition for ${subpath}`);
    process.exit(1);
  }
  return resolve(ROOT, entry.import);
}

type Measurement = {
  gzip: number;
  raw: number;
  /** Package name -> bytes it contributed, largest first. */
  packages: [string, number][];
  /** Every package reachable from the bundle, inlined or left external. */
  present: Set<string>;
};

/** Bucket for this package's own modules, which have no node_modules segment. */
const OWN_MODULES = "(this package)";

/** `node_modules/@floating-ui/react/dist/x.js` -> `@floating-ui/react`. */
function packageOf(path: string): string | null {
  const index = path.lastIndexOf("node_modules/");
  if (index === -1) return null;
  const rest = path.slice(index + "node_modules/".length).split("/");
  return rest[0]?.startsWith("@") ? `${rest[0]}/${rest[1]}` : (rest[0] ?? null);
}

async function measure(subpath: string): Promise<Measurement> {
  const target = importTarget(subpath);
  const result = await esbuild.build({
    // `export *` rather than a bare import: a side-effect-only import would let
    // esbuild drop the whole module and measure nothing.
    stdin: { contents: `export * from "${target}";`, resolveDir: ROOT, loader: "ts" },
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2020",
    write: false,
    metafile: true,
    external: EXTERNAL,
    logLevel: "silent",
  });

  const output = result.outputFiles[0];
  if (!output) throw new Error(`check-size: esbuild produced no output for ${subpath}`);

  const bytesByPackage = new Map<string, number>();
  const present = new Set<string>();

  // `bytesInOutput`, not the input size. lucide-react is 1.4 MB of source and
  // contributes a couple of hundred bytes after tree-shaking; reporting the
  // input size would point every investigation at the wrong module.
  for (const meta of Object.values(result.metafile.outputs)) {
    for (const [path, contribution] of Object.entries(meta.inputs)) {
      const name = packageOf(path) ?? OWN_MODULES;
      bytesByPackage.set(name, (bytesByPackage.get(name) ?? 0) + contribution.bytesInOutput);
    }
  }
  for (const path of Object.keys(result.metafile.inputs)) {
    const name = packageOf(path);
    if (name) present.add(name);
  }
  // Externals never appear in `inputs`, so a primitive importing Monaco would
  // look clean. They do appear as the output's own imports.
  for (const meta of Object.values(result.metafile.outputs)) {
    for (const imported of meta.imports) {
      const name = packageOf(imported.path) ?? imported.path;
      if (!imported.path.startsWith(".") && !imported.path.startsWith("/")) present.add(name);
    }
  }

  return {
    gzip: gzipSync(Buffer.from(output.text)).length,
    raw: output.text.length,
    packages: [...bytesByPackage.entries()].sort((a, b) => b[1] - a[1]),
    present,
  };
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`;

if (!existsSync(resolve(ROOT, "dist"))) {
  console.error("check-size: dist/ does not exist — run the build first");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// --why
// ---------------------------------------------------------------------------

const whyIndex = process.argv.indexOf("--why");
if (whyIndex !== -1) {
  const subpath = process.argv[whyIndex + 1];
  if (!subpath) {
    console.error(`check-size: --why needs a subpath, e.g. --why ./button`);
    process.exit(1);
  }
  const { gzip, raw, packages } = await measure(subpath);
  console.log(`${subpath}: ${kb(gzip)} gzipped, ${kb(raw)} minified\n`);
  console.log("  bytes in the minified bundle, after tree-shaking:");
  for (const [name, bytes] of packages) console.log(`    ${kb(bytes).padStart(10)}  ${name}`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Check
// ---------------------------------------------------------------------------

const overBudget: string[] = [];
const contamination: string[] = [];

for (const budget of BUDGETS) {
  const { gzip, present } = await measure(budget.subpath);
  const headroom = budget.gzip - gzip;
  const status = headroom < 0 ? "OVER" : `${((headroom / budget.gzip) * 100).toFixed(0)}% spare`;
  console.log(`check-size: ${budget.subpath.padEnd(15)} ${kb(gzip).padStart(9)} / ${kb(budget.gzip).padStart(9)}  ${status}`);

  if (headroom < 0) overBudget.push(`${budget.subpath}: ${kb(gzip)} gzipped, budget ${kb(budget.gzip)}`);

  for (const forbidden of budget.mustNotContain) {
    if (present.has(forbidden)) contamination.push(`${budget.subpath} now reaches ${forbidden}`);
  }
}

if (contamination.length > 0) {
  console.error(`\ncheck-size: ${contamination.length} entr(ies) reach a package they must not:`);
  for (const line of contamination) console.error(`  ${line}`);
}

if (overBudget.length > 0) {
  console.error(`\ncheck-size: ${overBudget.length} entr(ies) over budget:`);
  for (const line of overBudget) console.error(`  ${line}`);
}

if (contamination.length + overBudget.length > 0) {
  console.error("\nSee what is in a bundle with:");
  console.error("  bun run scripts/check-size.ts --why ./button");
  console.error("\nIf the growth is intended, raise the number in BUDGETS in this file, in the same commit.");
  process.exit(1);
}

console.log(`\ncheck-size: all ${BUDGETS.length} entries within budget, and none reaches a package it must not`);
