import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./DateTimePicker.stories";

const { WithDefaultValue, Invalid, WithSeconds } = composeStories(stories);

describe("DateTimePicker", () => {
  test.for(THEMES)("with default value - %s", async (theme) => {
    await expectScreenshot(<WithDefaultValue />, "with-default-value", theme);
  });

  test.for(THEMES)("invalid - %s", async (theme) => {
    await expectScreenshot(<Invalid />, "invalid", theme);
  });

  test.for(THEMES)("with seconds - %s", async (theme) => {
    await expectScreenshot(<WithSeconds />, "with-seconds", theme);
  });
});
