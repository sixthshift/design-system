/**
 * The token documentation stories read their data out of the stylesheet at
 * runtime, which means a change that stops a token being emitted turns those
 * stories blank rather than failing anything. Storybook's own tests would not
 * notice: an empty table still renders and still passes axe.
 *
 * This is the check that would. It runs in the browser project because the
 * CSSOM is the thing under test.
 */

import { describe, expect, it } from "vitest";
import { readFonts, readIdentity, readPalette, readResolvedTokens, readTokens } from "./read-tokens";

describe("reading tokens from the stylesheet", () => {
  it("finds the theme identity", () => {
    const { name, version } = readIdentity();
    expect(name).toBeTruthy();
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("finds the same token set in both modes", () => {
    const light = Object.keys(readTokens("light"));
    const dark = Object.keys(readTokens("dark"));

    expect(light.length).toBeGreaterThan(100);
    expect(new Set(dark)).toEqual(new Set(light));
  });

  it("keeps palette references intact, and can resolve them", () => {
    const authored = readTokens("light");
    const resolved = readResolvedTokens("light");

    expect(authored["bg-brand"]).toMatch(/^var\(--color-/);
    expect(resolved["bg-brand"]).toMatch(/^#|^rgb/);
  });

  it("reads the token the focus ring depends on", () => {
    // Defined in tokens.css but dropped by the old generator, so every focus
    // ring in the library rendered as `currentcolor`. Worth pinning.
    expect(readTokens("light")["focus-ring"]).toBeTruthy();
    expect(readTokens("dark")["focus-ring"]).toBeTruthy();
  });

  it("finds every palette scale with a full set of steps", () => {
    const palette = readPalette();
    const scales = Object.keys(palette);

    expect(scales.length).toBeGreaterThan(1);
    for (const scale of scales) {
      expect(Object.keys(palette[scale] ?? {}).length).toBeGreaterThanOrEqual(11);
      expect(palette[scale]?.["500"]).toMatch(/^#/);
    }
  });

  it("finds the font stacks", () => {
    const fonts = readFonts();
    expect(fonts.sans).toBeTruthy();
    expect(fonts.mono).toBeTruthy();
  });
});
