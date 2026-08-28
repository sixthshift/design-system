import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./DateTimeRangePicker.stories";

const { WithDefaultValue, Invalid, Format24Hour } = composeStories(stories);

describe("DateTimeRangePicker", () => {
  test.for(THEMES)("with default value - %s", async (theme) => {
    await expectScreenshot(<WithDefaultValue />, "with-default-value", theme);
  });

  test.for(THEMES)("invalid - %s", async (theme) => {
    await expectScreenshot(<Invalid />, "invalid", theme);
  });

  test.for(THEMES)("format24 hour - %s", async (theme) => {
    await expectScreenshot(<Format24Hour />, "format24-hour", theme);
  });
});
