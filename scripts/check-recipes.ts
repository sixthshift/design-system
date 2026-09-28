/**
 * Assert the component-token layer (layer 2) still holds together.
 *
 * Layer 2 lives beside each component (src/components/<Name>/<name>.recipe.css) and maps `(variant, intent, state)`
 * to a semantic token. Nothing else verifies it: a component can read a token no
 * recipe defines and the property silently computes to its initial value, which
 * for `background-color` is `transparent` and for `color` is whatever it
 * inherited. Neither raises an error anywhere — the component just renders
 * wrong, in one theme, in a state nobody screenshots.
 *
 * The invariants, each one a mistake already made during the conversion:
 *
 *   1. Naming grammar — `--{component}[-{part}]-{context}[-{state}]`. What this
 *      really enforces is that an intent or variant VALUE never appears in a
 *      token name: `--badge-bg-danger` fails because `danger` is neither a
 *      context nor a state. Values select via `data-*` attributes instead, which
 *      is what keeps the layer extensible — a consumer can add an intent in
 *      their own CSS precisely because the token name does not enumerate them.
 *   2. Layering — every recipe sits in `@layer components`. The cascade compares
 *      layers before specificity, so this is what lets an unlayered consumer
 *      override win against a higher-specificity library rule. Unlayered by
 *      accident and consumers cannot override at all.
 *   3. Wiring — every recipe is imported by theming/tailwind.css, and every import
 *      points at a file that exists.
 *   4. References resolve — every `var(--x)` in a recipe names either another
 *      component token or a semantic token defined in BOTH mode blocks. Miss the
 *      dark block and the component is unstyled in dark mode only.
 *   4b. The intent slots (theming/intents.css) — imported and layered like a
 *      recipe; the `[data-intent]` floor block defines the slot set, and every
 *      named intent may only re-point members of it; every semantic token a
 *      slot references exists in both modes; every `--intent-*` a recipe reads
 *      is a real slot.
 *   5. Read/declared symmetry — every `--x` a component reads is declared by a
 *      recipe, and every token a recipe declares is read by something. The first
 *      half catches a component that outran its recipe; the second catches dead
 *      tokens, which matter because these names are public API.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AGGREGATOR = resolve(ROOT, "src/theming/tailwind.css");
const INTENTS = resolve(ROOT, "src/theming/intents.css");
const TOKENS = resolve(ROOT, "src/theme/linen/theme.css");
const COMPONENTS = resolve(ROOT, "src/components");

/** What CSS property a token drives. The last segment, or the one before a state. */
const CONTEXTS = new Set(["bg", "fg", "border", "ring", "shadow"]);
/** Interaction states, mirroring `states` in src/theming/vocabulary.ts. */
const STATES = new Set(["hovered", "pressed", "disabled"]);

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/** Recipes live beside their components, keyed here as `Component/name.recipe.css`. */
const recipeFiles = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .flatMap((e) =>
    readdirSync(join(COMPONENTS, e.name))
      .filter((f) => f.endsWith(".recipe.css"))
      .map((f) => `${e.name}/${f}`)
  )
  .sort();

const recipeSource = new Map(recipeFiles.map((f) => [f, readFileSync(join(COMPONENTS, f), "utf8")]));
const indexSource = readFileSync(AGGREGATOR, "utf8");
const tokensSource = readFileSync(TOKENS, "utf8");
const intentsSource = readFileSync(INTENTS, "utf8");

/** Every `--name:` declared in a block, as a set. */
const declaredIn = (css: string): Set<string> => {
  const out = new Set<string>();
  for (const [, name] of css.matchAll(/(--[\w-]+)\s*:/g)) out.add(name!);
  return out;
};

/** The `{ … }` block following a selector, for reading one mode at a time. */
const blockAfter = (selector: string): string => {
  const start = tokensSource.indexOf(selector);
  if (start === -1) return "";
  const open = tokensSource.indexOf("{", start);
  const close = tokensSource.indexOf("\n}", open);
  return tokensSource.slice(open, close);
};

const lightTokens = declaredIn(blockAfter(':root[data-theme="light"]'));
const darkTokens = declaredIn(blockAfter(':root[data-theme="dark"]'));
const paletteTokens = declaredIn(blockAfter(":root {"));

/** Tokens the recipes declare, mapped back to the file that declares them. */
const componentTokens = new Map<string, string>();
for (const [file, css] of recipeSource) {
  for (const name of declaredIn(css)) if (!componentTokens.has(name)) componentTokens.set(name, file);
}

