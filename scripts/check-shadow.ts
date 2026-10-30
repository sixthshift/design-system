/**
 * Assert every box shadow in source is on the theme's elevation scale.
 *
 * The scale is four steps, `xs | sm | md | lg`: a control, a raised surface, a
 * lifted surface, a floating layer. The theme defines them as `--box-shadow-*`
 * (src/theme/<name>/theme.css) and src/theming/tailwind.css points Tailwind's
 * `shadow-*` utilities at them, so a theme re-lights every surface by editing
 * four lines.
 *
 * That only holds for classes that go through the scale. Two ways out of it,
 * both silent:
 *
 *   - bare `shadow` is Tailwind's legacy alias for `sm`'s value, reading no
 *     variable, so no theme can reach it;
 *   - a step off the scale (`shadow-xl`, `shadow-[0_1px_red]`) either reads a
 *     variable the theme does not define — Tailwind drops the class, and the
 *     surface silently goes flat — or hardcodes a shadow.
 *
 * Allowed: `shadow-{step}` for the four steps, `shadow-none`, any variant
 * prefix (`hover:shadow-md`), and a component token, `shadow-(--card-shadow)`.
 * `inset-shadow-*`, `drop-shadow-*` and `text-shadow-*` are other utilities
 * and are not checked.
 *
 * Only quoted strings in `.tsx` and `.mdx` files are scanned — where class
 * strings live — so prose in comments is not mistaken for a class.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

const STEPS = ["xs", "sm", "md", "lg"];
// `shadow-*` is how prose names the whole family, and `shadow-` is a variable
// prefix (`startsWith("shadow-")`); neither is a class.
const ALLOWED = new RegExp(`^shadow-(?:${[...STEPS, "none"].join("|")}|\\(--[\\w-]+\\)|\\*|)$`);

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === "__screenshots__" ? [] : walk(p);
    return /\.(tsx|mdx)$/.test(e.name) ? [p] : [];
  });

const failures: string[] = [];

// The scale itself: every step defined by the theme, and every step — and only
// those — handed to Tailwind. A missing mapping makes `shadow-lg` generate
// nothing, and the surface silently goes flat.
const theme = readFileSync(join(SRC, "theme", "linen", "theme.css"), "utf8");
const tailwind = readFileSync(join(SRC, "theming", "tailwind.css"), "utf8");
if (!/--shadow-\*:\s*initial;/.test(tailwind))
  failures.push("src/theming/tailwind.css: Tailwind's own shadow scale is not reset (`--shadow-*: initial;`), so off-scale steps still compile.");
for (const step of STEPS) {
  if (!new RegExp(`--box-shadow-${step}:`).test(theme)) failures.push(`src/theme/linen/theme.css: defines no \`--box-shadow-${step}\`.`);
  if (!new RegExp(`--shadow-${step}:\\s*var\\(--box-shadow-${step}\\)`).test(tailwind)) {
    failures.push(`src/theming/tailwind.css: \`--shadow-${step}\` is not mapped to \`var(--box-shadow-${step})\`.`);
  }
}
for (const file of walk(SRC)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const [, , body] of line.matchAll(/(["'`])((?:(?!\1).)*)\1/g)) {
      for (const token of body!.split(/\s+/)) {
        const utility = token.split(":").at(-1)!;
        if (!/^shadow(?:$|-)/.test(utility) || ALLOWED.test(utility)) continue;
        failures.push(`${relative(ROOT, file)}:${i + 1}: \`${token}\` is off the shadow scale`);
      }
    }
  });
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} shadow class(es) off the scale (${STEPS.join(" | ")}, plus none):\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error("\nBare `shadow` is a fixed value no theme can reach — write `shadow-sm` (same pixels).");
  process.exit(1);
}

console.log(`✓ the theme defines the ${STEPS.join("/")} shadow scale, Tailwind reads it, and every shadow in source is on it`);
