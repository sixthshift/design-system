import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Text.stories";

const { Colors, Sizes, Weights } = composeStories(stories);

describe("Text", () => {
  test.for(THEMES)("colors - %s", async (theme) => {
    await expectScreenshot(<Colors />, "colors", theme);
  });

  test.for(THEMES)("sizes - %s", async (theme) => {
    await expectScreenshot(<Sizes />, "sizes", theme);
  });

  test.for(THEMES)("weights - %s", async (theme) => {
    await expectScreenshot(<Weights />, "weights", theme);
  });
});
