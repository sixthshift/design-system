/**
 * Rewrite relative import specifiers in the emitted package to be fully
 * specified (`./Button` -> `./Button/index.js`).
 *
 * tsc emits specifiers verbatim, and `moduleResolution: "bundler"` lets the
 * source omit extensions. Node ESM and webpack (so Next.js) both refuse
 * extensionless relative imports inside a `"type": "module"` package, so the
 * emitted `.js` and `.d.ts` are patched here instead of littering the source
 * with `.js` suffixes that point at files which do not exist.
 *
 * Directory targets resolve to `/index.js`; specifiers that already carry an
 * extension are left alone. An unresolvable specifier fails the build rather
 * than shipping a broken import.
 */

/// <reference types="bun" />
// Bun's ambient types are referenced here rather than in tsconfig's `types`,
// which is deliberately empty: this file needs `Bun` and `import.meta.dir`, and
// scoping the reference to the scripts that use them keeps those globals out of
// the library's own compilation (tsconfig.build.json compiles src/ only).

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const DIST = resolve(import.meta.dir, "..", "dist");

/**
 * `from "..."`, `import("...")`, and bare `import "..."`, relative targets only.
 * Matches `.` and `..` as well as `./x` — tsc synthesises bare directory
 * specifiers such as `import(".").TabsListProps` in declaration output.
 */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.\.?(?:\/[^"']*)?)\2/g;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walk(path);
    return path.endsWith(".js") || path.endsWith(".d.ts") ? [path] : [];
  });
}

/** Returns the fully specified form of `spec`, or null if it resolves to nothing. */
function specify(fromFile: string, spec: string): string | null {
  if (/\.(js|json|css|mjs|cjs)$/.test(spec)) return spec;
  const target = resolve(dirname(fromFile), spec);
  const bare = spec === "." || spec === "..";
  if (!bare && existsSync(`${target}.js`)) return `${spec}.js`;
  if (existsSync(join(target, "index.js"))) return `${spec}/index.js`;
  return null;
}

const unresolved: string[] = [];
let rewritten = 0;
let touched = 0;

if (!existsSync(DIST)) {
  console.error("fix-extensions: dist/ does not exist — run the compile step first");
  process.exit(1);
}

for (const file of walk(DIST)) {
  const before = readFileSync(file, "utf8");
  const after = before.replace(SPECIFIER, (match, keyword, quote, spec) => {
    const specified = specify(file, spec);
    if (specified === null) {
      unresolved.push(`${file}: ${spec}`);
      return match;
    }
    if (specified !== spec) rewritten++;
    return `${keyword}${quote}${specified}${quote}`;
  });
  if (after !== before) {
    writeFileSync(file, after);
    touched++;
  }
}

if (unresolved.length > 0) {
  console.error(`fix-extensions: ${unresolved.length} unresolvable relative import(s):`);
  for (const entry of unresolved) console.error(`  ${entry}`);
  process.exit(1);
}

console.log(`fix-extensions: ${rewritten} specifier(s) rewritten across ${touched} file(s)`);
