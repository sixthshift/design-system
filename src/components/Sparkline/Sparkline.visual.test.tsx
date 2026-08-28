import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Sparkline.stories";

const { WithArea, InlineWithText, FlatLine } = composeStories(stories);

describe("Sparkline", () => {
  test.for(THEMES)("with area - %s", async (theme) => {
    await expectScreenshot(<WithArea />, "with-area", theme);
  });

  test.for(THEMES)("inline with text - %s", async (theme) => {
    await expectScreenshot(<InlineWithText />, "inline-with-text", theme);
  });

  test.for(THEMES)("flat line - %s", async (theme) => {
    await expectScreenshot(<FlatLine />, "flat-line", theme);
  });
});
