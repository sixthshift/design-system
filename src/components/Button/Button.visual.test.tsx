import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Button.stories";

const { VariantIntentMatrix, AllSizes, States } = composeStories(stories);

describe("Button", () => {
  test.for(THEMES)("variant/intent matrix - %s", async (theme) => {
    await expectScreenshot(<VariantIntentMatrix />, "variant-intent-matrix", theme);
  });

  test.for(THEMES)("all sizes - %s", async (theme) => {
    await expectScreenshot(<AllSizes />, "all-sizes", theme);
  });

  test.for(THEMES)("states - %s", async (theme) => {
    await expectScreenshot(<States />, "states", theme);
  });
});
