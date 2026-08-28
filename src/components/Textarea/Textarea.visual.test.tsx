import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Textarea.stories";

const { WithValue, Disabled, MaxLength } = composeStories(stories);

describe("Textarea", () => {
  test.for(THEMES)("with value - %s", async (theme) => {
    await expectScreenshot(<WithValue />, "with-value", theme);
  });

  test.for(THEMES)("disabled - %s", async (theme) => {
    await expectScreenshot(<Disabled />, "disabled", theme);
  });

  test.for(THEMES)("max length - %s", async (theme) => {
    await expectScreenshot(<MaxLength />, "max-length", theme);
  });
});
