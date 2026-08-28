import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Spinner.stories";

const { AllSizes, WithText, CustomColor } = composeStories(stories);

describe("Spinner", () => {
  test.for(THEMES)("all sizes - %s", async (theme) => {
    await expectScreenshot(<AllSizes />, "all-sizes", theme);
  });

  test.for(THEMES)("with text - %s", async (theme) => {
    await expectScreenshot(<WithText />, "with-text", theme);
  });

  test.for(THEMES)("custom color - %s", async (theme) => {
    await expectScreenshot(<CustomColor />, "custom-color", theme);
  });
});
