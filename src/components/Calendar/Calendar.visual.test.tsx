import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Calendar.stories";

const { SingleMode, RangeModeWithInitialValue, DisabledRange } = composeStories(stories);

describe("Calendar", () => {
  test.for(THEMES)("single mode - %s", async (theme) => {
    await expectScreenshot(<SingleMode />, "single-mode", theme);
  });

  test.for(THEMES)("range mode with initial value - %s", async (theme) => {
    await expectScreenshot(<RangeModeWithInitialValue />, "range-mode-with-initial-value", theme);
  });

  test.for(THEMES)("disabled range - %s", async (theme) => {
    await expectScreenshot(<DisabledRange />, "disabled-range", theme);
  });
});
