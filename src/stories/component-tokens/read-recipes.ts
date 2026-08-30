/**
 * Reads the component-token layer back out of the stylesheet at runtime.
 *
 * The sibling of read-tokens.ts, for tier 3. Same principle and same payoff: the
 * recipes in src/theming/recipes/*.css are the only source, so the reference story
 * reads the shipped CSS through the CSSOM rather than a copy someone has to
 * remember to update. Delete a cell and the row documenting it disappears.
 *
 * One structural difference from tier 2, and it is the whole reason this file
 * exists rather than reusing `declarationsFor`: recipes sit inside
 * `@layer components`, so their rules are children of a `CSSLayerBlockRule` and
 * a flat walk of `sheet.cssRules` never sees them.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

export type Cell = {
  /** The rule's selector, e.g. `.btn[data-variant="solid"][data-intent="neutral"]`. */
  selector: string;
  /** `data-*` attributes the selector matches on, as props for a probe element. */
  attrs: Record<string, string>;
  /** Tokens this cell declares, as authored — values stay as `var(--bg-brand)`. */
  declared: Record<string, string>;
};

export type Recipe = {
  /** The class hook, e.g. `btn`. */
  hook: string;
  /** The `.hook { … }` rule — the defaults a cell inherits when it says nothing. */
  floor: Cell | undefined;
  /** Every `.hook[…]` rule, in source order. */
  cells: Cell[];
  /** Every token name the component declares anywhere, sorted. */
  tokens: string[];
};

export type Resolved = {
  /** The colour the browser computed, always `rgb(…)` — paintable. */
  colour: string;
  /** True when nothing declares the token, so it falls back to inheritance. */
  unset: boolean;
};

/** An improbable colour, used only to detect "no value reached this token". */
const SENTINEL = "rgb(1, 2, 3)";
const SENTINEL_COMPUTED = "rgb(1, 2, 3)";

/** A recipe selector: a class hook plus zero or more `[data-x="y"]`, nothing else. */
const RECIPE_SELECTOR = /^\.([a-z][\w-]*)((?:\[[\w-]+="[^"]*"\])*)$/;

/**
 * Every style rule in the document, descending through `@layer`, `@media` and
 * `@supports`. Grouping at-rules expose their children as `cssRules`, so one
 * duck-typed check covers all three without naming each interface.
 */
function* everyStyleRule(rules: CSSRuleList): Generator<CSSStyleRule> {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) yield rule;
    else if ("cssRules" in rule) yield* everyStyleRule((rule as CSSGroupingRule).cssRules);
  }
}

function* everyRuleInDocument(): Generator<CSSStyleRule> {
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      yield* everyStyleRule(sheet.cssRules);
    } catch {
      // A cross-origin sheet cannot be read. None of ours are, so skip quietly.
    }
  }
}

const attrsFrom = (tail: string): Record<string, string> =>
  Object.fromEntries(Array.from(tail.matchAll(/\[([\w-]+)="([^"]*)"\]/g), (m) => [m[1] as string, m[2] as string]));

/**
 * Every recipe in the document, keyed by class hook.
 *
 * A grouped selector (`.btn[…], .btn[…] { }`) is one rule declaring the same
 * tokens for several cells, so each half becomes its own cell here.
 */
export function readRecipes(): Recipe[] {
  const byHook = new Map<string, Recipe>();

  for (const rule of everyRuleInDocument()) {
    // Tailwind's own utilities are shaped exactly like a recipe cell — `.shadow`,
    // `.ring` and `.font-bold` are single-class rules declaring custom
    // properties — so matching on selector shape alone sweeps in about thirty of
    // them. What separates them is the namespace: a utility only ever sets
    // `--tw-*`, and a recipe never does.
    const declared: Record<string, string> = {};
    for (const property of Array.from(rule.style)) {
      if (property.startsWith("--") && !property.startsWith("--tw-")) declared[property] = rule.style.getPropertyValue(property).trim();
    }
    if (Object.keys(declared).length === 0) continue;

    for (const part of rule.selectorText.split(",")) {
      const match = RECIPE_SELECTOR.exec(part.trim());
      if (!match) continue;
      const [, hook, tail] = match as unknown as [string, string, string];

      const recipe = byHook.get(hook) ?? { hook, floor: undefined, cells: [], tokens: [] };
      const cell: Cell = { selector: part.trim(), attrs: attrsFrom(tail), declared };
      if (tail === "") recipe.floor = cell;
      else recipe.cells.push(cell);
      byHook.set(hook, recipe);
    }
  }

  for (const recipe of byHook.values()) {
    const names = new Set<string>();
    for (const cell of [recipe.floor, ...recipe.cells]) for (const name of Object.keys(cell?.declared ?? {})) names.add(name);
    recipe.tokens = [...names].sort();
  }

  return [...byHook.values()].sort((a, b) => a.hook.localeCompare(b.hook));
}

/**
 * What a cell's tokens actually compute to, in the mode `modeVars` describes.
 *
 * Resolution has to happen in the DOM: a component token is scoped to its hook,
 * so it does not exist on `:root` and cannot be read off the document element
 * the way a semantic token can. A probe element carrying the same class and
 * attributes as the cell puts the browser's own cascade to work — inheritance
 * from the floor, `var()` chains and all — which is the point. Reading the
 * authored value instead would document what was written, not what resolves.
 */
export function resolveCell(hook: string, attrs: Record<string, string>, tokens: string[], modeVars: Record<string, string>): Record<string, Resolved> {
  const host = document.createElement("div");
  for (const [name, value] of Object.entries(modeVars)) host.style.setProperty(name, value);
  // A known, unmistakable inherited colour. A token that is deliberately left
  // unset — Checkbox's resting `--checkbox-fg`, say — makes `color` invalid at
  // computed-value time, which falls back to the inherited value. Seeing this
  // exact colour come back is therefore proof of "unset", not a real value.
  host.style.color = SENTINEL;

  const probe = document.createElement("div");
  probe.className = hook;
  for (const [name, value] of Object.entries(attrs)) probe.setAttribute(name, value);
  host.appendChild(probe);

  // Read each token through a real CSS property rather than
  // `getPropertyValue("--x")`: Chromium hands back custom properties as their
  // unresolved token stream (`var(--color-slate-800)`), which cannot be painted.
  // `color` is always fully computed, so the swatch shows what a viewer sees.
  const spans = tokens.map((token) => {
    const span = document.createElement("span");
    span.style.color = `var(${token})`;
    probe.appendChild(span);
    return span;
  });

  document.body.appendChild(host);
  const out = Object.fromEntries(
    tokens.map((token, i) => {
      const colour = getComputedStyle(spans[i] as HTMLElement).color;
      return [token, { colour, unset: colour === SENTINEL_COMPUTED }];
    })
  );

  host.remove();
  return out;
}

/** One mode's semantic tokens as inline custom properties, for a probe host. */
export function modeVarsFrom(tokens: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(tokens).map(([token, value]) => [`--${token}`, value]));
}
