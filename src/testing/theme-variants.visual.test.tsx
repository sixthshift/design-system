/**
 * Functional guard for the alternative themes (src/theme/<name>/) and their
 * Storybook preview (.storybook/theme-preview.ts) — no screenshots. Asserts
 * the swap contract in a real browser: injecting a theme's variables
 * recolours a brand-solid Button in both modes, every theme is distinct, and
 * removal restores the shipped default exactly.
 */

import { Button } from "@sixthshift/design-system/button";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { applyThemeVariant, THEME_VARIANT_NAMES } from "../../.storybook/theme-preview";

const setMode = (mode: "light" | "dark") => {
  document.documentElement.dataset.theme = mode;
};

const brandButtonBg = () => {
  const { getByRole, unmount } = render(<Button intent="brand">Deploy</Button>);
  const bg = getComputedStyle(getByRole("button")).backgroundColor;
  unmount();
  return bg;
};

afterEach(() => {
  applyThemeVariant(undefined);
  delete document.documentElement.dataset.theme;
});

describe("theme variants", () => {
  it("ships all six derived themes", () => {
    expect(THEME_VARIANT_NAMES.sort()).toEqual(["contrast-locked", "expressive", "hue-anchored", "ink-led", "muted-workhorse", "seeded"]);
  });

  for (const mode of ["light", "dark"] as const) {
    it(`every theme recolours the brand solid in ${mode} mode, and removal restores the default`, () => {
      setMode(mode);
      const shipped = brandButtonBg();

      const seen = new Map<string, string>([["(default)", shipped]]);
      for (const theme of THEME_VARIANT_NAMES) {
        applyThemeVariant(theme);
        const bg = brandButtonBg();
        expect(bg, `theme "${theme}" (${mode}) must not render the shipped brand colour`).not.toBe(shipped);
        seen.set(theme, bg);
      }

      // Every theme is its own colour — a duplicate means two themes collide
      // or one failed to inject.
      expect(new Set(seen.values()).size).toBe(seen.size);

      applyThemeVariant(undefined);
      expect(brandButtonBg(), `removing the variant (${mode}) must restore the shipped default`).toBe(shipped);
    });
  }

  it("ink-led demonstrates the documented brand/strong collapse in light mode", () => {
    // plans/10: drawing brand from the neutral's dark end pulls bg-brand into
    // the same ramp bg-strong lives on. The theme ships that cost
    // deliberately; this pins it so it can't silently drift into hiding it.
    setMode("light");
    applyThemeVariant("ink-led");
    const styles = getComputedStyle(document.documentElement);
    // Custom properties come back substituted, so this compares final colours.
    expect(styles.getPropertyValue("--bg-brand").trim()).toBe(styles.getPropertyValue("--color-ink-900").trim());
    expect(styles.getPropertyValue("--bg-strong-hovered").trim()).toBe(styles.getPropertyValue("--bg-brand").trim());
  });

  it("each theme's semantic tokens resolve through its own family names", () => {
    // The pair contract: theme.css points at theme-local names, palette.css
    // defines them — a rename in one file without the other leaves tokens
    // unresolved (empty when read back).
    setMode("light");
    for (const [theme, family] of [
      ["hue-anchored", "sand"],
      ["contrast-locked", "gold"],
      ["seeded", "primary"],
      ["muted-workhorse", "teal"],
      ["expressive", "violet"],
    ] as const) {
      applyThemeVariant(theme);
      const styles = getComputedStyle(document.documentElement);
      expect(styles.getPropertyValue(`--color-${family}-600`).trim(), `${theme}: --color-${family}-600 must exist`).not.toBe("");
      expect(styles.getPropertyValue("--bg-brand").trim(), `${theme}: --bg-brand must resolve`).not.toBe("");
    }
  });

  it("stamps the theme identity", () => {
    applyThemeVariant("hue-anchored");
    expect(getComputedStyle(document.documentElement).getPropertyValue("--theme-name").trim()).toBe('"Hue-anchored"');
  });
});
