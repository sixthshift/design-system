/**
 * Perceived lightness of a hex colour, on the same 0–1 axis the palette is
 * built on.
 *
 * The palette's construction is a claim about lightness — every family shares
 * one spine — and a page that only showed hex codes would be asking the reader
 * to take that on trust. This measures it back out of the shipped value, so the
 * numbers beside each swatch and the curve on the spine chart are derived from
 * the stylesheet rather than restated from the generator.
 *
 * Oklab's L for a neutral is the cube root of relative luminance, and the
 * chromatic error against a full Oklab transform is small enough (<0.02 at the
 * chroma this palette uses) that carrying the full matrix here would be
 * precision the page cannot display. Story-only, like everything under
 * `src/stories`.
 */

const channel = (srgb: number) => (srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4);

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => channel(Number.parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * (r as number) + 0.7152 * (g as number) + 0.0722 * (b as number);
}

/** Perceived lightness, 0–1. The axis the spine's eleven stops are fixed on. */
export function lightness(hex: string): number {
  return Math.cbrt(luminance(hex));
}

/**
 * Black or white, whichever clears AA against `hex` — the swatch labels use it.
 *
 * The crossover is where the two are equal, at luminance 0.179, and the winner
 * there still measures 4.58:1. So this always passes, which a translucent ink
 * does not: the labels were `rgba(0,0,0,.62)` at 70% opacity and axe caught
 * them at 3.13:1 on the lightest swatches. A page about contrast is a bad place
 * to fail a contrast check.
 */
export function inkOn(hex: string): string {
  return luminance(hex) > 0.179 ? "#000000" : "#ffffff";
}
