/**
 * Reads the design tokens back out of the stylesheet at runtime.
 *
 * The token documentation stories need names *and* values: the palette story
 * labels each swatch with its hex, and the theme story applies a whole mode's
 * values to a subtree so light and dark can sit side by side on one page.
 *
 * Nothing generates that data into TypeScript any more — the theme CSS is
 * the only source, so these stories read the real thing through the CSSOM. That
 * makes them a genuine check on the shipped CSS rather than a view of a copy: if
 * a token stops being emitted, the story that documents it goes blank.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

const LIGHT_SELECTOR = ':root:not([data-theme]), :root[data-theme="light"]';
const DARK_SELECTOR = ':root[data-theme="dark"]';

export type TokenSet = Record<string, string>;
export type ColorMode = "light" | "dark";

/**
 * Every style rule in the document, descending through `@layer`, `@media` and
 * `@supports`. The blocks these readers want are unlayered today, but Tailwind
 * emits its own `@theme` output inside `@layer theme` — so a flat walk of
 * `sheet.cssRules` is one refactor away from silently returning less than it
 * did. The sibling of the problem read-recipes.ts documents for
 * `@layer components`.
 */
function* everyStyleRule(rules: CSSRuleList): Generator<CSSStyleRule> {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) yield rule;
    else if ("cssRules" in rule) yield* everyStyleRule((rule as CSSGroupingRule).cssRules);
  }
}

/** Custom properties declared by every rule whose selector satisfies `matches`. */
function declarationsWhere(matches: (selector: string) => boolean): TokenSet {
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  const out: TokenSet = {};

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // A cross-origin sheet cannot be read. None of ours are, so skip quietly.
      continue;
    }
    for (const rule of everyStyleRule(rules)) {
      if (!matches(normalize(rule.selectorText))) continue;
      for (const property of Array.from(rule.style)) {
        if (property.startsWith("--")) out[property.slice(2)] = normalize(rule.style.getPropertyValue(property));
      }
    }
  }
  return out;
}

/** Custom properties declared by the rules matching `selector` exactly. */
function declarationsFor(selector: string): TokenSet {
  return declarationsWhere((candidate) => candidate === selector);
}

/** Resolve one variable to the value the browser actually computed. */
function computed(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

const unquote = (value: string) => value.replace(/^["']|["']$/g, "");

/** Theme identity, from `--theme-name` / `--theme-version`. */
export function readIdentity(): { name: string; version: string } {
  return { name: unquote(computed("theme-name")), version: unquote(computed("theme-version")) };
}

/** Semantic tokens for one mode, as authored — values stay as `var(--color-…)`. */
export function readTokens(mode: ColorMode): TokenSet {
  const declared = declarationsFor(mode === "light" ? LIGHT_SELECTOR : DARK_SELECTOR);
  const { "theme-name": _name, "theme-version": _version, ...tokens } = declared;
  return tokens;
}

/** The two modes' tokens with every `var()` resolved to a literal colour. */
export function readResolvedTokens(mode: ColorMode): TokenSet {
  const out: TokenSet = {};
  for (const [token, value] of Object.entries(readTokens(mode))) {
    const reference = /^var\(--([\w-]+)\)$/.exec(value)?.[1];
    out[token] = reference ? computed(reference) : value;
  }
  return out;
}

/** Palette scales, `{ blue: { "500": "#4771ae" } }`, from the `:root` block. */
export function readPalette(): Record<string, TokenSet> {
  const scales: Record<string, TokenSet> = {};
  for (const [name, value] of Object.entries(declarationsFor(":root"))) {
    const match = /^color-([a-z]+)-(\d+)$/.exec(name);
    if (!match) continue;
    const [, scale, step] = match as unknown as [string, string, string];
    const steps = scales[scale] ?? {};
    steps[step] = value;
    scales[scale] = steps;
  }
  return scales;
}

/** Font stacks, keyed without the `--font-` prefix. */
export function readFonts(): TokenSet {
  const fonts: TokenSet = {};
  for (const [name, value] of Object.entries(declarationsFor(":root"))) {
    if (name.startsWith("font-")) fonts[name.slice(5)] = value;
  }
  return fonts;
}