/**
 * The intent slots (src/theming/intents.css). The `[data-intent]` block is the
 * floor every intent-bearing element gets, so what it declares IS the slot set;
 * each named intent block may only re-point members of it.
 */
const intentBlocks = new Map<string, Set<string>>();
for (const [, selector, body] of intentsSource.matchAll(/^\s*((?:\[data-intent[^\]]*\][,\s]*)+)\{([^}]*)\}/gm)) {
  const names = declaredIn(body!);
  for (const part of selector!.split(",")) {
    const value = /\[data-intent(?:="([^"]*)")?\]/.exec(part.trim())?.[1] ?? "*";
    intentBlocks.set(value, names);
  }
}
const intentSlots = intentBlocks.get("*") ?? new Set<string>();

/**
 * Tokens a component reads, via the arbitrary-value utilities: `bg-(--x)`,
 * `text-(--x)`, `border-(color:--x)`, `ring-(color:--x)`, and any `var(--x)` in
 * an inline style. The optional `type:` hint is what disambiguates a border
 * colour from a border width, so it has to be tolerated here.
 */
const readTokens = new Map<string, string[]>();
/** Every `*.stories.tsx` under `dir`, recursively. */
const walkStories = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return walkStories(p);
    return e.name.endsWith(".stories.tsx") ? [p] : [];
  });

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name.endsWith(".tsx") && !e.name.includes(".test.") && !e.name.includes(".stories.") ? [p] : [];
  });

for (const file of walk(COMPONENTS)) {
  const src = readFileSync(file, "utf8");
  for (const [, name] of src.matchAll(/-\((?:[a-z]+:)?(--[\w-]+)\)/g)) {
    readTokens.set(name!, [...(readTokens.get(name!) ?? []), file.slice(ROOT.length + 1)]);
  }
}

// ---------------------------------------------------------------------------
// Check
// ---------------------------------------------------------------------------

const failures: string[] = [];
const warnings: string[] = [];

// 1. Naming grammar — this is the rule that keeps the layer extensible.
for (const [name, file] of componentTokens) {
  const parts = name.replace(/^--/, "").split("-");
  const last = parts.at(-1)!;
  const ok = CONTEXTS.has(last) || (STATES.has(last) && CONTEXTS.has(parts.at(-2) ?? ""));
  if (!ok) {
    failures.push(
      `${file}: \`${name}\` does not end in a context (${[...CONTEXTS].join("/")}) ` +
        `or a context+state. If that trailing segment is an intent or variant value, it belongs ` +
        `in a \`data-*\` selector, not in the token name.`
    );
  }
}

