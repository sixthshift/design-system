/**
 * Theme Schema
 *
 * Type definitions for the PA design system token structure.
 * These types enforce the naming convention: {context}-{semantic}
 */

// =============================================================================
// PRIMITIVES
// =============================================================================

/** HSL color value without wrapper, e.g., "239 84% 67%" */
export type HSLValue = string;

/** Hex color value, e.g., "#6366f1" */
export type HexValue = string;

/** Color mode */
export type ColorMode = "light" | "dark";

// =============================================================================
// TOKEN STRUCTURE
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

// =============================================================================
// TOKEN NAMES (derived types)
// =============================================================================

/** Background tokens: bg-{semantic} */
export type BgToken = `bg-${Semantic}`;

/** Foreground tokens: fg-{semantic} | fg-on-{semantic} */
export type FgToken = `fg-${Semantic}` | `fg-on-${Semantic}`;

/** Border tokens: border-{semantic} */
export type BorderToken = `border-${Semantic}`;

/** All color tokens */
export type ColorToken = BgToken | FgToken | BorderToken;

/** CSS variable name format */
export type CSSVarName = `--${ColorToken}`;

// =============================================================================
// THEME SCHEMA
// =============================================================================

/** Background token keys */
export type BgKey = `bg-${Semantic}`;

/** Foreground token keys */
export type FgKey = `fg-${Semantic}` | `fg-on-${Semantic}`;

/** Border token keys */
export type BorderKey = `border-${Semantic}`;

/** All token keys */
export type TokenKey = BgKey | FgKey | BorderKey;

/** Color mode schema (light or dark) - flat structure */
export type ColorModeSchema = {
  [K in TokenKey]: HexValue;
};

/** Complete theme schema */
export type ThemeSchema = {
  $schema?: string;
  name: string;
  version: string;
  light: ColorModeSchema;
  dark: ColorModeSchema;
};

// =============================================================================
// UTILITIES
// =============================================================================

/** Get all token names for a context */
export function getTokenNames(context: "bg"): BgToken[];
export function getTokenNames(context: "fg"): FgToken[];
export function getTokenNames(context: "border"): BorderToken[];
export function getTokenNames(context: Context): ColorToken[] {
  switch (context) {
    case "bg":
      return semantics.map((s) => `bg-${s}` as BgToken);
    case "fg":
      return [...semantics.map((s) => `fg-${s}` as FgToken), ...semantics.map((s) => `fg-on-${s}` as FgToken)];
    case "border":
      return semantics.map((s) => `border-${s}` as BorderToken);
  }
}

/** Get all token names */
export function getAllTokenNames(): ColorToken[] {
  return [...getTokenNames("bg"), ...getTokenNames("fg"), ...getTokenNames("border")];
}

/** Type-safe CSS var reference */
export function cssVar(token: ColorToken): string {
  return `var(--${token})`;
}

/** Type-safe HSL wrapper for Tailwind */
export function hsl(token: ColorToken): string {
  return `hsl(var(--${token}))`;
}
