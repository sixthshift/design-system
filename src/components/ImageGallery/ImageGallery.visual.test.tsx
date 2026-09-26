import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./ImageGallery.stories";

const { Default, AllRatios, EdgeCases } = composeStories(stories);

describe("ImageGallery", () => {
  test.for(THEMES)("default - %s", async (theme) => {
    await expectScreenshot(<Default />, "default", theme);
  });

  test.for(THEMES)("all ratios - %s", async (theme) => {
    await expectScreenshot(<AllRatios />, "all-ratios", theme);
  });

  test.for(THEMES)("edge cases - %s", async (theme) => {
    await expectScreenshot(<EdgeCases />, "edge-cases", theme);
  });
});
