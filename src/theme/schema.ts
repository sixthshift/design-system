/**
 * Theme Schema
 *
 * The naming convention for design tokens, as types and as data:
 *
 *   {context}-[on-]{intent}[-{weight}][-{state}]
 *
 * src/theme/tokens.css is the only place tokens are defined, and nothing derives
 * TypeScript from it. These types describe the *shape* a token name can take
 * rather than enumerating the names that happen to exist today, which is why the
 * vocabulary below is the thing to edit when the system grows a new axis.
 *
 * The trade that makes explicit: the union is complete but permissive. Every real
 * token is assignable, and a few combinations it accepts are not defined. Keeping
 * this vocabulary and tokens.css describing the same system is a manual job — a
 * token whose name falls outside the grid below is unnameable in TypeScript even
 * though its utility compiles.
 *
 * To read a value, read the CSS: `var(--bg-brand)` in a stylesheet, or
 * `getComputedStyle(document.documentElement).getPropertyValue("--bg-brand")`
 * at runtime.
 */

// =============================================================================
// PRIMITIVES
// =============================================================================

/** Hex color value, e.g., "#6366f1" */
export type HexValue = string;

/**
 * HSL color value without wrapper, e.g., "239 84% 67%"
 *
 * @deprecated Tokens hold hex values and palette references, never bare HSL
 * triples. Kept only so the export surface stays stable.
 */
export type HSLValue = string;

/** Color mode */
export type ColorMode = "light" | "dark";

// =============================================================================
// VOCABULARY
// =============================================================================

/** Contexts - what CSS property this affects */
export const contexts = ["bg", "fg", "border"] as const;
export type Context = (typeof contexts)[number];

/** Hierarchy semantics - visual weight */
export const hierarchy = ["strong", "normal", "subtle"] as const;
export type Hierarchy = (typeof hierarchy)[number];

/** Feedback semantics - meaning */
export const feedback = ["success", "warning", "danger"] as const;
export type Feedback = (typeof feedback)[number];

/** All semantics */
export const semantics = [...hierarchy, ...feedback] as const;
export type Semantic = (typeof semantics)[number];

/** Every intent a token can carry, including the ones outside the grid above */
export const intents = [...semantics, "brand", "overlay"] as const;
export type Intent = (typeof intents)[number];

/** Weight modifiers, applied to brand and feedback intents */
export const weights = ["subtle", "strong"] as const;
export type Weight = (typeof weights)[number];

/** Interaction states */
export const states = ["hovered", "pressed", "disabled"] as const;
export type State = (typeof states)[number];

/** Tokens that are a category of one, outside the grid */
export const standaloneTokens = ["focus-ring"] as const;
export type StandaloneToken = (typeof standaloneTokens)[number];

// =============================================================================
// TOKEN NAMES
// =============================================================================

/** Intents that take a weight modifier — the hierarchy trio *is* the weight. */
type Weightable = Exclude<Intent, Hierarchy>;

/** `brand` | `brand-subtle` | `danger-strong` | ... */
type WeightedIntent = Intent | `${Weightable}-${Weight}`;

/** Any of the above, optionally in an interaction state */
type Stateful<T extends string> = T | `${T}-${State}`;

/** Background tokens */
export type BgToken = Stateful<`bg-${WeightedIntent}`>;

/** Foreground tokens, including the `fg-on-*` pairs */
export type FgToken = Stateful<`fg-${WeightedIntent}`> | Stateful<`fg-on-${WeightedIntent}`>;

/** Border tokens */
export type BorderToken = Stateful<`border-${WeightedIntent}`>;

/** Every token name the convention allows */
export type TokenName = BgToken | FgToken | BorderToken | StandaloneToken;

/** All color tokens */
export type ColorToken = TokenName;

/** CSS variable name format */
export type CSSVarName = `--${ColorToken}`;

/** @deprecated Use {@link BgToken}. */
export type BgKey = BgToken;
/** @deprecated Use {@link FgToken}. */
export type FgKey = FgToken;
/** @deprecated Use {@link BorderToken}. */
export type BorderKey = BorderToken;
/** @deprecated Use {@link TokenName}. */
export type TokenKey = TokenName;

// =============================================================================
// THEME SHAPE
// =============================================================================

/** A set of token values for one mode */
export type ColorModeSchema = Partial<Record<TokenName, HexValue>>;

/** A complete theme */
export type ThemeSchema = {
  name: string;
  version: string;
  light: ColorModeSchema;
  dark: ColorModeSchema;
};

// =============================================================================
// UTILITIES
// =============================================================================

/** Type-safe CSS var reference */
export function cssVar(token: ColorToken): string {
  return `var(--${token})`;
}

/**
 * Type-safe HSL wrapper for Tailwind
 *
 * @deprecated Token values are hex and palette references, so wrapping one in
 * `hsl()` yields invalid CSS. Use {@link cssVar}.
 */
export function hsl(token: ColorToken): string {
  return `hsl(var(--${token}))`;
}
