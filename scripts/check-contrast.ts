/**
 * Assert every text-on-surface token pairing clears WCAG AA (4.5:1).
 *
 * The story a11y suite catches only what a story happens to render: axe never
 * sees a `:hover` fill, and until both themes were run it never saw the dark
 * palette at all. That left contrast regressions to be found by eye — and the
 * dark block shipped six of them. The token file is where the pairings are
 * decided, so it is where they can be checked exhaustively and in milliseconds.
 *
 * Two pairing rules, taken from docs/design-tokens.md:
 *
 *   - a fill `bg-X` is read through its `fg-on-X` partner (same state suffix);
 *   - a plain `fg-*` is read on the two neutral surfaces, `bg-normal` and
 *     `bg-subtle`.
 *
 * `-disabled` pairs are skipped: WCAG 1.4.3 exempts inactive controls, and
 * forcing 4.5:1 there would make "disabled" indistinguishable from enabled.
 * Large text (3:1) is not modelled — a token doesn't know its font size, so the
 * stricter threshold is the safe one to hold every pairing to.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME_DIR = resolve(ROOT, "src/theme/linen");
const AA_NORMAL_TEXT = 4.5;

// The theme is plain CSS composed by @import; read the sources directly.
const css = [readFileSync(resolve(THEME_DIR, "palette.css"), "utf8"), readFileSync(resolve(THEME_DIR, "theme.css"), "utf8")].join("\n");

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

/** Declarations of one `{ … }` block, keyed by custom-property name. */
const declarations = (block: string): Map<string, string> => {
  const out = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out.set(name!, value!.trim());
  }
  return out;
};

const blockAfter = (selector: string): string => {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`the theme sources no longer contain the selector \`${selector}\``);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  return css.slice(open, close);
};

// Layer 1. The palette lives in the bare `:root` block at the top of the file.
const palette = declarations(blockAfter(":root {"));

// Layer 2. One semantic block per mode.
const modes = {
  light: declarations(blockAfter(':root[data-theme="light"] {')),
  dark: declarations(blockAfter(':root[data-theme="dark"] {')),
};

// ---------------------------------------------------------------------------
// Colour maths
// ---------------------------------------------------------------------------

const NAMED: Record<string, string> = { white: "#ffffff", black: "#000000" };

/** Resolve a semantic token to a hex string, following `var()` indirection. */
const resolve_ = (mode: Map<string, string>, name: string, seen = new Set<string>()): string | null => {
  if (seen.has(name)) return null;
  seen.add(name);
  const raw = mode.get(name) ?? palette.get(name);
  if (!raw) return null;
  if (raw.startsWith("#")) return raw;
  if (NAMED[raw]) return NAMED[raw];
  const ref = raw.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve_(mode, ref[1]!, seen) : null;
};

const luminance = (hex: string): number => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const channels = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

// ---------------------------------------------------------------------------
// Pairings
// ---------------------------------------------------------------------------

type Pair = { fg: string; bg: string };

/** `--bg-danger-hovered` → `--fg-on-danger-hovered` */
const onPartner = (bg: string) => bg.replace(/^--bg-/, "--fg-on-");

const NEUTRAL_SURFACES = ["--bg-normal", "--bg-subtle"];
// Neutral surfaces carry plain `fg-*` text, not an `fg-on-*` partner; overlay is
// a scrim, never a text background.
const NOT_A_FILL = new Set([...NEUTRAL_SURFACES, "--bg-normal-hovered", "--bg-normal-pressed", "--bg-subtle-hovered", "--bg-subtle-pressed", "--bg-overlay"]);

const pairs = (mode: Map<string, string>): { checked: Pair[]; unpaired: string[] } => {
  const names = [...mode.keys()];
  const checked: Pair[] = [];
  const unpaired: string[] = [];

  for (const bg of names.filter((n) => n.startsWith("--bg-") && !n.endsWith("-disabled") && !NOT_A_FILL.has(n))) {
    const fg = onPartner(bg);
    if (mode.has(fg)) checked.push({ fg, bg });
    // A fill with no `fg-on-*` partner has no defined text colour at all —
    // docs/design-tokens.md promises every fill has one.
    else unpaired.push(bg);
  }

  for (const fg of names.filter((n) => n.startsWith("--fg-") && !n.startsWith("--fg-on-") && !n.endsWith("-disabled"))) {
    for (const bg of NEUTRAL_SURFACES) checked.push({ fg, bg });
  }

  return { checked, unpaired };
};

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const failures: string[] = [];
const warnings: string[] = [];
let checkedCount = 0;

for (const [modeName, mode] of Object.entries(modes)) {
  const { checked, unpaired } = pairs(mode);

  for (const name of unpaired) {
    warnings.push(`${modeName}: ${name} has no ${onPartner(name)} — nothing defines the text colour on that fill`);
  }

  for (const { fg, bg } of checked) {
    const fgHex = resolve_(mode, fg);
    const bgHex = resolve_(mode, bg);
    if (!fgHex || !bgHex) {
      warnings.push(`${modeName}: could not resolve ${!fgHex ? fg : bg} to a colour`);
      continue;
    }
    checkedCount++;
    const ratio = contrast(fgHex, bgHex);
    if (ratio < AA_NORMAL_TEXT) {
      failures.push(`${modeName}: ${fg} (${fgHex}) on ${bg} (${bgHex}) — ${ratio.toFixed(2)}:1, needs ${AA_NORMAL_TEXT}:1`);
    }
  }
}

for (const warning of warnings) console.warn(`⚠ ${warning}`);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} of ${checkedCount} token pairings fall below WCAG AA:\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error("\nFix the value in src/theme/linen/, or state why the pairing is exempt.");
  process.exit(1);
}

console.log(`✓ ${checkedCount} token pairings meet WCAG AA (${AA_NORMAL_TEXT}:1)`);
