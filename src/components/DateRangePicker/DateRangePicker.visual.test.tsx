import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./DateRangePicker.stories";

const { WithDefaultValue, Invalid, WithCustomPresets } = composeStories(stories);

describe("DateRangePicker", () => {
  test.for(THEMES)("with default value - %s", async (theme) => {
    await expectScreenshot(<WithDefaultValue />, "with-default-value", theme);
  });

  test.for(THEMES)("invalid - %s", async (theme) => {
    await expectScreenshot(<Invalid />, "invalid", theme);
  });

  test.for(THEMES)("with custom presets - %s", async (theme) => {
    await expectScreenshot(<WithCustomPresets />, "with-custom-presets", theme);
  });
});
