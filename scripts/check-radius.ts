/**
 * Assert every corner radius in source is on the theme's scale.
 *
 * The scale is five steps, `xs | sm | md | lg | xl`, with `md` the middle and
 * the default. The theme defines them as `--border-radius-*`
 * (src/theme/<name>/theme.css) and src/theming/tailwind.css points Tailwind's
 * `rounded-*` utilities at them, so a theme reshapes every corner by editing
 * five lines.
 *
 * That only holds for classes that go through the scale. Two ways out of it,
 * both silent:
 *
 *   - bare `rounded` compiles to a fixed `0.25rem`, reading no variable, so no
 *     theme can reach it;
 *   - a step off the scale (`rounded-2xl`, `rounded-[6px]`) either reads a
 *     variable the theme does not define — Tailwind drops the class, and the
 *     corner silently goes square — or hardcodes a length.
 *
 * Allowed: `rounded-{step}` for the five steps, `none` and `full` (a circle or
 * a square join is geometry, not a theme choice), any side or corner prefix
 * (`rounded-l-md`, `rounded-tr-lg`), any variant prefix (`sm:rounded-lg`), and
 * a component token, `rounded-(--button-radius)`.
 *
 * Only quoted strings in `.tsx` and `.mdx` files are scanned — where class
 * strings live — so prose in comments ("rounded to the nearest step") and in
 * plain `.ts` test titles is not mistaken for a class.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

const STEPS = ["xs", "sm", "md", "lg", "xl"];
const GEOMETRY = ["none", "full"];
const SIDES = "(?:s|e|t|r|b|l|ss|se|ee|es|tl|tr|br|bl)";
// `rounded-*` is how prose names the whole family, not a class.
const ALLOWED = new RegExp(`^rounded(?:-${SIDES})?-(?:${[...STEPS, ...GEOMETRY].join("|")}|\\(--[\\w-]+\\)|\\*)$`);

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === "__screenshots__" ? [] : walk(p);
    return /\.(tsx|mdx)$/.test(e.name) ? [p] : [];
  });

const failures: string[] = [];

// The scale itself: every step defined by the theme, and every step — and only
// those — handed to Tailwind. A missing mapping makes `rounded-lg` generate
// nothing, and the corner silently goes square.
const theme = readFileSync(join(SRC, "theme", "linen", "theme.css"), "utf8");
const tailwind = readFileSync(join(SRC, "theming", "tailwind.css"), "utf8");
if (!/--radius-\*:\s*initial;/.test(tailwind))
  failures.push("src/theming/tailwind.css: Tailwind's own radius scale is not reset (`--radius-*: initial;`), so off-scale steps still compile.");
for (const step of STEPS) {
  if (!new RegExp(`--border-radius-${step}:`).test(theme)) failures.push(`src/theme/linen/theme.css: defines no \`--border-radius-${step}\`.`);
  if (!new RegExp(`--radius-${step}:\\s*var\\(--border-radius-${step}\\)`).test(tailwind)) {
    failures.push(`src/theming/tailwind.css: \`--radius-${step}\` is not mapped to \`var(--border-radius-${step})\`.`);
  }
}
for (const file of walk(SRC)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const [, , body] of line.matchAll(/(["'`])((?:(?!\1).)*)\1/g)) {
      for (const token of body!.split(/\s+/)) {
        const utility = token.split(":").at(-1)!;
        if (!/^rounded(?:$|-)/.test(utility) || ALLOWED.test(utility)) continue;
        failures.push(`${relative(ROOT, file)}:${i + 1}: \`${token}\` is off the radius scale`);
      }
    }
  });
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} radius class(es) off the scale (${STEPS.join(" | ")}, plus none/full):\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error("\nBare `rounded` is a fixed 0.25rem no theme can reach — write `rounded-sm` (same pixels) or `rounded-md` (the default).");
  process.exit(1);
}

console.log(`✓ the theme defines the ${STEPS.join("/")} radius scale, Tailwind reads it, and every corner in source is on it`);
