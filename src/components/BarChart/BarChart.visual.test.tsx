import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./BarChart.stories";

const { ActivityBreakdown, WithCustomColors, ThinBars } = composeStories(stories);

describe("BarChart", () => {
  test.for(THEMES)("activity breakdown - %s", async (theme) => {
    await expectScreenshot(<ActivityBreakdown />, "activity-breakdown", theme);
  });

  test.for(THEMES)("with custom colors - %s", async (theme) => {
    await expectScreenshot(<WithCustomColors />, "with-custom-colors", theme);
  });

  test.for(THEMES)("thin bars - %s", async (theme) => {
    await expectScreenshot(<ThinBars />, "thin-bars", theme);
  });
});
