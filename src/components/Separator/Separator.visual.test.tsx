import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Separator.stories";

const { Horizontal, Vertical, WithLabel } = composeStories(stories);

describe("Separator", () => {
  test.for(THEMES)("horizontal - %s", async (theme) => {
    await expectScreenshot(<Horizontal />, "horizontal", theme);
  });

  test.for(THEMES)("vertical - %s", async (theme) => {
    await expectScreenshot(<Vertical />, "vertical", theme);
  });

  test.for(THEMES)("with label - %s", async (theme) => {
    await expectScreenshot(<WithLabel />, "with-label", theme);
  });
});
