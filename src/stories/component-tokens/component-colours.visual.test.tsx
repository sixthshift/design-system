/**
 * Every colour every component paints, as text, held against a committed file.
 *
 * The screenshot suite cannot see a hue change between two colours at the same
 * lightness: pixelmatch's per-pixel threshold absorbs it (docs/component-axes.md,
 * Implementation notes). ProgressBar's dark fill going green-300 → blue-300
 * passed every screenshot. This test closes that gap from the other side — no
 * pixels, just the computed colour of each component token, for every recipe
 * cell, expanded per intent exactly as the Component tokens tables are, in both
 * modes. Any colour change at all is a one-line diff here, named by component,
 * cell and token, and nothing about it can flake.
 *
 * Screenshots still own shape and layout; this owns colour.
 *
 * To accept an intended change: `bun run test:visual:update`, then review the
 * diff of __snapshots__/component-colours.txt like any other.
 *
 * Browser project, because resolution is the browser's cascade (see
 * `resolveCell`).
 */

import { expect, it } from "vitest";
import { readTokens } from "../theme/read-tokens";
import { modeVarsFrom, readIntents, readRecipes, resolveCell, rowsFor } from "./read-recipes";

/** `rgb(185, 28, 28)` → `rgb(185,28,28)`, so columns stay narrow and diffs stay on one line. */
const compact = (colour: string) => colour.replace(/\s+/g, "");

it("every component token resolves to the committed colour, in both modes", async () => {
  const light = modeVarsFrom(readTokens("light"));
  const dark = modeVarsFrom(readTokens("dark"));
  const intents = readIntents();
  const recipes = readRecipes();

  // A sanity floor: an empty stylesheet would otherwise snapshot as an empty file.
  expect(recipes.length).toBeGreaterThan(20);
  expect(intents).toEqual(expect.arrayContaining(["neutral", "brand", "danger", "success", "warning"]));

  const lines: string[] = [];
  for (const recipe of recipes) {
    lines.push(`.${recipe.hook}`);
    for (const row of rowsFor(recipe.floor, recipe.cells, intents)) {
      const inLight = resolveCell(recipe.hook, row.attrs, recipe.tokens, light);
      const inDark = resolveCell(recipe.hook, row.attrs, recipe.tokens, dark);
      for (const token of recipe.tokens) {
        const show = (mode: typeof inLight) => (mode[token]?.unset ? "unset" : compact(mode[token]?.colour ?? "?"));
        lines.push(`  ${row.label.padEnd(24)} ${token.padEnd(40)} ${show(inLight).padEnd(20)} ${show(inDark)}`);
      }
    }
  }

  await expect(`${lines.join("\n")}\n`).toMatchFileSnapshot("__snapshots__/component-colours.txt");
});
