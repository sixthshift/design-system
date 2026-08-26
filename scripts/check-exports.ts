/**
 * Assert every `exports` target in package.json exists on disk.
 *
 * The subpath map used to point at checked-in source, where a missing target
 * was impossible. It now points at build output, so a renamed component or a
 * file excluded from the emit would publish a subpath that resolves to nothing
 * — and npm would accept it. Fail the build here instead.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
  exports: Record<string, string | Record<string, string>>;
};

const missing: string[] = [];
let checked = 0;

for (const [subpath, target] of Object.entries(pkg.exports)) {
  const targets = typeof target === "string" ? [target] : Object.values(target);
  for (const path of targets) {
    checked++;
    if (!existsSync(resolve(ROOT, path))) missing.push(`${subpath} -> ${path}`);
  }
}

if (missing.length > 0) {
  console.error(`check-exports: ${missing.length} export target(s) missing from the build:`);
  for (const entry of missing) console.error(`  ${entry}`);
  process.exit(1);
}

console.log(`check-exports: ${checked} target(s) across ${Object.keys(pkg.exports).length} subpaths resolve`);
