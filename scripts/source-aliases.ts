/**
 * Vite/Vitest aliases mapping this package's own subpath exports back to `src/`.
 *
 * Components import their siblings by package name
 * (`@sixthshift/design-system/utils`), which resolves through the `exports` map
 * — and since that map now points at compiled `dist/`, tests, Storybook and the
 * dev server would all exercise the last build instead of the working tree.
 *
 * The mapping is derived from `exports` rather than hand-maintained, so a new
 * subpath cannot drift out of sync, and inverting `dist/x.js` -> `src/x.ts(x)`
 * throws rather than silently leaving a subpath pointed at build output.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

type ExportTarget = string | { types: string; import: string };

export function sourceAliases(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
    name: string;
    exports: Record<string, ExportTarget>;
  };

  const aliases: Record<string, string> = {};

  for (const [subpath, target] of Object.entries(pkg.exports)) {
    if (typeof target === "string") continue; // CSS and tailwind.config ship as-is
    const stem = resolve(ROOT, target.import.replace(/^\.\/dist\//, "src/").replace(/\.js$/, ""));
    const source = [`${stem}.ts`, `${stem}.tsx`].find(existsSync);
    if (source === undefined) {
      throw new Error(`source-aliases: no source file behind ${pkg.name}${subpath.slice(1)} (${target.import})`);
    }
    aliases[`${pkg.name}${subpath.slice(1)}`] = source;
  }

  return aliases;
}
