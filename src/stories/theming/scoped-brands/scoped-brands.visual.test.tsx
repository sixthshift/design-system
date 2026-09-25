/**
 * The sample theme is the documentation's claim about how scoped brands work,
 * so it is checked the way a consumer would check theirs: by what the browser
 * resolves, not by reading the CSS.
 *
 *   - the precedence rules the Theming page states (own element, ancestor,
 *     nested reset, unknown names) hold on real components;
 *   - `sea` resolves every brand token to exactly what Linen declares on
 *     `:root`, so the sample's saturated mapping is Linen's, token for token;
 *   - every pairing each sample brand declares clears contrast, in both modes.
 *     `check:contrast` only sees the library's own theme, so nothing else would.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../../testing/visual";
import linenTheme from "../../../theme/linen/theme.css?raw";
import { BRANDS } from "./brands";
import * as stories from "./ScopedBrands.stories";

const { Brands, Scopes } = composeStories(stories);

/** Every brand token Linen declares, in declaration order: the set a brand's mapping must cover. */
const BRAND_TOKENS = [...new Set(Array.from(linenTheme.matchAll(/(--(?:bg|fg|border)-(?:on-)?brand[\w-]*)\s*:/g), (match) => match[1] as string))];

/** A custom property as the browser resolves it on `element`, normalised to `rgb(…)`. */
function resolved(element: Element, token: string): string {
  const raw = getComputedStyle(element).getPropertyValue(token).trim();
  const probe = document.createElement("span");
  probe.style.color = raw;
  document.body.append(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return rgb;
}

const channels = (rgb: string) => (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);

function luminance(rgb: string): number {
  const [r = 0, g = 0, b = 0] = channels(rgb).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const button = (name: string) => screen.getByRole("button", { name });

describe("Scoped brands", () => {
  test.for(THEMES)("brands - %s", async (theme) => {
    await expectScreenshot(<Brands />, "brands", theme, { width: 960 });
  });

  test.for(THEMES)("scopes - %s", async (theme) => {
    await expectScreenshot(<Scopes />, "scopes", theme, { width: 960 });
  });

  test.for(THEMES)("precedence follows the nearest data-brand - %s", (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    render(<Scopes />);
    const card = screen.getByTestId("blush-card");
    const bg = (element: Element) => getComputedStyle(element).backgroundColor;

    const blush = resolved(card, "--bg-brand");
    const sea = resolved(card.parentElement as Element, "--bg-brand");
    expect(blush).not.toBe(sea);

    expect(bg(button("Add to cart"))).toBe(blush);
    expect(bg(button("Fern wins on its own element"))).not.toBe(blush);
    expect(bg(button("Back to the default"))).toBe(sea);
    expect(bg(button("A typo inherits blush"))).toBe(blush);
    expect(bg(button("At the top level it is the default"))).toBe(sea);
  });

  test.for(THEMES)("sea resolves all %s brand tokens to Linen's own values", (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    render(<div data-brand="sea" data-testid="sea" />);
    expect(BRAND_TOKENS).toHaveLength(40);
    const scoped = screen.getByTestId("sea");
    for (const token of BRAND_TOKENS) {
      expect.soft(resolved(scoped, token), token).toBe(resolved(document.documentElement, token));
    }
  });

  describe.for(THEMES)("contrast - %s", (theme) => {
    test.for(BRANDS)("%s clears AA on every pairing it declares", (brand) => {
      document.documentElement.setAttribute("data-theme", theme);
      render(<div data-brand={brand} data-testid="scope" />);
      const scope = screen.getByTestId("scope");
      const at = (token: string) => resolved(scope, token);

      // The same pairing rules check:contrast holds the library's theme to, with
      // `-disabled` exempt (WCAG 1.4.3), plus 3:1 for the non-subtle borders.
      for (const token of BRAND_TOKENS.filter((name) => !name.endsWith("-disabled"))) {
        if (token.startsWith("--bg-brand")) {
          const text = token.replace("--bg-", "--fg-on-");
          expect.soft(contrast(at(token), at(text)), `${text} on ${token}`).toBeGreaterThanOrEqual(4.5);
        } else if (token.startsWith("--fg-brand")) {
          for (const surface of ["--bg-normal", "--bg-subtle"]) {
            expect.soft(contrast(at(token), at(surface)), `${token} on ${surface}`).toBeGreaterThanOrEqual(4.5);
          }
        } else if (/^--border-brand(-strong)?(-hovered|-pressed)?$/.test(token)) {
          expect.soft(contrast(at(token), at("--bg-normal")), `${token} on --bg-normal`).toBeGreaterThanOrEqual(3);
        }
      }
    });
  });
});
