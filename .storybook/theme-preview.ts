/**
 * Runtime preview of the alternative themes (src/theme/<name>/) — the
 * workbench's Palette toolbar.
 *
 * A consumer imports exactly one theme, so the themes are deliberately not
 * scoped under any attribute — importing two would just cascade-clobber.
 * Storybook still wants to flip between them live, so this injects the chosen
 * theme's *variables* (palette.css + theme.css, plain `:root`/mode blocks,
 * no at-rules) into a managed `<style>` appended at the end of `<head>`,
 * where it out-cascades the compiled default at equal specificity. The
 * Tailwind config (src/theming/tailwind.css: `@theme` mapping, base layer) is theme-independent and already
 * compiled in via styles.css, and utilities read tokens through `var()`, so
 * swapping the variables is the whole job.
 *
 * "Default" removes the element entirely — what you see is exactly the
 * shipped default theme.
 */

import contrastLockedPalette from "../src/theme/contrast-locked/palette.css?raw";
import contrastLockedTheme from "../src/theme/contrast-locked/theme.css?raw";
import expressivePalette from "../src/theme/expressive/palette.css?raw";
import expressiveTheme from "../src/theme/expressive/theme.css?raw";
import hueAnchoredPalette from "../src/theme/hue-anchored/palette.css?raw";
import hueAnchoredTheme from "../src/theme/hue-anchored/theme.css?raw";
import inkLedPalette from "../src/theme/ink-led/palette.css?raw";
import inkLedTheme from "../src/theme/ink-led/theme.css?raw";
import mutedWorkhorsePalette from "../src/theme/muted-workhorse/palette.css?raw";
import mutedWorkhorseTheme from "../src/theme/muted-workhorse/theme.css?raw";
import seededPalette from "../src/theme/seeded/palette.css?raw";
import seededTheme from "../src/theme/seeded/theme.css?raw";

/** theme.css leads with `@import "./palette.css"` — mid-sheet @import is invalid CSS, and the palette is inlined ahead anyway. */
const stripImports = (css: string) => css.replace(/^@import [^\n]*\n/gm, "");

const VARIANTS: Record<string, string> = {
  "ink-led": `${inkLedPalette}\n${stripImports(inkLedTheme)}`,
  "hue-anchored": `${hueAnchoredPalette}\n${stripImports(hueAnchoredTheme)}`,
  "contrast-locked": `${contrastLockedPalette}\n${stripImports(contrastLockedTheme)}`,
  seeded: `${seededPalette}\n${stripImports(seededTheme)}`,
  "muted-workhorse": `${mutedWorkhorsePalette}\n${stripImports(mutedWorkhorseTheme)}`,
  expressive: `${expressivePalette}\n${stripImports(expressiveTheme)}`,
};

export const THEME_VARIANT_NAMES = Object.keys(VARIANTS);

const STYLE_ID = "theme-variant-preview";

/** Injects the named theme's variables; empty/unknown name restores the default. */
export function applyThemeVariant(name: string | undefined): void {
  const css = name ? VARIANTS[name] : undefined;
  const existing = document.getElementById(STYLE_ID);
  if (!css) {
    existing?.remove();
    return;
  }
  const element = existing ?? document.createElement("style");
  element.id = STYLE_ID;
  element.textContent = css;
  // (Re-)append so the sheet stays last in <head> — later source order is
  // what lets it beat the compiled default at equal specificity.
  document.head.appendChild(element);
}
