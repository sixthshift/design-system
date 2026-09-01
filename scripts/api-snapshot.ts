/**
 * Emit the package's public API surface as one committed, diffable text file.
 *
 * The README makes a promise it cannot keep on its own:
 *
 *   > Component props **and token names** are public API — renaming a token is
 *   > a breaking change.
 *
 * Nothing enforced it. scripts/next-version.ts derives the version bump from the
 * commit *subject*, and releases are unattended — CI green, tag, npm publish. So
 * the correctness of every published version number rested on the author
 * remembering, at commit time, that what they just wrote was breaking. A
 * mislabelled `refactor:` cuts a patch and ships a rename to consumers with no
 * human in between.
 *
 * This makes the surface visible instead. Three sections, all of which the
 * README calls public API:
 *
 *   1. what each subpath exports, and whether it is a value or a type
 *   2. the resolved shape of every exported type and value signature
 *   3. every design token name, plus the vocabularies vocabulary.ts exports
 *
 * Read from `dist/`, not `src/` — the question is what a consumer resolves, and
 * the emitted `.d.ts` is the answer. Run the build first.
 *
 *   bun run scripts/api-snapshot.ts            rewrite api/public-api.txt
 *   bun run scripts/api-snapshot.ts --check    fail if it would change
 *
 * The `--check` form is what CI runs. It does not attempt to judge whether a
 * change is breaking; that is a human call, and the point is that the diff
 * arrives in the pull request where it can be made.
 */

/// <reference types="bun" />
// Scoped here rather than in tsconfig's deliberately empty `types`, same as
// scripts/fix-extensions.ts: this file needs `import.meta.dir`.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import ts from "typescript";

const ROOT = resolve(import.meta.dir, "..");
const SNAPSHOT = resolve(ROOT, "api", "public-api.txt");
const TOKEN_SOURCES = [
  resolve(ROOT, "src", "theme", "linen", "palette.css"),
  resolve(ROOT, "src", "theme", "linen", "theme.css"),
  resolve(ROOT, "src", "theming", "tailwind.css"),
];

const check = process.argv.includes("--check");

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
  exports: Record<string, string | Record<string, string>>;
};

/** Subpath -> its `types` target. `./theme.css` has none; it is not code. */
const entryPoints: [string, string][] = [];
for (const [subpath, target] of Object.entries(pkg.exports)) {
  if (typeof target === "string") continue;
  const types = target.types;
  if (types) entryPoints.push([subpath, resolve(ROOT, types)]);
}
entryPoints.sort(([a], [b]) => a.localeCompare(b));

