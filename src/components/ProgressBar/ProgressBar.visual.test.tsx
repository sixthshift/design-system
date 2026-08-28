import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./ProgressBar.stories";

const { Stages, InListContext, ZeroTotal } = composeStories(stories);

describe("ProgressBar", () => {
  test.for(THEMES)("stages - %s", async (theme) => {
    await expectScreenshot(<Stages />, "stages", theme);
  });

  test.for(THEMES)("in list context - %s", async (theme) => {
    await expectScreenshot(<InListContext />, "in-list-context", theme);
  });

  test.for(THEMES)("zero total - %s", async (theme) => {
    await expectScreenshot(<ZeroTotal />, "zero-total", theme);
  });
});
