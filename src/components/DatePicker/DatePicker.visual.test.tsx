import { describe, test } from "vitest";
import { composeStories, expectScreenshot, expectViewportScreenshot, openByClick, THEMES } from "../../testing/visual";
import * as stories from "./DatePicker.stories";

const { WithDefaultValue, Invalid } = composeStories(stories);

describe("DatePicker", () => {
  // Closed: the segmented field is the component's resting state.
  test.for(THEMES)("with default value - %s", async (theme) => {
    await expectScreenshot(<WithDefaultValue />, "with-default-value", theme);
  });

  test.for(THEMES)("invalid - %s", async (theme) => {
    await expectScreenshot(<Invalid />, "invalid", theme);
  });

  // Open: the calendar is portalled, so only a viewport shot reaches it. The
  // clock is pinned in vitest.setup.visual.ts, which is what makes the month
  // grid and its today ring reproducible. Single mode deliberately — the range
  // stories carry one "Open calendar for ..." button per field.
  test.for(THEMES)("with default value open - %s", async (theme) => {
    await expectViewportScreenshot(<WithDefaultValue />, "with-default-value-open", theme, openByClick("Open calendar", { role: "dialog" }));
  });
});