const missing = entryPoints.filter(([, file]) => !existsSync(file));
if (missing.length > 0) {
  console.error("api-snapshot: dist/ is missing declaration files — run the build first:");
  for (const [subpath, file] of missing) console.error(`  ${subpath} -> ${relative(ROOT, file)}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/** One line, no comments, single-spaced — so the diff is about the type. */
function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

const WRAP_AT = 160;

/**
 * Break a long type at its outer separators.
 *
 * `ColorModeSchema` prints as one 13,000-character line: a mapped type over
 * every token in the system. Renaming a token is a legitimate diff there and an
 * unreadable one — the whole line rewrites. Splitting turns it into the handful
 * of changed lines a reviewer can actually see.
 *
 * Two different separators, because they mean different things:
 *
 *   - `|` splits only at depth 0, where it separates the members of a long
 *     union like `BgToken`. Deeper, it is almost always `X | undefined` on an
 *     optional property, and breaking that is pure noise.
 *   - `;` and `,` split at any depth, because they separate object members —
 *     and members are exactly the granularity a reviewer wants a token or prop
 *     rename to show up at.
 *
 * Both rules are positional, so the output is deterministic, which is what
 * matters: `--check` compares bytes.
 */
function wrap(type: string, indent: string): string[] {
  if (type.length <= WRAP_AT) return [type];

  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of type) {
    if ("<([{".includes(char)) {
      current += char;
      depth++;
      continue;
    }
    if (">)]}".includes(char)) {
      depth--;
      current += char;
      continue;
    }
    if (char === "|" && depth === 0) {
      parts.push(current.trim());
      current = "| ";
      continue;
    }
    if (char === ";" || char === ",") {
      parts.push(`${current}${char}`.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());

  if (parts.length <= 1) return [type];
  // The `| ` prefix picks up the space that followed the separator.
  const tidy = parts.map((part) => part.replace(/^\|\s+/, "| "));
  return tidy.map((part, index) => (index === 0 ? part : `${indent}${part}`));
}

const program = ts.createProgram(
  entryPoints.map(([, file]) => file),
  {
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
  }
);
const checker = program.getTypeChecker();

// NoTruncation because the default elides long types with `...`, which would
// make the snapshot silently incomplete. InTypeAlias so an alias prints its
// definition rather than its own name.
const TYPE_FLAGS = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias;

const lines: string[] = [];
const exportCounts: number[] = [];

for (const [subpath, file] of entryPoints) {
  const source = program.getSourceFile(file);
  if (!source) {
    console.error(`api-snapshot: TypeScript did not load ${relative(ROOT, file)}`);
    process.exit(1);
  }
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) {
    console.error(`api-snapshot: ${subpath} -> ${relative(ROOT, file)} exports nothing`);
    process.exit(1);
  }

  const exported = checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol) => {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      const isType = Boolean(target.flags & (ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Interface));
      const declaration = target.declarations?.[0];
      const type = isType ? checker.getDeclaredTypeOfSymbol(target) : declaration ? checker.getTypeOfSymbolAtLocation(target, declaration) : undefined;
      return {
        name: symbol.getName(),
        kind: isType ? "type " : "value",
        rendered: type ? normalise(checker.typeToString(type, undefined, TYPE_FLAGS)) : "<unresolved>",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  exportCounts.push(exported.length);
  lines.push(subpath);
  for (const { name, kind, rendered } of exported) {
    const head = `  ${kind} ${name} = `;
    const wrapped = wrap(rendered, " ".repeat(head.length));
    lines.push(`${head}${wrapped[0]}`);
    for (const rest of wrapped.slice(1)) lines.push(rest);
  }
  lines.push("");
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

const css = TOKEN_SOURCES.map((file) => readFileSync(file, "utf8")).join("\n");
const tokenNames = [...new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1] as string))].sort();

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

const rule = "=".repeat(78);

const body = [
  "Public API surface of @sixthshift/design-system",
  "",
  "Generated by scripts/api-snapshot.ts from dist/ — do not edit by hand.",
  "Run `bun run scripts/api-snapshot.ts` to accept an intentional change.",
  "",
  "This file exists so that a rename or removal shows up in a pull request diff.",
  "The README makes component props and token names public API, and the release",
  "pipeline is unattended: a change filed as `refactor:` cuts a patch. If the diff",
  "below removes or renames anything, the commit subject needs `!` or a",
  "`BREAKING CHANGE:` footer.",
  "",
  "Deliberately not recorded: the package version, and anything under src/stories",
  "or src/testing. Neither is part of what a consumer can import.",
  "",
  rule,
  `SUBPATH EXPORTS — ${entryPoints.length} subpaths, ${exportCounts.reduce((a, b) => a + b, 0)} exports`,
  rule,
  "",
  ...lines,
  rule,
  `DESIGN TOKENS — ${tokenNames.length} custom properties declared by the theme (src/theme/linen/ + src/theming/tailwind.css)`,
  rule,
  "",
  ...tokenNames,
  "",
].join("\n");

if (!check) {
  mkdirSync(resolve(ROOT, "api"), { recursive: true });
  writeFileSync(SNAPSHOT, body);
  console.log(
    `api-snapshot: wrote ${relative(ROOT, SNAPSHOT)} — ${entryPoints.length} subpaths, ${exportCounts.reduce((a, b) => a + b, 0)} exports, ${tokenNames.length} tokens`
  );
  process.exit(0);
}

if (!existsSync(SNAPSHOT)) {
  console.error(`api-snapshot: ${relative(ROOT, SNAPSHOT)} does not exist. Run \`bun run scripts/api-snapshot.ts\` and commit it.`);
  process.exit(1);
}

const committed = readFileSync(SNAPSHOT, "utf8");
if (committed === body) {
  console.log(
    `api-snapshot: public API matches ${relative(ROOT, SNAPSHOT)} — ${entryPoints.length} subpaths, ${exportCounts.reduce((a, b) => a + b, 0)} exports, ${tokenNames.length} tokens`
  );
  process.exit(0);
}

const before = committed.split("\n");
const after = body.split("\n");
const removed = before.filter((line) => line.trim() && !after.includes(line));
const added = after.filter((line) => line.trim() && !before.includes(line));

console.error("api-snapshot: the public API surface changed.");
console.error("");
for (const line of removed.slice(0, 40)) console.error(`  - ${line.trim()}`);
if (removed.length > 40) console.error(`  … ${removed.length - 40} more removed line(s)`);
for (const line of added.slice(0, 40)) console.error(`  + ${line.trim()}`);
if (added.length > 40) console.error(`  … ${added.length - 40} more added line(s)`);
console.error("");
console.error("Review it, then run `bun run scripts/api-snapshot.ts` to accept.");
console.error("If anything above was removed or renamed, the commit subject needs `!` or a `BREAKING CHANGE:` footer —");
console.error("releases are unattended, so a patch bump would ship the rename silently.");
process.exit(1);