// 2. Layering — what makes consumer overrides win without !important.
for (const [file, css] of recipeSource) {
  // An at-rule, not a substring: every one of these files mentions
  // `@layer components` in its header comment explaining why it matters, so a
  // plain `includes` passes even when the block itself is gone.
  if (!/^\s*@layer\s+components\s*\{/m.test(css)) {
    failures.push(`${file}: not inside \`@layer components\` — consumer overrides cannot beat it on layer precedence.`);
  }
}

// 3. Wiring.
const imported = new Set([...indexSource.matchAll(/@import\s+"\.\.\/components\/([\w/-]+\.recipe\.css)"/g)].map((m) => m[1]!));
for (const file of recipeFiles) {
  if (!imported.has(file)) failures.push(`${file}: never imported by theming/tailwind.css — it ships to nobody.`);
}
for (const file of imported) {
  if (!recipeSource.has(file)) failures.push(`theming/tailwind.css imports components/${file}, which does not exist.`);
}

// 4. Every reference resolves, in BOTH modes.
for (const [file, css] of recipeSource) {
  for (const [, name] of css.matchAll(/var\((--[\w-]+)/g)) {
    if (componentTokens.has(name!) || paletteTokens.has(name!) || name!.startsWith("--intent-")) continue;
    const inLight = lightTokens.has(name!);
    const inDark = darkTokens.has(name!);
    if (inLight && inDark) continue;
    if (!inLight && !inDark) {
      failures.push(`${file}: references \`${name}\`, which no layer defines.`);
    } else {
      failures.push(`${file}: references \`${name}\`, defined only in the ${inLight ? "light" : "dark"} block — undefined in the other theme.`);
    }
  }
}

// 4b. The intent-slot layer: wired, layered, complete, and resolvable.
if (!/@import\s+"\.\/intents\.css"/.test(indexSource))
  failures.push("theming/intents.css: never imported by theming/tailwind.css — every recipe reading a slot is unstyled.");
if (!/^\s*@layer\s+components\s*\{/m.test(intentsSource)) failures.push("theming/intents.css: not inside `@layer components`.");
if (intentSlots.size === 0) failures.push("theming/intents.css: no `[data-intent]` floor block — nothing defines the slot set.");
for (const [intent, names] of intentBlocks) {
  for (const name of names) {
    if (!name.startsWith("--intent-")) failures.push(`theming/intents.css: \`${name}\` in the ${intent} block is not an \`--intent-*\` slot.`);
    else if (!intentSlots.has(name))
      failures.push(
        `theming/intents.css: the ${intent} block declares \`${name}\`, which the \`[data-intent]\` floor does not — an intent that omits it inherits nothing and a recipe reading it paints nothing.`
      );
  }
}
for (const [, name] of intentsSource.matchAll(/var\((--[\w-]+)/g)) {
  if (paletteTokens.has(name!) || (lightTokens.has(name!) && darkTokens.has(name!))) continue;
  failures.push(`theming/intents.css: references \`${name}\`, which is not a semantic token defined in both modes.`);
}
const readSlots = new Set<string>();
for (const [file, css] of recipeSource) {
  for (const [, name] of css.matchAll(/var\((--intent-[\w-]+)/g)) {
    readSlots.add(name!);
    if (!intentSlots.has(name!)) failures.push(`${file}: reads \`${name}\`, which is not an intent slot — see theming/intents.css for the set.`);
  }
}
for (const slot of intentSlots) if (!readSlots.has(slot)) warnings.push(`theming/intents.css: slot \`${slot}\` is read by no recipe — dead public API.`);

// 5. Read/declared symmetry.
for (const [name, files] of readTokens) {
  if (!componentTokens.has(name)) {
    failures.push(`${files[0]}: reads \`${name}\`, which no recipe declares — it will compute to its initial value.`);
  }
}
for (const [name, file] of componentTokens) {
  // A token can legitimately be declared only to be consumed by another token's
  // fallback chain, so an unread one is a smell rather than an error.
  if (!readTokens.has(name)) warnings.push(`${file}: declares \`${name}\`, which nothing reads — dead public API.`);
}

// 6. Every recipe is documented by the component that owns it.
//
// The per-component token tables are wired up by hand — `componentTokensStory`
// takes its hooks as arguments because inferring them does not work (`Button`
// uses `.btn`, and scanning source for a bare hook name matches the `switch`
// keyword and `input` variables). Hand-wiring is fine as long as
// forgetting it is loud, which is what this check is for.
const claimed = new Set<string>();
for (const file of readdirSync(COMPONENTS, { withFileTypes: true }).flatMap((e) => walkStories(join(COMPONENTS, e.name)))) {
  const src = readFileSync(file, "utf8");
  for (const [, args] of src.matchAll(/componentTokensStory\(([^)]*)\)/g)) {
    for (const [, hook] of args!.matchAll(/"([^"]+)"/g)) claimed.add(hook!);
  }
}
const declaredHooks = new Set<string>();
for (const css of recipeSource.values()) {
  for (const [, hook] of css.matchAll(/^\s*\.([a-z][\w-]*)[\s[{,]/gm)) declaredHooks.add(hook!);
}
for (const hook of declaredHooks) {
  if (!claimed.has(hook)) {
    failures.push(
      `.${hook} has no component documenting it — add \`componentTokensStory("${hook}")\` to the owning component's stories file, ` +
        `so its tokens appear on its own Docs tab.`
    );
  }
}
for (const hook of claimed) {
  if (!declaredHooks.has(hook)) warnings.push(`a stories file claims \`.${hook}\`, but no recipe declares it.`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (process.argv.includes("--list")) {
  for (const file of recipeFiles) {
    const owned = [...componentTokens].filter(([, f]) => f === file).map(([n]) => n);
    if (owned.length > 0) console.log(`\n${file}\n${owned.map((n) => `  ${n}`).join("\n")}`);
  }
  console.log("");
}

for (const warning of warnings) console.warn(`⚠ ${warning}`);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} problem(s) in the component-token layer:\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error("\nSee src/components/Button/button.recipe.css for the pattern.");
  process.exit(1);
}

console.log(`✓ ${componentTokens.size} component tokens across ${recipeFiles.length} recipes: names, layering, wiring and references all check out`);
