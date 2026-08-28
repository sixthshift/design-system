import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./LineChart.stories";

const { MultipleSeries, WithArea, ColorSegmentedLine } = composeStories(stories);

describe("LineChart", () => {
  test.for(THEMES)("multiple series - %s", async (theme) => {
    await expectScreenshot(<MultipleSeries />, "multiple-series", theme);
  });

  test.for(THEMES)("with area - %s", async (theme) => {
    await expectScreenshot(<WithArea />, "with-area", theme);
  });

  test.for(THEMES)("color segmented line - %s", async (theme) => {
    await expectScreenshot(<ColorSegmentedLine />, "color-segmented-line", theme);
  });
});
